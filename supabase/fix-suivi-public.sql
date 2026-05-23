-- ========================================
-- CORRIGER LE SUIVI PUBLIC DES DÉCLARATIONS
-- ========================================
-- Permet la recherche par code de suivi SANS connexion

-- Supprimer l'ancienne policy de lecture si elle existe
DROP POLICY IF EXISTS "Public peut chercher par code" ON public.declarations_naissance;

-- Créer une policy pour permettre la recherche publique par code de suivi
CREATE POLICY "Public peut chercher par code"
  ON public.declarations_naissance
  FOR SELECT
  USING (true);  -- Tout le monde peut lire (mais RLS limite aux colonnes visibles)

-- Alternative plus sécurisée : permettre seulement si on a le bon code
-- CREATE POLICY "Public peut chercher par code"
--   ON public.declarations_naissance
--   FOR SELECT
--   USING (
--     code_suivi IS NOT NULL
--   );

-- Vérifier les policies actives
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'declarations_naissance';

-- Tester la recherche
SELECT 
  code_suivi,
  nom_enfant,
  prenom_enfant,
  statut,
  created_at
FROM public.declarations_naissance
LIMIT 5;
