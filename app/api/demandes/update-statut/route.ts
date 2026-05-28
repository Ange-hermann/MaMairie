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

    const { demandeId, nouveauStatut, motifRejet } = await request.json()

    if (!demandeId || !nouveauStatut) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    // Récupérer la demande
    const { data: demande, error: demandeError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', demandeId)
      .single()

    if (demandeError || !demande) {
      return NextResponse.json(
        { error: 'Demande introuvable' },
        { status: 404 }
      )
    }

    const ancienStatut = demande.statut

    // Mettre à jour le statut
    const updateData: any = { 
      statut: nouveauStatut,
      agent_id: agent.id
    }

    if (nouveauStatut === 'rejetee' && motifRejet) {
      updateData.motif_rejet = motifRejet
    }

    const { error: updateError } = await supabase
      .from('requests')
      .update(updateData)
      .eq('id', demandeId)

    if (updateError) {
      throw updateError
    }

    // Logger l'action dans l'audit
    const action = nouveauStatut === 'approuvee' ? 'DEMANDE_APPROUVEE' : 'DEMANDE_REJETEE'
    
    await logAgent(
      action,
      {
        id: agent.id,
        email: agent.email,
        nom: `${agent.prenom} ${agent.nom}`
      },
      {
        type: `demande_${demande.type_acte}`,
        id: demandeId,
        reference: demande.numero_acte || demande.nom
      },
      { statut: ancienStatut }, // avant
      { statut: nouveauStatut, motif_rejet: motifRejet }, // apres
      request,
      {
        type_acte: demande.type_acte,
        numero_acte: demande.numero_acte,
        nom: demande.nom,
        prenom: demande.prenom,
        agent_id: agent.id,
        motif_rejet: motifRejet
      }
    )

    // Créer une notification pour le citoyen
    const notifMessage = nouveauStatut === 'approuvee'
      ? `Votre demande d'extrait de ${demande.type_acte} a été approuvée.`
      : `Votre demande d'extrait de ${demande.type_acte} a été rejetée. Motif: ${motifRejet}`

    await supabase
      .from('notifications')
      .insert({
        user_id: demande.user_id,
        titre: nouveauStatut === 'approuvee' ? 'Demande approuvée' : 'Demande rejetée',
        message: notifMessage,
        type: nouveauStatut === 'approuvee' ? 'demande_approuvee' : 'demande_rejetee',
        lue: false
      })

    return NextResponse.json({
      success: true,
      message: `Demande ${nouveauStatut === 'approuvee' ? 'approuvée' : 'rejetée'} avec succès`
    })

  } catch (error: any) {
    console.error('Erreur mise à jour statut:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
