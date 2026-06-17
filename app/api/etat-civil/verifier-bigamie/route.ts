import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { numero_cni_epoux, numero_cni_epouse, nom_epoux, prenom_epoux, nom_epouse, prenom_epouse } = await request.json()

    const resultats: { personne: string; cas: string; details: any }[] = []

    // --- Vérification époux ---
    // 1. Mariage existant dans la table mariages (actes officiels)
    const { data: mariagesEpoux } = await supabase
      .from('mariages')
      .select('numero_acte, annee, nom_epouse, prenom_epouse, date_mariage')
      .or(`nom_epoux.ilike.${nom_epoux},prenom_epoux.ilike.${prenom_epoux}`)

    // 2. Réservation en attente ou validée
    const { data: reservationsEpoux } = await supabase
      .from('reservations_mariage')
      .select('code_reservation, nom_epouse, prenom_epouse, date_mariage_souhaitee, statut')
      .eq('numero_cni_epoux', numero_cni_epoux)
      .in('statut', ['en_attente', 'validee', 'acte_genere'])

    if (mariagesEpoux && mariagesEpoux.length > 0) {
      mariagesEpoux.forEach(m => {
        resultats.push({
          personne: `${prenom_epoux} ${nom_epoux} (Époux)`,
          cas: 'Acte de mariage existant',
          details: {
            numero_acte: m.numero_acte,
            epouse: `${m.prenom_epouse} ${m.nom_epouse}`,
            date: m.date_mariage
          }
        })
      })
    }

    if (reservationsEpoux && reservationsEpoux.length > 0) {
      reservationsEpoux.forEach(r => {
        resultats.push({
          personne: `${prenom_epoux} ${nom_epoux} (Époux)`,
          cas: 'Réservation de mariage en cours',
          details: {
            code: r.code_reservation,
            epouse: `${r.prenom_epouse} ${r.nom_epouse}`,
            date_souhaitee: r.date_mariage_souhaitee,
            statut: r.statut
          }
        })
      })
    }

    // --- Vérification épouse ---
    const { data: mariagesEpouse } = await supabase
      .from('mariages')
      .select('numero_acte, annee, nom_epoux, prenom_epoux, date_mariage')
      .or(`nom_epouse.ilike.${nom_epouse},prenom_epouse.ilike.${prenom_epouse}`)

    const { data: reservationsEpouse } = await supabase
      .from('reservations_mariage')
      .select('code_reservation, nom_epoux, prenom_epoux, date_mariage_souhaitee, statut')
      .eq('numero_cni_epouse', numero_cni_epouse)
      .in('statut', ['en_attente', 'validee', 'acte_genere'])

    if (mariagesEpouse && mariagesEpouse.length > 0) {
      mariagesEpouse.forEach(m => {
        resultats.push({
          personne: `${prenom_epouse} ${nom_epouse} (Épouse)`,
          cas: 'Acte de mariage existant',
          details: {
            numero_acte: m.numero_acte,
            epoux: `${m.prenom_epoux} ${m.nom_epoux}`,
            date: m.date_mariage
          }
        })
      })
    }

    if (reservationsEpouse && reservationsEpouse.length > 0) {
      reservationsEpouse.forEach(r => {
        resultats.push({
          personne: `${prenom_epouse} ${nom_epouse} (Épouse)`,
          cas: 'Réservation de mariage en cours',
          details: {
            code: r.code_reservation,
            epoux: `${r.prenom_epoux} ${r.nom_epoux}`,
            date_souhaitee: r.date_mariage_souhaitee,
            statut: r.statut
          }
        })
      })
    }

    const bigamieDetectee = resultats.length > 0

    return NextResponse.json({
      success: true,
      bigamie_detectee: bigamieDetectee,
      resultats,
      message: bigamieDetectee
        ? `⚠️ ALERTE BIGAMIE : ${resultats.length} cas suspect(s) détecté(s)`
        : '✅ Aucune bigamie détectée - Les deux personnes sont libres de se marier'
    })

  } catch (error: any) {
    console.error('Erreur vérification bigamie:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}
