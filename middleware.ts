import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Rafraîchir la session si elle existe
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Logs pour débuggage
  if (session) {
    console.log('✅ Session active:', session.user.email)
  }

  return res
}

// Appliquer le middleware sur toutes les routes sauf les fichiers statiques
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
