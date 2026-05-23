-- Script pour ajouter les colonnes de validation et traçabilité
-- À exécuter dans Supabase SQL Editor

-- 1. Ajouter les colonnes pour le processus de validation
ALTER TABLE requests
ADD COLUMN IF NOT EXISTS code_suivi VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS conditions_acceptees BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS date_acceptation_conditions TIMESTAMP,
ADD COLUMN IF NOT EXISTS documents_verifies BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS date_verification_documents TIMESTAMP,
ADD COLUMN IF NOT EXISTS agent_verificateur_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS documents_recus JSONB,
ADD COLUMN IF NOT EXISTS observations_agent TEXT,
ADD COLUMN IF NOT EXISTS date_remise TIMESTAMP,
ADD COLUMN IF NOT EXISTS agent_remise_id UUID REFERENCES users(id);

-- 2. Créer une fonction pour générer le code de suivi
CREATE OR REPLACE FUNCTION generer_code_suivi()
RETURNS TRIGGER AS $$
BEGIN
  -- Générer un code unique au format DEC-YYYY-NNNNNN
  NEW.code_suivi := 'DEC-' || 
                    TO_CHAR(NOW(), 'YYYY') || '-' || 
                    LPAD(NEXTVAL('code_suivi_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Créer la séquence pour les codes
CREATE SEQUENCE IF NOT EXISTS code_suivi_seq START 1;

-- 4. Créer le trigger pour générer automatiquement le code
DROP TRIGGER IF EXISTS trigger_generer_code_suivi ON requests;
CREATE TRIGGER trigger_generer_code_suivi
  BEFORE INSERT ON requests
  FOR EACH ROW
  WHEN (NEW.code_suivi IS NULL)
  EXECUTE FUNCTION generer_code_suivi();

-- 5. Vérifier les colonnes ajoutées
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'requests'
AND column_name IN (
  'code_suivi',
  'conditions_acceptees',
  'date_acceptation_conditions',
  'documents_verifies',
  'date_verification_documents',
  'agent_verificateur_id',
  'documents_recus',
  'observations_agent',
  'date_remise',
  'agent_remise_id'
)
ORDER BY column_name;

-- 6. Tester la génération de code
-- INSERT INTO requests (user_id, type_acte, nom, prenom, telephone, statut)
-- VALUES (
--   (SELECT id FROM users WHERE role = 'citoyen' LIMIT 1),
--   'naissance',
--   'Test',
--   'Code',
--   '0700000000',
--   'en_attente'
-- )
-- RETURNING code_suivi;

COMMENT ON COLUMN requests.code_suivi IS 'Code unique de suivi au format DEC-YYYY-NNNNNN';
COMMENT ON COLUMN requests.conditions_acceptees IS 'Le citoyen a accepté les avertissements légaux';
COMMENT ON COLUMN requests.date_acceptation_conditions IS 'Date d''acceptation des conditions';
COMMENT ON COLUMN requests.documents_verifies IS 'Les documents ont été vérifiés par l''agent';
COMMENT ON COLUMN requests.date_verification_documents IS 'Date de vérification des documents';
COMMENT ON COLUMN requests.agent_verificateur_id IS 'Agent qui a vérifié les documents';
COMMENT ON COLUMN requests.documents_recus IS 'Liste JSON des documents reçus et vérifiés';
COMMENT ON COLUMN requests.observations_agent IS 'Observations de l''agent lors de la vérification';
COMMENT ON COLUMN requests.date_remise IS 'Date de remise du document au citoyen';
COMMENT ON COLUMN requests.agent_remise_id IS 'Agent qui a remis le document';
