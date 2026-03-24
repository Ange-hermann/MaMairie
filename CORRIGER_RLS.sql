-- Corriger les RLS Policies pour permettre la lecture du profil

-- 1. Vérifier que le profil existe
SELECT * FROM public.users WHERE email = 'angeherboua@gmail.com';

-- 2. Désactiver temporairement RLS pour tester
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 3. Ou créer une policy qui permet la lecture
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.users;

CREATE POLICY "Allow users to read their own profile"
ON public.users FOR SELECT
USING (auth.uid() = id);

-- 4. Créer une policy pour l'insertion (si besoin)
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.users;

CREATE POLICY "Allow users to insert their own profile"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

-- 5. Réactiver RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 6. Vérifier les policies
SELECT * FROM pg_policies WHERE tablename = 'users';
