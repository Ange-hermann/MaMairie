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

    const { declarationId, action, motifRejet, documentsVerifies, observations } = await request.json()

    if (!declarationId || !action) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    // Récupérer la déclaration
    const { data: declaration, error: declarationError } = await supabase
      .from('declarations_naissance')
      .select('*')
      .eq('id', declarationId)
      .single()

    if (declarationError || !declaration) {
      return NextResponse.json(
        { error: 'Déclaration introuvable' },
        { status: 404 }
      )
    }

    const ancienStatut = declaration.statut

    // Mettre à jour la déclaration selon l'action
    const updateData: any = {
      agent_id: agent.id
    }

    if (action === 'valider') {
      updateData.statut = 'validee'
    } else if (action === 'rejeter') {
      updateData.statut = 'rejetee'
      updateData.motif_rejet = motifRejet
    } else if (action === 'documents_recus') {
      updateData.statut = 'documents_verifies'
      updateData.documents_verifies = true
      updateData.date_verification_documents = new Date().toISOString()
      updateData.agent_verificateur_id = agent.id
      updateData.documents_recus = documentsVerifies || {}
      updateData.observations_agent = observations
    }

    const { error: updateError } = await supabase
      .from('declarations_naissance')
      .update(updateData)
      .eq('id', declarationId)

    if (updateError) {
      throw updateError
    }

    // Logger l'action dans l'audit
    const auditAction = action === 'valider' ? 'DEMANDE_APPROUVEE'
                      : action === 'rejeter' ? 'DEMANDE_REJETEE'
                      : 'DOCUMENTS_VERIFIES'

    await logAgent(
      auditAction,
      {
        id: agent.id,
        email: agent.email,
        nom: `${agent.prenom} ${agent.nom}`
      },
      {
        type: 'declaration_naissance',
        id: declarationId,
        reference: declaration.code_suivi
      },
      { statut: ancienStatut }, // avant
      { statut: updateData.statut, motif_rejet: motifRejet }, // apres
      request,
      {
        nom_enfant: declaration.nom_enfant,
        prenom_enfant: declaration.prenom_enfant,
        date_naissance: declaration.date_naissance,
        agent_id: agent.id,
        action,
        motif_rejet: motifRejet,
        observations: observations
      }
    )

    // Créer une notification pour le citoyen
    let notifMessage = ''
    let notifTitre = ''

    if (action === 'valider') {
      notifTitre = 'Déclaration validée'
      notifMessage = `Votre déclaration ${declaration.code_suivi} a été validée. Veuillez vous présenter à la mairie avec les documents originaux.`
    } else if (action === 'rejeter') {
      notifTitre = 'Déclaration rejetée'
      notifMessage = `Votre déclaration ${declaration.code_suivi} a été rejetée. Motif: ${motifRejet}`
    } else if (action === 'documents_recus') {
      notifTitre = 'Documents vérifiés'
      notifMessage = `Les documents de votre déclaration ${declaration.code_suivi} ont été vérifiés et acceptés.`
    }

    await supabase
      .from('notifications')
      .insert({
        user_id: declaration.user_id,
        titre: notifTitre,
        message: notifMessage,
        type: `declaration_${action}`,
        lue: false
      })

    return NextResponse.json({
      success: true,
      message: `Déclaration ${action === 'valider' ? 'validée' : action === 'rejeter' ? 'rejetée' : 'mise à jour'} avec succès`
    })

  } catch (error: any) {
    console.error('Erreur validation déclaration:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
