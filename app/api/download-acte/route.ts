import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const type = searchParams.get('type')

    if (!id || !type) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    // Déterminer la table selon le type
    let tableName = ''
    switch (type) {
      case 'naissance':
        tableName = 'naissances'
        break
      case 'mariage':
        tableName = 'mariages'
        break
      case 'deces':
        tableName = 'deces'
        break
      default:
        return NextResponse.json(
          { error: 'Type d\'acte invalide' },
          { status: 400 }
        )
    }

    // Récupérer l'acte
    const { data: acte, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error || !acte) {
      return NextResponse.json(
        { error: 'Acte introuvable' },
        { status: 404 }
      )
    }

    // Rediriger vers la page de téléchargement/visualisation
    const redirectUrl = `${request.nextUrl.origin}/extrait/${type}/${id}`
    
    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
