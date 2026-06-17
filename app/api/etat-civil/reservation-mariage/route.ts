import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

function genererCodeReservation(): string {
  const annee = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `MAR-${annee}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { mairie_id, ...reservationData } = body

    const code = genererCodeReservation()

    const { data: reservation, error } = await supabase
      .from('reservations_mariage')
      .insert({
        ...reservationData,
        code_reservation: code,
        citoyen_id: user.id,
        mairie_id,
        statut: 'en_attente'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      reservation,
      code_reservation: code
    })

  } catch (error: any) {
    console.error('Erreur réservation mariage:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    let query = supabase
      .from('reservations_mariage')
      .select('*')
      .eq('citoyen_id', user.id)
      .order('created_at', { ascending: false })

    if (code) {
      query = query.eq('code_reservation', code)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ success: true, reservations: data })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
