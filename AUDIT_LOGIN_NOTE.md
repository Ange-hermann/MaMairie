# 📝 Note sur l'Audit du Login

## ⚠️ Problème

L'audit du login ne peut pas être implémenté directement dans le composant client `app/login/page.tsx` car :

1. **Composant Client** : Le login est un composant client (`'use client'`)
2. **Pas de NextRequest** : Les composants clients n'ont pas accès à l'objet `NextRequest`
3. **IP et User-Agent** : Ces informations ne sont disponibles que côté serveur

## ✅ Solutions possibles

### Solution 1 : API Route dédiée (Recommandée)

Créer une route API `/api/auth/login` qui :
- Gère l'authentification
- A accès à `NextRequest`
- Peut logger avec IP et User-Agent

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { logAuth, updateSessionActive } from '@/lib/audit'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()
  const supabase = createRouteHandlerClient({ cookies })

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // ❌ Logger l'échec
    await logAuth('LOGIN_FAILED', { email }, request)
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  // Récupérer le profil
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single()

  // ✅ Logger le succès
  await logAuth('LOGIN_SUCCESS', {
    id: data.user.id,
    email: data.user.email!,
    role: userData.role,
    nom: `${userData.prenom} ${userData.nom}`
  }, request)

  // Créer session active
  await updateSessionActive(
    data.user.id,
    data.user.email!,
    userData.role,
    request
  )

  return NextResponse.json({ user: data.user, userData })
}
```

Puis dans `app/login/page.tsx` :
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (!response.ok) {
      toast.error(data.error || 'Erreur de connexion')
      return
    }

    toast.success(`Bienvenue ${data.userData.prenom} ${data.userData.nom} !`)
    
    // Redirection selon rôle
    if (data.userData.role === 'citoyen') {
      router.push('/dashboard-citoyen')
    } else if (data.userData.role === 'agent') {
      router.push('/dashboard-agent')
    } // etc...

    router.refresh()
  } catch (error) {
    toast.error('Une erreur est survenue')
  } finally {
    setLoading(false)
  }
}
```

### Solution 2 : Middleware Supabase (Alternative)

Utiliser un middleware Next.js pour intercepter les authentifications :

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  const { data: { session } } = await supabase.auth.getSession()

  // Si nouvelle session, logger
  if (session && !request.cookies.get('session_logged')) {
    // Logger la connexion
    // ...
    res.cookies.set('session_logged', 'true')
  }

  return res
}
```

### Solution 3 : Logs simplifiés sans IP (Actuel - Temporaire)

Pour l'instant, les logs d'audit du login sont commentés dans le code.

Les autres actions (agents, citoyens) fonctionnent car elles sont soit :
- Dans des API routes (ont accès à `request`)
- Dans des composants où l'IP n'est pas critique

## 🎯 Recommandation

**Implémenter la Solution 1** (API Route) car :
- ✅ Accès complet à `NextRequest`
- ✅ IP et User-Agent disponibles
- ✅ Meilleure sécurité (logique serveur)
- ✅ Cohérent avec le reste de l'architecture

## 📋 TODO

- [ ] Créer `/app/api/auth/login/route.ts`
- [ ] Modifier `app/login/page.tsx` pour utiliser l'API
- [ ] Tester l'audit du login
- [ ] Vérifier les logs dans `/ministere/audit`

---

**Note** : Les autres intégrations d'audit (agents, citoyens) fonctionnent correctement car elles sont dans des contextes appropriés.
