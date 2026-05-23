-- Créer la table mentions_apposees

CREATE TABLE IF NOT EXISTS mentions_apposees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  avis_mention_id UUID REFERENCES avis_mentions(id),
  type_acte TEXT NOT NULL,
  acte_id UUID,
  type_mention TEXT NOT NULL,
  texte_mention TEXT,
  date_mention DATE,
  agent_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE mentions_apposees ENABLE ROW LEVEL SECURITY;

-- Policy pour les agents
CREATE POLICY "Agents peuvent tout faire sur mentions_apposees"
  ON mentions_apposees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('agent', 'ministere')
    )
  );

SELECT '✅ Table mentions_apposees créée !' as resultat;
