-- Vérifier la structure de la table mairies
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'mairies'
ORDER BY ordinal_position;
