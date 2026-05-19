-- Table pour l'historique des vérifications d'actes
CREATE TABLE IF NOT EXISTS verifications_actes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_acte TEXT NOT NULL,
  type_acte TEXT NOT NULL CHECK (type_acte IN ('naissance', 'mariage', 'deces')),
  mairie_id UUID REFERENCES mairies(id),
  statut_verification TEXT NOT NULL CHECK (statut_verification IN ('valide', 'invalide', 'suspect')),
  nombre_verifications INTEGER DEFAULT 1,
  derniere_verification TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verifie_par UUID REFERENCES users(id),
  details_acte JSONB,
  anomalies TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_verifications_numero_acte ON verifications_actes(numero_acte);
CREATE INDEX IF NOT EXISTS idx_verifications_type_acte ON verifications_actes(type_acte);
CREATE INDEX IF NOT EXISTS idx_verifications_mairie ON verifications_actes(mairie_id);
CREATE INDEX IF NOT EXISTS idx_verifications_statut ON verifications_actes(statut_verification);
CREATE INDEX IF NOT EXISTS idx_verifications_date ON verifications_actes(derniere_verification DESC);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_verifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_verifications_updated_at
  BEFORE UPDATE ON verifications_actes
  FOR EACH ROW
  EXECUTE FUNCTION update_verifications_updated_at();

-- RLS (Row Level Security)
ALTER TABLE verifications_actes ENABLE ROW LEVEL SECURITY;

-- Policy : Le ministère peut tout voir
CREATE POLICY "Ministere peut tout voir sur verifications_actes"
  ON verifications_actes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ministere'
    )
  );

-- Policy : Le ministère peut tout insérer
CREATE POLICY "Ministere peut inserer verifications_actes"
  ON verifications_actes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ministere'
    )
  );

-- Policy : Le ministère peut tout modifier
CREATE POLICY "Ministere peut modifier verifications_actes"
  ON verifications_actes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ministere'
    )
  );

-- Commentaires
COMMENT ON TABLE verifications_actes IS 'Historique des vérifications d''actes d''état civil';
COMMENT ON COLUMN verifications_actes.numero_acte IS 'Numéro de l''acte vérifié';
COMMENT ON COLUMN verifications_actes.type_acte IS 'Type d''acte: naissance, mariage ou deces';
COMMENT ON COLUMN verifications_actes.statut_verification IS 'Résultat: valide, invalide ou suspect';
COMMENT ON COLUMN verifications_actes.nombre_verifications IS 'Nombre de fois que cet acte a été vérifié';
COMMENT ON COLUMN verifications_actes.anomalies IS 'Liste des anomalies détectées';
