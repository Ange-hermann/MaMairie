-- Ajouter TOUTES les colonnes nécessaires pour avis_mentions

-- Colonnes pour les conditions
ALTER TABLE avis_mentions ADD COLUMN IF NOT EXISTS conditions_acceptees BOOLEAN DEFAULT false;
ALTER TABLE avis_mentions ADD COLUMN IF NOT EXISTS date_acceptation_conditions TIMESTAMP;

-- Colonnes pour le suivi
ALTER TABLE avis_mentions ADD COLUMN IF NOT EXISTS code_suivi TEXT;
ALTER TABLE avis_mentions ADD COLUMN IF NOT EXISTS statut TEXT DEFAULT 'en_attente';

-- Colonnes pour les documents
ALTER TABLE avis_mentions ADD COLUMN IF NOT EXISTS documents_verifies BOOLEAN DEFAULT false;
ALTER TABLE avis_mentions ADD COLUMN IF NOT EXISTS documents_recus JSONB;

-- Colonnes pour l'agent
ALTER TABLE avis_mentions ADD COLUMN IF NOT EXISTS agent_verificateur_id UUID;
ALTER TABLE avis_mentions ADD COLUMN IF NOT EXISTS observations_agent TEXT;
ALTER TABLE avis_mentions ADD COLUMN IF NOT EXISTS date_verification TIMESTAMP;

-- Colonnes pour la remise
ALTER TABLE avis_mentions ADD COLUMN IF NOT EXISTS date_remise TIMESTAMP;
ALTER TABLE avis_mentions ADD COLUMN IF NOT EXISTS agent_remise_id UUID;

-- Vérifier toutes les colonnes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'avis_mentions'
ORDER BY ordinal_position;

SELECT '✅ Toutes les colonnes ajoutées !' as resultat;
