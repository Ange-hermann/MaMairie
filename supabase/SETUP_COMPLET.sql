-- ============================================
-- SETUP COMPLET - MaMairie
-- Exécutez ce script dans Supabase SQL Editor
-- ============================================

-- 1. Supprimer l'ancienne table si elle existe avec des erreurs
DROP TABLE IF EXISTS verifications_actes CASCADE;

-- Créer la table verifications_actes proprement
CREATE TABLE verifications_actes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_acte TEXT NOT NULL,
  type_acte TEXT NOT NULL CHECK (type_acte IN ('naissance', 'mariage', 'deces')),
  mairie_id UUID REFERENCES mairies(id),
  statut_verification TEXT NOT NULL CHECK (statut_verification IN ('valide', 'invalide', 'suspect')),
  nombre_verifications INTEGER DEFAULT 1,
  derniere_verification TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verifie_par UUID REFERENCES users(id),
  details_acte JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_verifications_numero_acte ON verifications_actes(numero_acte);
CREATE INDEX IF NOT EXISTS idx_verifications_type_acte ON verifications_actes(type_acte);
CREATE INDEX IF NOT EXISTS idx_verifications_mairie ON verifications_actes(mairie_id);
CREATE INDEX IF NOT EXISTS idx_verifications_statut ON verifications_actes(statut_verification);

-- 2. Ajouter les colonnes motif_rejet et date_rejet à requests
ALTER TABLE requests ADD COLUMN IF NOT EXISTS motif_rejet TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS date_rejet TIMESTAMP;

-- 3. Supprimer les triggers problématiques
DROP TRIGGER IF EXISTS trigger_notify_agents_new_request ON requests CASCADE;
DROP FUNCTION IF EXISTS notify_agents_new_request() CASCADE;
DROP TRIGGER IF EXISTS trigger_notify_citizen_status_change ON requests CASCADE;
DROP FUNCTION IF EXISTS notify_citizen_status_change() CASCADE;

-- 4. Ajouter fcm_token pour Firebase
ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token TEXT;
CREATE INDEX IF NOT EXISTS idx_users_fcm_token ON users(fcm_token);

-- 5. RLS pour verifications_actes
ALTER TABLE verifications_actes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ministere peut tout voir sur verifications_actes" ON verifications_actes;
CREATE POLICY "Ministere peut tout voir sur verifications_actes"
  ON verifications_actes FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'ministere'
    )
  );

DROP POLICY IF EXISTS "Ministere peut inserer verifications_actes" ON verifications_actes;
CREATE POLICY "Ministere peut inserer verifications_actes"
  ON verifications_actes FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'ministere'
    )
  );

-- 6. Vérifications finales
SELECT 'Table verifications_actes créée' AS status, COUNT(*) AS total FROM verifications_actes;
SELECT 'Colonnes requests vérifiées' AS status, 
  COUNT(*) FILTER (WHERE column_name = 'motif_rejet') AS motif_rejet,
  COUNT(*) FILTER (WHERE column_name = 'date_rejet') AS date_rejet
FROM information_schema.columns 
WHERE table_name = 'requests' AND column_name IN ('motif_rejet', 'date_rejet');

SELECT 'Setup terminé !' AS message;
