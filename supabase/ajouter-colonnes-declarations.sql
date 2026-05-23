-- Script pour ajouter les colonnes de validation aux déclarations
-- À exécuter dans Supabase SQL Editor

-- 1. Ajouter les colonnes pour le processus de validation à declarations_naissance
ALTER TABLE declarations_naissance
ADD COLUMN IF NOT EXISTS conditions_acceptees BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS date_acceptation_conditions TIMESTAMP,
ADD COLUMN IF NOT EXISTS documents_verifies BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS date_verification_documents TIMESTAMP,
ADD COLUMN IF NOT EXISTS agent_verificateur_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS documents_recus JSONB,
ADD COLUMN IF NOT EXISTS observations_agent TEXT,
ADD COLUMN IF NOT EXISTS date_remise TIMESTAMP,
ADD COLUMN IF NOT EXISTS agent_remise_id UUID REFERENCES users(id);

-- 2. Ajouter la colonne statut si elle n'existe pas
ALTER TABLE declarations_naissance
ADD COLUMN IF NOT EXISTS statut VARCHAR(30) DEFAULT 'en_attente';

-- 3. Vérifier les colonnes ajoutées
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'declarations_naissance'
AND column_name IN (
  'conditions_acceptees',
  'date_acceptation_conditions',
  'documents_verifies',
  'date_verification_documents',
  'agent_verificateur_id',
  'documents_recus',
  'observations_agent',
  'date_remise',
  'agent_remise_id',
  'statut'
)
ORDER BY column_name;

COMMENT ON COLUMN declarations_naissance.conditions_acceptees IS 'Le citoyen a accepté les avertissements légaux';
COMMENT ON COLUMN declarations_naissance.date_acceptation_conditions IS 'Date d''acceptation des conditions';
COMMENT ON COLUMN declarations_naissance.documents_verifies IS 'Les documents ont été vérifiés par l''agent';
COMMENT ON COLUMN declarations_naissance.date_verification_documents IS 'Date de vérification des documents';
COMMENT ON COLUMN declarations_naissance.agent_verificateur_id IS 'Agent qui a vérifié les documents';
COMMENT ON COLUMN declarations_naissance.documents_recus IS 'Liste JSON des documents reçus et vérifiés';
COMMENT ON COLUMN declarations_naissance.observations_agent IS 'Observations de l''agent lors de la vérification';
COMMENT ON COLUMN declarations_naissance.date_remise IS 'Date de remise du document au citoyen';
COMMENT ON COLUMN declarations_naissance.agent_remise_id IS 'Agent qui a remis le document';
COMMENT ON COLUMN declarations_naissance.statut IS 'Statut de la déclaration: en_attente, validee, documents_verifies, remis, rejetee';
