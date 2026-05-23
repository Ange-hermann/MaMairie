-- Script pour créer la table avis_mention
-- À exécuter dans Supabase SQL Editor

-- 1. Créer la table avis_mention
CREATE TABLE IF NOT EXISTS avis_mention (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code_suivi VARCHAR(20) UNIQUE NOT NULL,
  citoyen_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mairie_id UUID REFERENCES mairies(id) ON DELETE SET NULL,
  
  -- Type de mention
  type_mention VARCHAR(30) NOT NULL, -- mariage, divorce, deces, reconnaissance
  
  -- Acte à modifier
  numero_acte_original VARCHAR(50) NOT NULL,
  type_acte_original VARCHAR(20) NOT NULL, -- naissance, mariage
  date_acte_original DATE,
  
  -- Informations de la mention
  date_evenement DATE NOT NULL,
  lieu_evenement VARCHAR(100),
  details JSONB, -- Détails selon le type de mention
  
  -- Informations du conjoint (pour mariage)
  nom_conjoint VARCHAR(100),
  prenom_conjoint VARCHAR(100),
  
  -- Documents
  document_url TEXT,
  document_name TEXT,
  
  -- Statuts
  statut VARCHAR(30) DEFAULT 'en_attente',
  motif_rejet TEXT,
  
  -- Acceptation conditions
  conditions_acceptees BOOLEAN DEFAULT FALSE,
  date_acceptation_conditions TIMESTAMP,
  
  -- Validation
  agent_id UUID REFERENCES users(id),
  date_validation TIMESTAMP,
  
  -- Vérification documents
  documents_verifies BOOLEAN DEFAULT FALSE,
  date_verification_documents TIMESTAMP,
  agent_verificateur_id UUID REFERENCES users(id),
  documents_recus JSONB,
  observations_agent TEXT,
  
  -- Remise
  date_remise TIMESTAMP,
  agent_remise_id UUID REFERENCES users(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Créer la séquence pour les codes
CREATE SEQUENCE IF NOT EXISTS code_suivi_mention_seq START 1;

-- 3. Créer la fonction pour générer le code de suivi
CREATE OR REPLACE FUNCTION generer_code_suivi_mention()
RETURNS TRIGGER AS $$
BEGIN
  -- Générer un code unique au format MENT-YYYY-NNNNNN
  NEW.code_suivi := 'MENT-' || 
                    TO_CHAR(NOW(), 'YYYY') || '-' || 
                    LPAD(NEXTVAL('code_suivi_mention_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Créer le trigger pour générer automatiquement le code
DROP TRIGGER IF EXISTS trigger_generer_code_suivi_mention ON avis_mention;
CREATE TRIGGER trigger_generer_code_suivi_mention
  BEFORE INSERT ON avis_mention
  FOR EACH ROW
  WHEN (NEW.code_suivi IS NULL OR NEW.code_suivi = '')
  EXECUTE FUNCTION generer_code_suivi_mention();

-- 5. Créer un trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_avis_mention_updated_at ON avis_mention;
CREATE TRIGGER trigger_update_avis_mention_updated_at
  BEFORE UPDATE ON avis_mention
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_avis_mention_code_suivi ON avis_mention(code_suivi);
CREATE INDEX IF NOT EXISTS idx_avis_mention_citoyen_id ON avis_mention(citoyen_id);
CREATE INDEX IF NOT EXISTS idx_avis_mention_mairie_id ON avis_mention(mairie_id);
CREATE INDEX IF NOT EXISTS idx_avis_mention_statut ON avis_mention(statut);
CREATE INDEX IF NOT EXISTS idx_avis_mention_type_mention ON avis_mention(type_mention);

-- 7. Ajouter des commentaires
COMMENT ON TABLE avis_mention IS 'Table des avis de mention (mariage, divorce, décès, reconnaissance)';
COMMENT ON COLUMN avis_mention.code_suivi IS 'Code unique de suivi au format MENT-YYYY-NNNNNN';
COMMENT ON COLUMN avis_mention.type_mention IS 'Type de mention: mariage, divorce, deces, reconnaissance';
COMMENT ON COLUMN avis_mention.numero_acte_original IS 'Numéro de l''acte sur lequel apposer la mention';
COMMENT ON COLUMN avis_mention.type_acte_original IS 'Type de l''acte original: naissance, mariage';
COMMENT ON COLUMN avis_mention.conditions_acceptees IS 'Le citoyen a accepté les avertissements légaux';
COMMENT ON COLUMN avis_mention.documents_verifies IS 'Les documents ont été vérifiés par l''agent';
COMMENT ON COLUMN avis_mention.documents_recus IS 'Liste JSON des documents reçus et vérifiés';
COMMENT ON COLUMN avis_mention.statut IS 'Statut: en_attente, validee, documents_verifies, remis, rejetee';

-- 8. Vérifier la création
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'avis_mention'
ORDER BY ordinal_position;

-- 9. Tester la génération de code
-- INSERT INTO avis_mention (
--   citoyen_id,
--   mairie_id,
--   type_mention,
--   numero_acte_original,
--   type_acte_original,
--   date_evenement,
--   lieu_evenement,
--   conditions_acceptees
-- ) VALUES (
--   (SELECT id FROM users WHERE role = 'citoyen' LIMIT 1),
--   (SELECT id FROM mairies LIMIT 1),
--   'mariage',
--   'N-2024-001234',
--   'naissance',
--   '2024-05-15',
--   'Abidjan',
--   true
-- )
-- RETURNING code_suivi, type_mention, statut;

SELECT '✅ Table avis_mention créée avec succès !' as message;
