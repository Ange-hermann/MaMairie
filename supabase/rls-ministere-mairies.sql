-- ============================================
-- RLS POLICIES POUR LE MINISTÈRE
-- ============================================
-- Permet au ministère de gérer toutes les mairies
-- ============================================

-- 1. Activer RLS sur la table mairies (si pas déjà fait)
ALTER TABLE public.mairies ENABLE ROW LEVEL SECURITY;

-- 2. Policy pour que le ministère puisse TOUT faire sur les mairies
CREATE POLICY "Ministere peut tout faire sur mairies"
ON public.mairies
FOR ALL
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

-- 3. Policy pour que les agents puissent voir leur mairie
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

-- 4. Policy pour que les citoyens puissent voir leur mairie
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

-- 5. Vérification
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'mairies';

-- ============================================
-- ALTERNATIVE : Désactiver RLS temporairement
-- ============================================
-- Si vous voulez désactiver RLS pour tester :
-- ALTER TABLE public.mairies DISABLE ROW LEVEL SECURITY;

-- ============================================
-- NOTES
-- ============================================
-- Cette policy permet au ministère de :
-- - SELECT : Voir toutes les mairies
-- - INSERT : Créer de nouvelles mairies
-- - UPDATE : Modifier toutes les mairies
-- - DELETE : Supprimer des mairies
--
-- Les agents et citoyens peuvent seulement voir leur mairie
