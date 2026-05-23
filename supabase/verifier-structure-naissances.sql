-- Vérifier la structure de la table naissances

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'naissances'
ORDER BY ordinal_position;
