import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { logMinistere, logFraude } from '@/lib/auditHelpers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Récupérer l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!userProfile || userProfile.role !== 'ministere') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { qrData } = await request.json()

    if (!qrData) {
      return NextResponse.json(
        { error: 'Données QR manquantes' },
        { status: 400 }
      )
    }

    // Le QR code contient simplement le numéro d'acte (texte simple)
    const numero_acte = qrData.trim()

    if (!numero_acte) {
      await logFraude(
        'QR_INVALIDE',
        {
          description: 'QR Code invalide scanné (vide)',
          metadata: {
            qr_data: qrData,
            raison: 'Numéro d\'acte vide'
          }
        },
        request
      )

      return NextResponse.json({
        valide: false,
        raison: 'QR Code vide'
      })
    }

    // Chercher l'acte dans toutes les tables (naissances, mariages, deces)
    let acte = null
    let type = null
    
    // Essayer dans naissances
    const { data: naissanceData } = await supabase
      .from('naissances')
      .select('*, mairies(nom_mairie, ville)')
      .eq('numero_acte', numero_acte)
      .maybeSingle()
    
    if (naissanceData) {
      acte = naissanceData
      type = 'naissance'
    }
    
    // Si pas trouvé, essayer dans mariages
    if (!acte) {
      const { data: mariageData } = await supabase
        .from('mariages')
        .select('*, mairies(nom_mairie, ville)')
        .eq('numero_acte', numero_acte)
        .maybeSingle()
      
      if (mariageData) {
        acte = mariageData
        type = 'mariage'
      }
    }
    
    // Si pas trouvé, essayer dans deces
    if (!acte) {
      const { data: decesData } = await supabase
        .from('deces')
        .select('*, mairies(nom_mairie, ville)')
        .eq('numero_acte', numero_acte)
        .maybeSingle()
      
      if (decesData) {
        acte = decesData
        type = 'deces'
      }
    }

    // Vérifier si l'acte a été trouvé
    if (!acte || !type) {
      // Acte introuvable = fraude potentielle
      await logFraude(
        'ACTE_INVALIDE',
        {
          description: 'Acte introuvable lors de la vérification QR',
          entiteReference: numero_acte,
          metadata: {
            qr_data: qrData,
            raison: 'Acte introuvable dans aucune table'
          }
        },
        request
      )

      return NextResponse.json({
        valide: false,
        raison: 'Acte introuvable dans la base de données'
      })
    }

    // ✅ Acte valide - Logger la vérification réussie
    await logMinistere(
      'ACTE_VERIFIE',
      {
        id: userProfile.id,
        email: userProfile.email,
        nom: `${userProfile.prenom} ${userProfile.nom}`
      },
      {
        type: `acte_${type}`,
        id: acte.id,
        reference: numero_acte
      },
      request,
      {
        metadata: {
          type_acte: type,
          numero_acte: numero_acte,
          annee: acte.annee,
          mairie: acte.mairies?.nom_mairie,
          resultat: 'VALIDE'
        }
      }
    )

    return NextResponse.json({
      valide: true,
      acte: {
        type,
        numero_acte: acte.numero_acte,
        annee: acte.annee,
        mairie: acte.mairies?.nom_mairie,
        ville: acte.mairies?.ville,
        // Données spécifiques selon le type
        ...(type === 'naissance' && {
          nom_enfant: acte.nom_enfant,
          prenom_enfant: acte.prenom_enfant,
          date_naissance: acte.date_naissance,
          lieu_naissance: acte.lieu_naissance,
          nom_pere: acte.nom_pere,
          nom_mere: acte.nom_mere
        }),
        ...(type === 'mariage' && {
          nom_epoux: acte.nom_epoux,
          prenom_epoux: acte.prenom_epoux,
          nom_epouse: acte.nom_epouse,
          prenom_epouse: acte.prenom_epouse,
          date_mariage: acte.date_mariage,
          lieu_mariage: acte.lieu_mariage
        }),
        ...(type === 'deces' && {
          nom_defunt: acte.nom_defunt,
          prenom_defunt: acte.prenom_defunt,
          date_deces: acte.date_deces,
          lieu_deces: acte.lieu_deces
        })
      }
    })

  } catch (error: any) {
    console.error('Erreur vérification QR:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
