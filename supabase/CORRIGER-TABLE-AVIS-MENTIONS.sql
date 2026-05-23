-- Corriger la table avis_mentions

-- Ajouter la colonne conditions_acceptees si elle n'existe pas
ALTER TABLE avis_mentions 
ADD COLUMN IF NOT EXISTS conditions_acceptees BOOLEAN DEFAULT false;

-- Ajouter aussi d'autres colonnes qui pourraient manquer
ALTER TABLE avis_mentions 
ADD COLUMN IF NOT EXISTS date_acceptation TIMESTAMP;

ALTER TABLE avis_mentions 
ADD COLUMN IF NOT EXISTS date_acceptation_conditions TIMESTAMP;

-- Vérifier les colonnes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'avis_mentions'
ORDER BY ordinal_position;
