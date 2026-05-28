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

    const decesData = await request.json()

    // Générer le numéro d'acte
    const annee = new Date().getFullYear()
    const { count } = await supabase
      .from('deces')
      .select('*', { count: 'exact', head: true })
      .eq('mairie_id', agent.mairie_id)
      .gte('created_at', `${annee}-01-01`)

    const numero = String((count || 0) + 1).padStart(4, '0')
    const numeroActe = `D-${annee}-${numero}`

    // Créer l'acte de décès
    const { data: deces, error: insertError } = await supabase
      .from('deces')
      .insert({
        ...decesData,
        numero_acte: numeroActe,
        annee: annee,
        mairie_id: agent.mairie_id,
        agent_id: agent.id
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Logger la création dans l'audit
    await logAgent(
      'ACTE_CREE',
      {
        id: agent.id,
        email: agent.email,
        nom: `${agent.prenom} ${agent.nom}`
      },
      {
        type: 'acte_deces',
        id: deces.id,
        reference: numeroActe
      },
      undefined, // avant
      undefined, // apres
      request,
      {
        type_acte: 'deces',
        numero_acte: numeroActe,
        nom_defunt: decesData.nom_defunt,
        prenom_defunt: decesData.prenom_defunt,
        date_deces: decesData.date_deces,
        lieu_deces: decesData.lieu_deces,
        cause_deces: decesData.cause_deces,
        agent_id: agent.id,
        mairie_id: agent.mairie_id
      }
    )

    return NextResponse.json({
      success: true,
      deces,
      numeroActe
    })

  } catch (error: any) {
    console.error('Erreur enregistrement décès:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
