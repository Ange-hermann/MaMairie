-- ============================================
-- FIX RAPIDE : Dropdown Mairies ne s'affiche pas
-- ============================================
-- Solution 1 : Désactiver RLS temporairement
-- Solution 2 : Créer policy SELECT explicite
-- ============================================

-- OPTION 1 : DÉSACTIVER RLS (RAPIDE - Pour tester)
-- ⚠️ Moins sécurisé, à utiliser seulement pour tester
ALTER TABLE public.mairies DISABLE ROW LEVEL SECURITY;

-- OPTION 2 : CRÉER POLICY SELECT (RECOMMANDÉ)
-- Activer RLS
ALTER TABLE public.mairies ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Ministere peut tout faire sur mairies" ON public.mairies;
DROP POLICY IF EXISTS "Ministere peut voir toutes les mairies" ON public.mairies;
DROP POLICY IF EXISTS "Agents peuvent voir leur mairie" ON public.mairies;
DROP POLICY IF EXISTS "Citoyens peuvent voir leur mairie" ON public.mairies;

-- Policy SELECT pour le ministère (LECTURE)
CREATE POLICY "Ministere peut voir toutes les mairies"
ON public.mairies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'ministere'
  )
);

-- Policy INSERT pour le ministère (CRÉATION)
CREATE POLICY "Ministere peut creer des mairies"
ON public.mairies
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'ministere'
  )
);

-- Policy UPDATE pour le ministère (MODIFICATION)
CREATE POLICY "Ministere peut modifier des mairies"
ON public.mairies
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'ministere'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'ministere'
  )
);

-- Policy DELETE pour le ministère (SUPPRESSION)
CREATE POLICY "Ministere peut supprimer des mairies"
ON public.mairies
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'ministere'
  )
);

-- Policy pour les agents (SELECT uniquement leur mairie)
CREATE POLICY "Agents peuvent voir leur mairie"
ON public.mairies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND (role = 'agent' OR role = 'admin')
    AND mairie_id = public.mairies.id
  )
);

-- Policy pour les citoyens (SELECT uniquement leur mairie)
CREATE POLICY "Citoyens peuvent voir leur mairie"
ON public.mairies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'citoyen'
    AND mairie_id = public.mairies.id
  )
);

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Voir toutes les policies sur mairies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'mairies';

-- Tester la requête en tant que ministère
-- (Remplacer 'VOTRE_UID' par votre vrai UID)
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "84ed3a18-a758-406b-a251-a523344f0ef1"}';

SELECT id, nom_mairie, ville, region FROM public.mairies;

-- ============================================
-- NOTES
-- ============================================
-- Si le dropdown ne s'affiche toujours pas :
-- 1. Vérifier que vous êtes bien connecté comme ministère
-- 2. Vérifier votre UID dans auth.users
-- 3. Vérifier que votre profil existe dans public.users avec role='ministere'
-- 4. Essayer de désactiver RLS temporairement (OPTION 1)
