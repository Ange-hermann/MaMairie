-- Ajouter colonnes pour gérer les mentions sur les actes

-- Table naissances
ALTER TABLE naissances 
ADD COLUMN IF NOT EXISTS a_mention BOOLEAN DEFAULT FALSE;

ALTER TABLE naissances 
ADD COLUMN IF NOT EXISTS date_derniere_mention TIMESTAMP;

-- Table mariages
ALTER TABLE mariages 
ADD COLUMN IF NOT EXISTS a_mention BOOLEAN DEFAULT FALSE;

ALTER TABLE mariages 
ADD COLUMN IF NOT EXISTS date_derniere_mention TIMESTAMP;

-- Table deces
ALTER TABLE deces 
ADD COLUMN IF NOT EXISTS a_mention BOOLEAN DEFAULT FALSE;

ALTER TABLE deces 
ADD COLUMN IF NOT EXISTS date_derniere_mention TIMESTAMP;

-- Vérifier
SELECT 'naissances' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'naissances' 
AND column_name IN ('a_mention', 'date_derniere_mention')

UNION ALL

SELECT 'mariages' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mariages' 
AND column_name IN ('a_mention', 'date_derniere_mention')

UNION ALL

SELECT 'deces' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'deces' 
AND column_name IN ('a_mention', 'date_derniere_mention');

SELECT '✅ Colonnes ajoutées avec succès !' as resultat;
