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

    // Parser les données du QR code
    let qrInfo
    try {
      qrInfo = JSON.parse(qrData)
    } catch (error) {
      // QR Code invalide
      await logFraude(
        'QR_INVALIDE',
        {
          description: 'QR Code invalide scanné (format JSON incorrect)',
          metadata: {
            qr_data: qrData,
            raison: 'Format JSON invalide'
          }
        },
        request
      )

      return NextResponse.json({
        valide: false,
        raison: 'Format QR Code invalide'
      })
    }

    const { type, numero_acte, annee } = qrInfo

    if (!type || !numero_acte) {
      await logFraude(
        'QR_INVALIDE',
        {
          description: 'QR Code invalide scanné (données manquantes)',
          metadata: {
            qr_data: qrData,
            raison: 'Type ou numéro d\'acte manquant'
          }
        },
        request
      )

      return NextResponse.json({
        valide: false,
        raison: 'Données QR Code incomplètes'
      })
    }

    // Chercher l'acte dans la base de données
    const tableName = type === 'naissance' ? 'naissances' 
                    : type === 'mariage' ? 'mariages'
                    : type === 'deces' ? 'deces'
                    : null

    if (!tableName) {
      await logFraude(
        'QR_INVALIDE',
        {
          description: 'QR Code invalide scanné (type d\'acte inconnu)',
          metadata: {
            qr_data: qrData,
            raison: `Type d'acte inconnu: ${type}`
          }
        },
        request
      )

      return NextResponse.json({
        valide: false,
        raison: 'Type d\'acte inconnu'
      })
    }

    // Rechercher l'acte par numéro
    const { data: acte, error: acteError } = await supabase
      .from(tableName)
      .select('*, mairies(nom_mairie, ville)')
      .eq('numero_acte', numero_acte)
      .maybeSingle()

    if (acteError || !acte) {
      // Acte introuvable = fraude potentielle
      await logFraude(
        'ACTE_INVALIDE',
        {
          description: 'Acte introuvable lors de la vérification QR',
          entiteType: `acte_${type}`,
          entiteReference: numero_acte,
          metadata: {
            qr_data: qrData,
            raison: 'Acte introuvable dans la base de données'
          }
        },
        request
      )

      return NextResponse.json({
        valide: false,
        raison: 'Acte introuvable dans la base de données'
      })
    }

    // Vérifier la cohérence des données
    if (annee && acte.annee && acte.annee.toString() !== annee.toString()) {
      await logFraude(
        'QR_INVALIDE',
        {
          description: 'QR Code invalide (année incohérente)',
          entiteType: `acte_${type}`,
          entiteId: acte.id,
          entiteReference: numero_acte,
          metadata: {
            qr_data: qrData,
            raison: `Année QR: ${annee}, Année DB: ${acte.annee}`
          }
        },
        request
      )

      return NextResponse.json({
        valide: false,
        raison: 'Données QR Code incohérentes'
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
