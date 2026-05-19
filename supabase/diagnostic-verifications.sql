-- ============================================
-- DIAGNOSTIC TABLE VERIFICATIONS_ACTES
-- ============================================

-- 1. Voir la structure de la table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'verifications_actes'
ORDER BY ordinal_position;

-- 2. Compter les vérifications
SELECT COUNT(*) as total FROM verifications_actes;

-- 3. Voir les dernières vérifications
SELECT * FROM verifications_actes 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Vérifier les permissions RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'verifications_actes';
