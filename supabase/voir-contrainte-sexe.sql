-- Voir la contrainte sur le sexe dans la table naissances

SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'naissances'::regclass
  AND conname LIKE '%sexe%';

-- Voir aussi le type de la colonne sexe
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'naissances'
  AND column_name = 'sexe';
