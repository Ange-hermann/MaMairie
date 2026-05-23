-- Vérifier les avis de mention

-- 1. Voir tous les avis
SELECT 
  id,
  code_suivi,
  type_mention,
  mairie_id,
  statut,
  conditions_acceptees,
  created_at
FROM avis_mentions
ORDER BY created_at DESC
LIMIT 10;

-- 2. Compter par mairie
SELECT 
  mairie_id,
  COUNT(*) as nombre_avis,
  COUNT(CASE WHEN statut = 'en_attente' THEN 1 END) as en_attente
FROM avis_mentions
GROUP BY mairie_id;

-- 3. Voir les colonnes de la table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'avis_mentions'
ORDER BY ordinal_position;
