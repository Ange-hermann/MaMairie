-- ============================================================
-- TABLE : reservations_mariage
-- Système de réservation de mariage par les citoyens
-- ============================================================

CREATE TABLE IF NOT EXISTS reservations_mariage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code_reservation TEXT UNIQUE NOT NULL,
  
  -- Époux
  nom_epoux TEXT NOT NULL,
  prenom_epoux TEXT NOT NULL,
  date_naissance_epoux DATE NOT NULL,
  lieu_naissance_epoux TEXT NOT NULL,
  nationalite_epoux TEXT DEFAULT 'Ivoirienne',
  profession_epoux TEXT,
  domicile_epoux TEXT,
  numero_cni_epoux TEXT NOT NULL,
  
  -- Épouse
  nom_epouse TEXT NOT NULL,
  prenom_epouse TEXT NOT NULL,
  date_naissance_epouse DATE NOT NULL,
  lieu_naissance_epouse TEXT NOT NULL,
  nationalite_epouse TEXT DEFAULT 'Ivoirienne',
  profession_epouse TEXT,
  domicile_epouse TEXT,
  numero_cni_epouse TEXT NOT NULL,
  
  -- Mariage
  date_mariage_souhaitee DATE NOT NULL,
  lieu_mariage TEXT,
  regime_matrimonial TEXT DEFAULT 'Droit commun',
  
  -- Témoins
  temoin1_nom TEXT,
  temoin1_prenom TEXT,
  temoin1_numero_cni TEXT,
  temoin1_nationalite TEXT DEFAULT 'Ivoirienne',
  temoin1_profession TEXT,
  temoin1_adresse TEXT,
  
  temoin2_nom TEXT,
  temoin2_prenom TEXT,
  temoin2_numero_cni TEXT,
  temoin2_nationalite TEXT DEFAULT 'Ivoirienne',
  temoin2_profession TEXT,
  temoin2_adresse TEXT,
  
  -- Statut (workflow : en_attente → validee → documents_verifies → acte_genere | rejetee)
  statut TEXT DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'validee', 'rejetee', 'documents_verifies', 'acte_genere')),
  motif_rejet TEXT,

  -- Vérification bigamie
  verification_bigamie_effectuee BOOLEAN DEFAULT false,
  bigamie_detectee BOOLEAN DEFAULT false,

  -- Vérification physique des documents (étape 2 : citoyen se présente à la mairie)
  documents_verifies BOOLEAN DEFAULT false,
  date_verification_documents TIMESTAMPTZ,
  agent_verification_id UUID REFERENCES auth.users(id),
  -- Checklist documents reçus
  doc_cni_epoux BOOLEAN DEFAULT false,
  doc_cni_epouse BOOLEAN DEFAULT false,
  doc_extrait_naissance_epoux BOOLEAN DEFAULT false,
  doc_extrait_naissance_epouse BOOLEAN DEFAULT false,
  doc_certificat_celibat_epoux BOOLEAN DEFAULT false,
  doc_certificat_celibat_epouse BOOLEAN DEFAULT false,
  doc_temoins BOOLEAN DEFAULT false,
  observations_verification TEXT,

  -- Relations
  citoyen_id UUID REFERENCES auth.users(id),
  mairie_id UUID,
  agent_id UUID REFERENCES auth.users(id),
  mariage_id UUID REFERENCES mariages(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  date_traitement TIMESTAMPTZ
);

-- Contrainte : la date de mariage doit être au moins 3 mois après la réservation
-- (vérifiée côté application)

-- Index pour la recherche rapide
CREATE INDEX IF NOT EXISTS idx_reservations_mariage_code ON reservations_mariage(code_reservation);
CREATE INDEX IF NOT EXISTS idx_reservations_mariage_mairie ON reservations_mariage(mairie_id);
CREATE INDEX IF NOT EXISTS idx_reservations_mariage_statut ON reservations_mariage(statut);
CREATE INDEX IF NOT EXISTS idx_reservations_mariage_cni_epoux ON reservations_mariage(numero_cni_epoux);
CREATE INDEX IF NOT EXISTS idx_reservations_mariage_cni_epouse ON reservations_mariage(numero_cni_epouse);

-- RLS
ALTER TABLE reservations_mariage ENABLE ROW LEVEL SECURITY;

-- Citoyens peuvent créer et voir leurs réservations
CREATE POLICY "citoyen_insert_reservation" ON reservations_mariage
  FOR INSERT WITH CHECK (auth.uid() = citoyen_id);

CREATE POLICY "citoyen_select_own" ON reservations_mariage
  FOR SELECT USING (auth.uid() = citoyen_id);

-- Agents peuvent voir et mettre à jour les réservations de leur mairie
CREATE POLICY "agent_select_mairie" ON reservations_mariage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'agent'
      AND u.mairie_id = reservations_mariage.mairie_id
    )
  );

CREATE POLICY "agent_update_reservation" ON reservations_mariage
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'agent'
      AND u.mairie_id = reservations_mariage.mairie_id
    )
  );

-- Ministère peut tout voir
CREATE POLICY "ministere_select_all" ON reservations_mariage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'ministere'
    )
  );
