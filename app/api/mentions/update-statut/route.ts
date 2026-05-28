import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { logAgent } from '@/lib/auditHelpers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Récupérer l'agent connecté
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: agent } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!agent || agent.role !== 'agent') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { mentionId, action, motifRejet, observations } = await request.json()

    if (!mentionId || !action) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    // Récupérer l'avis de mention
    const { data: mention, error: mentionError } = await supabase
      .from('avis_mentions')
      .select('*')
      .eq('id', mentionId)
      .single()

    if (mentionError || !mention) {
      return NextResponse.json(
        { error: 'Avis de mention introuvable' },
        { status: 404 }
      )
    }

    const ancienStatut = mention.statut

    // Mettre à jour l'avis de mention
    const updateData: any = {
      agent_id: agent.id
    }

    if (action === 'approuver') {
      updateData.statut = 'approuvee'
    } else if (action === 'rejeter') {
      updateData.statut = 'rejetee'
      updateData.motif_rejet = motifRejet
    }

    const { error: updateError } = await supabase
      .from('avis_mentions')
      .update(updateData)
      .eq('id', mentionId)

    if (updateError) {
      throw updateError
    }

    // Logger l'action dans l'audit
    const auditAction = action === 'approuver' ? 'MENTION_APPROUVEE' : 'MENTION_REJETEE'

    await logAgent(
      auditAction,
      {
        id: agent.id,
        email: agent.email,
        nom: `${agent.prenom} ${agent.nom}`
      },
      {
        type: 'avis_mention',
        id: mentionId,
        reference: mention.numero_acte
      },
      { statut: ancienStatut }, // avant
      { statut: updateData.statut, motif_rejet: motifRejet }, // apres
      request,
      {
        type_mention: mention.type_mention,
        numero_acte: mention.numero_acte,
        agent_id: agent.id,
        action,
        motif_rejet: motifRejet,
        observations: observations
      }
    )

    // Créer une notification pour le citoyen
    const notifMessage = action === 'approuver'
      ? `Votre avis de mention pour l'acte ${mention.numero_acte} a été approuvé.`
      : `Votre avis de mention pour l'acte ${mention.numero_acte} a été rejeté. Motif: ${motifRejet}`

    await supabase
      .from('notifications')
      .insert({
        user_id: mention.user_id,
        titre: action === 'approuver' ? 'Avis de mention approuvé' : 'Avis de mention rejeté',
        message: notifMessage,
        type: `mention_${action}`,
        lue: false
      })

    return NextResponse.json({
      success: true,
      message: `Avis de mention ${action === 'approuver' ? 'approuvé' : 'rejeté'} avec succès`
    })

  } catch (error: any) {
    console.error('Erreur mise à jour avis de mention:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
