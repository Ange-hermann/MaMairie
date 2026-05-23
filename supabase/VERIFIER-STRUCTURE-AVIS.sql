-- Vérifier la structure de la table avis_mentions

-- 1. Voir toutes les colonnes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'avis_mentions'
ORDER BY ordinal_position;

-- 2. Voir les foreign keys
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'avis_mentions'
  AND tc.constraint_type = 'FOREIGN KEY';

-- 3. Essayer de récupérer les avis sans jointure
SELECT 
  id,
  code_suivi,
  citoyen_id,
  mairie_id,
  type_mention,
  statut,
  created_at
FROM avis_mentions
ORDER BY created_at DESC
LIMIT 5;
