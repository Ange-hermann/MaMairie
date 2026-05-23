-- Voir TOUTES les colonnes de la table naissances

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'naissances'
ORDER BY ordinal_position;
