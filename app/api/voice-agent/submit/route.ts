import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function generateCodeSuivi(type: string): string {
  const prefix = type === 'naissance' ? 'NAI' : type === 'mariage' ? 'MAR' : 'DEC'
  const year = new Date().getFullYear()
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${year}-${rand}`
}

export async function POST(req: NextRequest) {
  try {
    const { data, userId } = await req.json()

    if (!userId) {
      return NextResponse.json({
        reply: 'Vous devez être connecté pour soumettre une demande. Veuillez vous connecter à votre espace citoyen.'
      })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const codeSuivi = generateCodeSuivi(data.type_acte || 'naissance')

    // Récupérer une mairie par défaut
    const { data: mairies } = await supabase
      .from('mairies')
      .select('id')
      .limit(1)
    const mairieId = mairies?.[0]?.id

    const { error } = await supabase
      .from('requests')
      .insert({
        user_id: userId,
        type_acte: data.type_acte || 'naissance',
        nom: data.nom || '',
        prenom: data.prenom || '',
        date_naissance: data.date_naissance || null,
        telephone: data.telephone || '',
        statut: 'en_attente',
        mairie_id: mairieId || null,
        conditions_acceptees: true,
        date_acceptation_conditions: new Date().toISOString()
      })

    if (error) {
      console.error('[Submit] Erreur Supabase:', error)
      return NextResponse.json({
        reply: `J'ai bien noté votre demande mais je n'ai pas pu la soumettre automatiquement. Rendez-vous dans votre espace citoyen pour finaliser.`
      })
    }

    return NextResponse.json({
      reply: `Votre demande d'extrait de ${data.type_acte || 'naissance'} pour ${data.prenom || ''} ${data.nom || ''} a bien été soumise. Votre code de suivi est ${codeSuivi}. Vous serez notifié dès qu'elle sera traitée.`,
      codeSuivi
    })

  } catch (error: any) {
    console.error('[Submit] Erreur:', error)
    return NextResponse.json({
      reply: 'Une erreur est survenue. Veuillez réessayer depuis votre espace citoyen.'
    })
  }
}
