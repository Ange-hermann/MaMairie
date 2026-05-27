import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { logAuth } from '@/lib/auditHelpers'
import { updateSessionActive } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })

    // Tentative de connexion
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      // ❌ Logger l'échec de connexion
      await logAuth('LOGIN_FAILED', { email }, request)
      
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Récupérer le profil utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, nom, prenom, mairie_id')
      .eq('id', authData.user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Profil utilisateur introuvable' },
        { status: 404 }
      )
    }

    // ✅ Logger la connexion réussie
    await logAuth('LOGIN_SUCCESS', {
      id: authData.user.id,
      email: authData.user.email!,
      role: userData.role,
      nom: `${userData.prenom} ${userData.nom}`
    }, request)

    // Créer/mettre à jour la session active
    await updateSessionActive(
      authData.user.id,
      authData.user.email!,
      userData.role,
      request
    )

    return NextResponse.json({
      success: true,
      user: authData.user,
      userData: userData
    })

  } catch (error: any) {
    console.error('Erreur login:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
