// ═══════════════════════════════════════════════════════════════
// FONCTION CENTRALE D'AUDIT
// Plateforme MaMairie - République de Côte d'Ivoire
// ═══════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'
import type { AuditLogParams, AuditActionDetails } from '@/types/audit'
import { NextRequest } from 'next/server'

// Client Supabase avec service role pour bypass RLS
// Créé uniquement si les variables sont disponibles (côté serveur)
const supabaseAdmin = typeof window === 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null

/**
 * Extrait l'adresse IP depuis les headers de la requête
 */
function extractIpAddress(request?: NextRequest | Request): string | null {
  if (!request) return null

  const headers = request.headers

  // Essayer différentes sources d'IP
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Prendre la première IP si plusieurs
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = headers.get('x-real-ip')
  if (realIp) return realIp

  // Fallback pour Next.js
  if ('ip' in request && typeof request.ip === 'string') {
    return request.ip
  }

  return null
}

/**
 * Extrait le User-Agent depuis les headers
 */
function extractUserAgent(request?: NextRequest | Request): string | null {
  if (!request) return null
  return request.headers.get('user-agent')
}

/**
 * Extrait le session ID depuis les cookies Supabase
 */
function extractSessionId(request?: NextRequest | Request): string | null {
  if (!request) return null

  const cookies = request.headers.get('cookie')
  if (!cookies) return null

  // Chercher le cookie de session Supabase
  const match = cookies.match(/sb-[^=]+-auth-token=([^;]+)/)
  if (match && match[1]) {
    try {
      const decoded = JSON.parse(decodeURIComponent(match[1]))
      return decoded.access_token?.substring(0, 20) || null
    } catch {
      return null
    }
  }

  return null
}

/**
 * FONCTION PRINCIPALE : Enregistre une action dans le journal d'audit
 * 
 * Cette fonction ne doit JAMAIS faire échouer l'action principale.
 * Tous les erreurs sont catchées et loguées silencieusement.
 */
export async function logAudit(params: AuditLogParams & { request?: NextRequest | Request }): Promise<void> {
  try {
    // Si supabaseAdmin n'est pas disponible (côté client), ne rien faire
    if (!supabaseAdmin) {
      console.warn('[AUDIT] Client admin non disponible (côté client), log ignoré')
      return
    }

    const {
      actionType,
      userId,
      userEmail,
      userRole,
      userNom,
      entiteType,
      entiteId,
      entiteReference,
      actionDetails = {},
      statut = 'SUCCESS',
      message,
      request,
    } = params

    // Extraire les informations de la requête
    const ipAddress = params.ipAddress || extractIpAddress(request)
    const userAgent = params.userAgent || extractUserAgent(request)
    const sessionId = params.sessionId || extractSessionId(request)

    // Insérer dans audit_logs (via service role pour bypass RLS)
    const { error } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        action_type: actionType,
        user_id: userId || null,
        user_email: userEmail || null,
        user_role: userRole || null,
        user_nom: userNom || null,
        ip_address: ipAddress,
        user_agent: userAgent,
        session_id: sessionId,
        entite_type: entiteType || null,
        entite_id: entiteId || null,
        entite_reference: entiteReference || null,
        action_details: actionDetails,
        statut,
        message: message || null,
      })

    if (error) {
      console.error('❌ [AUDIT] Erreur lors de l\'enregistrement:', error)
    } else {
      console.log(`✅ [AUDIT] ${actionType} - ${userEmail || 'Anonyme'} - ${statut}`)
    }

    // Si c'est une tentative de fraude, vérifier si on doit bloquer l'IP
    if (actionType.startsWith('FRAUDE_') && ipAddress) {
      await verifierTentativesFraude(ipAddress)
    }

  } catch (error) {
    // NE JAMAIS faire échouer l'action principale
    console.error('❌ [AUDIT] Exception non gérée:', error)
  }
}

/**
 * Vérifie si une IP a trop de tentatives suspectes et la bloque si nécessaire
 */
async function verifierTentativesFraude(ipAddress: string): Promise<void> {
  try {
    if (!supabaseAdmin) return
    
    // Compter les tentatives échouées dans la dernière heure
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select('id')
      .eq('ip_address', ipAddress)
      .eq('statut', 'FAILED')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())

    if (error) {
      console.error('❌ [AUDIT] Erreur vérification fraude:', error)
      return
    }

    const nbTentatives = data?.length || 0

    // Si plus de 10 tentatives échouées en 1h, bloquer l'IP
    if (nbTentatives >= 10) {
      const { error: blockError } = await supabaseAdmin
        .from('ip_bloquees')
        .upsert({
          ip_address: ipAddress,
          raison: `Blocage automatique: ${nbTentatives} tentatives suspectes en 1h`,
          expire_le: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
          statut: 'active',
        }, {
          onConflict: 'ip_address'
        })

      if (!blockError) {
        console.warn(`🚨 [AUDIT] IP bloquée automatiquement: ${ipAddress}`)
      }
    }
  } catch (error) {
    console.error('❌ [AUDIT] Exception vérification fraude:', error)
  }
}

/**
 * Vérifie si une IP est bloquée
 */
export async function isIpBloquee(ipAddress: string): Promise<boolean> {
  try {
    if (!supabaseAdmin) return false
    
    const { data, error } = await supabaseAdmin
      .from('ip_bloquees')
      .select('id')
      .eq('ip_address', ipAddress)
      .eq('statut', 'active')
      .gt('expire_le', new Date().toISOString())
      .single()

    return !error && !!data
  } catch {
    return false
  }
}

/**
 * Crée ou met à jour une session active
 */
export async function updateSessionActive(
  userId: string,
  userEmail: string,
  userRole: string,
  request?: NextRequest | Request
): Promise<void> {
  try {
    if (!supabaseAdmin) return
    
    const ipAddress = extractIpAddress(request)
    const userAgent = extractUserAgent(request)

    await supabaseAdmin
      .from('sessions_actives')
      .upsert({
        user_id: userId,
        user_email: userEmail,
        user_role: userRole,
        ip_address: ipAddress,
        user_agent: userAgent,
        last_activity: new Date().toISOString(),
        statut: 'active',
      }, {
        onConflict: 'user_id',
      })
  } catch (error) {
    console.error('❌ [AUDIT] Erreur update session:', error)
  }
}

/**
 * Termine une session active
 */
export async function endSessionActive(userId: string): Promise<void> {
  try {
    if (!supabaseAdmin) return
    
    await supabaseAdmin
      .from('sessions_actives')
      .update({
        ended_at: new Date().toISOString(),
        statut: 'terminated',
      })
      .eq('user_id', userId)
      .eq('statut', 'active')
  } catch (error) {
    console.error('❌ [AUDIT] Erreur end session:', error)
  }
}

/**
 * Récupère les statistiques d'audit pour le dashboard
 */
export async function getAuditStats() {
  try {
    if (!supabaseAdmin) {
      return {
        totalAujourdhui: 0,
        tentativesEchouees: 0,
        alertesFraude: 0,
        utilisateursConnectes: 0,
      }
    }
    
    const aujourdhui = new Date()
    aujourdhui.setHours(0, 0, 0, 0)

    // Total actions aujourd'hui
    const { count: totalAujourdhui } = await supabaseAdmin
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', aujourdhui.toISOString())

    // Tentatives échouées aujourd'hui
    const { count: tentativesEchouees } = await supabaseAdmin
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('statut', 'FAILED')
      .gte('created_at', aujourdhui.toISOString())

    // Alertes fraude actives
    const { count: alertesFraude } = await supabaseAdmin
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .like('action_type', 'FRAUDE_%')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    // Utilisateurs connectés
    const { count: utilisateursConnectes } = await supabaseAdmin
      .from('sessions_actives')
      .select('*', { count: 'exact', head: true })
      .eq('statut', 'active')

    return {
      totalAujourdhui: totalAujourdhui || 0,
      tentativesEchouees: tentativesEchouees || 0,
      alertesFraude: alertesFraude || 0,
      utilisateursConnectes: utilisateursConnectes || 0,
    }
  } catch (error) {
    console.error('❌ [AUDIT] Erreur stats:', error)
    return {
      totalAujourdhui: 0,
      tentativesEchouees: 0,
      alertesFraude: 0,
      utilisateursConnectes: 0,
    }
  }
}
