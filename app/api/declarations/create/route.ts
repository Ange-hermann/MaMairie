import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { logCitoyen } from '@/lib/auditHelpers'
import { generateCodeSuiviServer } from '@/lib/generateCodeSuiviServer'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Récupérer l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: citoyen } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!citoyen || citoyen.role !== 'citoyen') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const declarationData = await request.json()

    // Générer un code de suivi unique au format NAI-AAAA-XXX-XXXXX
    const codeSuivi = await generateCodeSuiviServer(declarationData.mairie_id)

    // Créer la déclaration
    const { data: declaration, error: insertError } = await supabase
      .from('declarations_naissance')
      .insert({
        ...declarationData,
        citoyen_id: user.id,
        code_suivi: codeSuivi,
        statut: 'en_attente',
        conditions_acceptees: true,
        date_acceptation_conditions: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Logger la création dans l'audit
    await logCitoyen(
      'DECLARATION_CREEE',
      {
        id: citoyen.id,
        email: citoyen.email,
        nom: `${citoyen.prenom} ${citoyen.nom}`
      },
      {
        type: 'declaration_naissance',
        id: declaration.id,
        reference: codeSuivi
      },
      request,
      {
        metadata: {
          nom_enfant: declarationData.nom_enfant,
          prenom_enfant: declarationData.prenom_enfant,
          date_naissance: declarationData.date_naissance,
          lieu_naissance: declarationData.lieu_naissance,
          mairie_id: declarationData.mairie_id
        }
      }
    )

    // Créer une notification pour le citoyen
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        titre: 'Déclaration enregistrée',
        message: `Votre déclaration de naissance a été enregistrée avec le code de suivi ${codeSuivi}. Vous serez notifié de son traitement.`,
        type: 'declaration_creee',
        lue: false
      })

    return NextResponse.json({
      success: true,
      declaration,
      codeSuivi
    })

  } catch (error: any) {
    console.error('Erreur création déclaration:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
