-- Schéma pour le module État Civil
-- Tables pour gérer les naissances, mariages et décès

-- Table des naissances
CREATE TABLE IF NOT EXISTS public.naissances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mairie_id UUID REFERENCES public.mairies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.users(id),
  
  -- Informations enfant
  nom_enfant VARCHAR(100) NOT NULL,
  prenom_enfant VARCHAR(100) NOT NULL,
  date_naissance DATE NOT NULL,
  heure_naissance TIME,
  lieu_naissance VARCHAR(200) NOT NULL,
  sexe VARCHAR(10) NOT NULL CHECK (sexe IN ('Masculin', 'Féminin')),
  
  -- Informations parents
  nom_pere VARCHAR(100),
  prenom_pere VARCHAR(100),
  nom_mere VARCHAR(100),
  prenom_mere VARCHAR(100),
  
  -- Informations administratives
  numero_registre VARCHAR(50),
  numero_acte VARCHAR(50) UNIQUE NOT NULL,
  annee INTEGER NOT NULL,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_acte_annee UNIQUE (numero_acte, annee)
);

-- Table des décès
CREATE TABLE IF NOT EXISTS public.deces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mairie_id UUID REFERENCES public.mairies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.users(id),
  
  -- Informations défunt
  nom_defunt VARCHAR(100) NOT NULL,
  prenom_defunt VARCHAR(100) NOT NULL,
  date_deces DATE NOT NULL,
  heure_deces TIME,
  lieu_deces VARCHAR(200) NOT NULL,
  cause_deces TEXT,
  
  -- Informations déclarant
  nom_declarant VARCHAR(100),
  prenom_declarant VARCHAR(100),
  relation_declarant VARCHAR(100),
  
  -- Informations administratives
  numero_acte VARCHAR(50) UNIQUE NOT NULL,
  annee INTEGER NOT NULL,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_acte_deces_annee UNIQUE (numero_acte, annee)
);

-- Table des mariages
CREATE TABLE IF NOT EXISTS public.mariages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mairie_id UUID REFERENCES public.mairies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.users(id),
  
  -- Informations époux
  nom_epoux VARCHAR(100) NOT NULL,
  prenom_epoux VARCHAR(100) NOT NULL,
  date_naissance_epoux DATE,
  lieu_naissance_epoux VARCHAR(200),
  
  -- Informations épouse
  nom_epouse VARCHAR(100) NOT NULL,
  prenom_epouse VARCHAR(100) NOT NULL,
  date_naissance_epouse DATE,
  lieu_naissance_epouse VARCHAR(200),
  
  -- Informations mariage
  date_mariage DATE NOT NULL,
  lieu_mariage VARCHAR(200) NOT NULL,
  
  -- Informations administratives
  numero_acte VARCHAR(50) UNIQUE NOT NULL,
  annee INTEGER NOT NULL,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_acte_mariage_annee UNIQUE (numero_acte, annee)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_naissances_mairie ON public.naissances(mairie_id);
CREATE INDEX IF NOT EXISTS idx_naissances_date ON public.naissances(date_naissance);
CREATE INDEX IF NOT EXISTS idx_naissances_annee ON public.naissances(annee);
CREATE INDEX IF NOT EXISTS idx_naissances_nom ON public.naissances(nom_enfant, prenom_enfant);

CREATE INDEX IF NOT EXISTS idx_deces_mairie ON public.deces(mairie_id);
CREATE INDEX IF NOT EXISTS idx_deces_date ON public.deces(date_deces);
CREATE INDEX IF NOT EXISTS idx_deces_annee ON public.deces(annee);
CREATE INDEX IF NOT EXISTS idx_deces_nom ON public.deces(nom_defunt, prenom_defunt);

CREATE INDEX IF NOT EXISTS idx_mariages_mairie ON public.mariages(mairie_id);
CREATE INDEX IF NOT EXISTS idx_mariages_date ON public.mariages(date_mariage);
CREATE INDEX IF NOT EXISTS idx_mariages_annee ON public.mariages(annee);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_naissances_updated_at BEFORE UPDATE ON public.naissances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deces_updated_at BEFORE UPDATE ON public.deces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mariages_updated_at BEFORE UPDATE ON public.mariages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies pour naissances
ALTER TABLE public.naissances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents peuvent voir naissances de leur mairie"
  ON public.naissances FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.mairie_id = naissances.mairie_id
      AND users.role IN ('agent', 'admin')
    )
  );

CREATE POLICY "Agents peuvent créer naissances"
  ON public.naissances FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.mairie_id = naissances.mairie_id
      AND users.role IN ('agent', 'admin')
    )
  );

CREATE POLICY "Agents peuvent modifier naissances de leur mairie"
  ON public.naissances FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.mairie_id = naissances.mairie_id
      AND users.role IN ('agent', 'admin')
    )
  );

CREATE POLICY "Agents peuvent supprimer naissances de leur mairie"
  ON public.naissances FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.mairie_id = naissances.mairie_id
      AND users.role IN ('agent', 'admin')
    )
  );

-- RLS Policies pour décès (similaires)
ALTER TABLE public.deces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents peuvent voir deces de leur mairie"
  ON public.deces FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.mairie_id = deces.mairie_id
      AND users.role IN ('agent', 'admin')
    )
  );

CREATE POLICY "Agents peuvent créer deces"
  ON public.deces FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.mairie_id = deces.mairie_id
      AND users.role IN ('agent', 'admin')
    )
  );

CREATE POLICY "Agents peuvent modifier deces de leur mairie"
  ON public.deces FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.mairie_id = deces.mairie_id
      AND users.role IN ('agent', 'admin')
    )
  );

CREATE POLICY "Agents peuvent supprimer deces de leur mairie"
  ON public.deces FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.mairie_id = deces.mairie_id
      AND users.role IN ('agent', 'admin')
    )
  );

-- RLS Policies pour mariages (similaires)
ALTER TABLE public.mariages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents peuvent voir mariages de leur mairie"
  ON public.mariages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.mairie_id = mariages.mairie_id
      AND users.role IN ('agent', 'admin')
    )
  );

CREATE POLICY "Agents peuvent créer mariages"
  ON public.mariages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.mairie_id = mariages.mairie_id
      AND users.role IN ('agent', 'admin')
    )
  );

CREATE POLICY "Agents peuvent modifier mariages de leur mairie"
  ON public.mariages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.mairie_id = mariages.mairie_id
      AND users.role IN ('agent', 'admin')
    )
  );

CREATE POLICY "Agents peuvent supprimer mariages de leur mairie"
  ON public.mariages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.mairie_id = mariages.mairie_id
      AND users.role IN ('agent', 'admin')
    )
  );

-- Vérification
SELECT 'Tables créées avec succès!' AS message;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('naissances', 'deces', 'mariages');
