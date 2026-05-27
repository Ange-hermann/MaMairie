// ═══════════════════════════════════════════════════════════════
// HELPERS D'AUDIT PAR RÔLE
// Plateforme MaMairie - République de Côte d'Ivoire
// ═══════════════════════════════════════════════════════════════

import { logAudit } from './audit'
import type { AuditActionType, AuditActionDetails } from '@/types/audit'
import { NextRequest } from 'next/server'

// ═══════════════════════════════════════════════════════════════
// AUTHENTIFICATION
// ═══════════════════════════════════════════════════════════════

export async function logAuth(
  action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'PASSWORD_RESET',
  user: {
    id?: string
    email: string
    role?: string
    nom?: string
  },
  request?: NextRequest | Request,
  details?: AuditActionDetails
) {
  const actionType: AuditActionType = `AUTH_${action}` as AuditActionType
  const statut = action === 'LOGIN_FAILED' ? 'FAILED' : 'SUCCESS'

  await logAudit({
    actionType,
    userId: user.id,
    userEmail: user.email,
    userRole: user.role as any,
    userNom: user.nom,
    actionDetails: details,
    statut,
    message: action === 'LOGIN_SUCCESS' 
      ? `Connexion réussie pour ${user.email}`
      : action === 'LOGIN_FAILED'
      ? `Échec de connexion pour ${user.email}`
      : action === 'LOGOUT'
      ? `Déconnexion de ${user.email}`
      : `Réinitialisation mot de passe pour ${user.email}`,
    request,
  })
}

// ═══════════════════════════════════════════════════════════════
// ACTIONS CITOYEN
// ═══════════════════════════════════════════════════════════════

export async function logCitoyen(
  action: 'DEMANDE_CREEE' | 'DEMANDE_ANNULEE' | 'DECLARATION_CREEE' | 'MENTION_SOUMISE' | 'PAIEMENT_EFFECTUE',
  citoyen: {
    id: string
    email: string
    nom: string
  },
  entite: {
    type: string
    id?: string
    reference?: string
  },
  request?: NextRequest | Request,
  details?: AuditActionDetails
) {
  const actionType: AuditActionType = `CITOYEN_${action}` as AuditActionType

  await logAudit({
    actionType,
    userId: citoyen.id,
    userEmail: citoyen.email,
    userRole: 'citoyen',
    userNom: citoyen.nom,
    entiteType: entite.type,
    entiteId: entite.id,
    entiteReference: entite.reference,
    actionDetails: details,
    statut: 'SUCCESS',
    message: `${citoyen.nom} - ${action.toLowerCase().replace(/_/g, ' ')}`,
    request,
  })
}

// ═══════════════════════════════════════════════════════════════
// ACTIONS AGENT
// ═══════════════════════════════════════════════════════════════

export async function logAgent(
  action: 'DEMANDE_APPROUVEE' | 'DEMANDE_REJETEE' | 'ACTE_CREE' | 'ACTE_MODIFIE' | 'MENTION_APPROUVEE' | 'MENTION_REJETEE' | 'PDF_GENERE' | 'DOCUMENTS_VERIFIES',
  agent: {
    id: string
    email: string
    nom: string
  },
  entite: {
    type: string
    id?: string
    reference?: string
  },
  avant?: Record<string, any>,
  apres?: Record<string, any>,
  request?: NextRequest | Request,
  metadata?: Record<string, any>
) {
  const actionType: AuditActionType = `AGENT_${action}` as AuditActionType

  await logAudit({
    actionType,
    userId: agent.id,
    userEmail: agent.email,
    userRole: 'agent',
    userNom: agent.nom,
    entiteType: entite.type,
    entiteId: entite.id,
    entiteReference: entite.reference,
    actionDetails: {
      avant,
      apres,
      metadata,
    },
    statut: 'SUCCESS',
    message: `Agent ${agent.nom} - ${action.toLowerCase().replace(/_/g, ' ')} - ${entite.reference || entite.id}`,
    request,
  })
}

// ═══════════════════════════════════════════════════════════════
// ACTIONS MINISTÈRE
// ═══════════════════════════════════════════════════════════════

export async function logMinistere(
  action: 'ACTE_VERIFIE' | 'ALERTE_CREEE' | 'RAPPORT_EXPORTE' | 'MAIRIE_CREEE' | 'AGENT_CREE' | 'STATISTIQUES_CONSULTEES',
  user: {
    id: string
    email: string
    nom: string
  },
  entite?: {
    type?: string
    id?: string
    reference?: string
  },
  request?: NextRequest | Request,
  details?: AuditActionDetails
) {
  const actionType: AuditActionType = `MINISTERE_${action}` as AuditActionType

  await logAudit({
    actionType,
    userId: user.id,
    userEmail: user.email,
    userRole: 'ministere',
    userNom: user.nom,
    entiteType: entite?.type,
    entiteId: entite?.id,
    entiteReference: entite?.reference,
    actionDetails: details,
    statut: 'SUCCESS',
    message: `Ministère - ${user.nom} - ${action.toLowerCase().replace(/_/g, ' ')}`,
    request,
  })
}

// ═══════════════════════════════════════════════════════════════
// DÉTECTION FRAUDE
// ═══════════════════════════════════════════════════════════════

export async function logFraude(
  type: 'TENTATIVE_DETECTEE' | 'ALERTE_DECLENCHEE' | 'ACTE_INVALIDE' | 'QR_INVALIDE',
  details: {
    description: string
    entiteType?: string
    entiteId?: string
    entiteReference?: string
    userId?: string
    userEmail?: string
    metadata?: Record<string, any>
  },
  request?: NextRequest | Request
) {
  const actionType: AuditActionType = `FRAUDE_${type}` as AuditActionType

  await logAudit({
    actionType,
    userId: details.userId,
    userEmail: details.userEmail,
    entiteType: details.entiteType,
    entiteId: details.entiteId,
    entiteReference: details.entiteReference,
    actionDetails: {
      metadata: {
        ...details.metadata,
        description: details.description,
      },
    },
    statut: 'WARNING',
    message: `🚨 FRAUDE: ${details.description}`,
    request,
  })
}

// ═══════════════════════════════════════════════════════════════
// HELPERS SPÉCIFIQUES
// ═══════════════════════════════════════════════════════════════

/**
 * Log pour approbation de demande d'extrait
 */
export async function logApprobationDemande(
  agent: { id: string; email: string; nom: string },
  demande: { id: string; code_suivi: string; statut_avant: string },
  request?: NextRequest | Request
) {
  await logAgent(
    'DEMANDE_APPROUVEE',
    agent,
    { type: 'demande_extrait', id: demande.id, reference: demande.code_suivi },
    { statut: demande.statut_avant },
    { statut: 'approuvee', agent_id: agent.id, date_approbation: new Date().toISOString() },
    request
  )
}

/**
 * Log pour rejet de demande
 */
export async function logRejetDemande(
  agent: { id: string; email: string; nom: string },
  demande: { id: string; code_suivi: string; statut_avant: string },
  motif: string,
  request?: NextRequest | Request
) {
  await logAgent(
    'DEMANDE_REJETEE',
    agent,
    { type: 'demande_extrait', id: demande.id, reference: demande.code_suivi },
    { statut: demande.statut_avant },
    { statut: 'rejetee', motif, agent_id: agent.id, date_rejet: new Date().toISOString() },
    request
  )
}

/**
 * Log pour création d'acte
 */
export async function logCreationActe(
  agent: { id: string; email: string; nom: string },
  acte: { id: string; type: string; numero_acte: string; nom_enfant?: string },
  request?: NextRequest | Request
) {
  await logAgent(
    'ACTE_CREE',
    agent,
    { type: `acte_${acte.type}`, id: acte.id, reference: acte.numero_acte },
    undefined,
    { 
      type_acte: acte.type, 
      numero_acte: acte.numero_acte,
      nom_enfant: acte.nom_enfant,
      agent_id: agent.id,
      date_creation: new Date().toISOString()
    },
    request
  )
}

/**
 * Log pour génération PDF
 */
export async function logGenerationPDF(
  agent: { id: string; email: string; nom: string },
  acte: { id: string; type: string; numero_acte: string },
  request?: NextRequest | Request
) {
  await logAgent(
    'PDF_GENERE',
    agent,
    { type: `acte_${acte.type}`, id: acte.id, reference: acte.numero_acte },
    undefined,
    { 
      type_acte: acte.type,
      numero_acte: acte.numero_acte,
      agent_id: agent.id,
      date_generation: new Date().toISOString()
    },
    request
  )
}

/**
 * Log pour vérification QR Code invalide
 */
export async function logQRInvalide(
  qrData: string,
  raison: string,
  request?: NextRequest | Request
) {
  await logFraude(
    'QR_INVALIDE',
    {
      description: `QR Code invalide scanné: ${raison}`,
      metadata: {
        qr_data: qrData,
        raison,
      },
    },
    request
  )
}
