-- ========================================
-- CRÉATION TABLE DECLARATIONS_NAISSANCE
-- ========================================

-- Créer l'enum pour le sexe
CREATE TYPE sexe_enum AS ENUM ('masculin', 'feminin');

-- Créer l'enum pour le statut
CREATE TYPE statut_declaration_enum AS ENUM ('en_attente', 'en_traitement', 'validee', 'rejetee');

-- Créer la table declarations_naissance
CREATE TABLE IF NOT EXISTS public.declarations_naissance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_suivi TEXT UNIQUE NOT NULL,
  citoyen_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mairie_id UUID REFERENCES public.mairies(id),
  
  -- Informations sur l'enfant
  nom_enfant TEXT NOT NULL,
  prenom_enfant TEXT NOT NULL,
  date_naissance DATE NOT NULL,
  heure_naissance TIME NOT NULL,
  lieu_naissance TEXT NOT NULL,
  sexe sexe_enum NOT NULL,
  
  -- Informations sur le père
  nom_pere TEXT NOT NULL,
  prenom_pere TEXT NOT NULL,
  date_naissance_pere DATE NOT NULL,
  nationalite_pere TEXT NOT NULL,
  profession_pere TEXT NOT NULL,
  
  -- Informations sur la mère
  nom_mere TEXT NOT NULL,
  prenom_mere TEXT NOT NULL,
  date_naissance_mere DATE NOT NULL,
  nationalite_mere TEXT NOT NULL,
  profession_mere TEXT NOT NULL,
  
  -- Gestion de la déclaration
  statut statut_declaration_enum DEFAULT 'en_attente' NOT NULL,
  motif_rejet TEXT,
  agent_id UUID REFERENCES auth.users(id),
  acte_id UUID REFERENCES public.naissances(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_declarations_code_suivi ON public.declarations_naissance(code_suivi);
CREATE INDEX idx_declarations_citoyen ON public.declarations_naissance(citoyen_id);
CREATE INDEX idx_declarations_mairie ON public.declarations_naissance(mairie_id);
CREATE INDEX idx_declarations_statut ON public.declarations_naissance(statut);
CREATE INDEX idx_declarations_created ON public.declarations_naissance(created_at DESC);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_declarations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER trigger_declarations_updated_at
  BEFORE UPDATE ON public.declarations_naissance
  FOR EACH ROW
  EXECUTE FUNCTION update_declarations_updated_at();

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Activer RLS
ALTER TABLE public.declarations_naissance ENABLE ROW LEVEL SECURITY;

-- Policy : Le citoyen voit uniquement ses propres déclarations
CREATE POLICY "Citoyens voient leurs déclarations"
  ON public.declarations_naissance
  FOR SELECT
  USING (
    auth.uid() = citoyen_id
  );

-- Policy : Le citoyen peut créer ses propres déclarations
CREATE POLICY "Citoyens créent leurs déclarations"
  ON public.declarations_naissance
  FOR INSERT
  WITH CHECK (
    auth.uid() = citoyen_id
  );

-- Policy : Les agents voient les déclarations de leur mairie
CREATE POLICY "Agents voient déclarations de leur mairie"
  ON public.declarations_naissance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'agent'
      AND users.mairie_id = declarations_naissance.mairie_id
    )
  );

-- Policy : Les agents peuvent modifier les déclarations de leur mairie
CREATE POLICY "Agents modifient déclarations de leur mairie"
  ON public.declarations_naissance
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'agent'
      AND users.mairie_id = declarations_naissance.mairie_id
    )
  );

-- Policy : Le ministère voit toutes les déclarations
CREATE POLICY "Ministere voit toutes les déclarations"
  ON public.declarations_naissance
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'ministere'
    )
  );

-- ========================================
-- COMMENTAIRES
-- ========================================

COMMENT ON TABLE public.declarations_naissance IS 'Déclarations de naissance soumises par les citoyens';
COMMENT ON COLUMN public.declarations_naissance.code_suivi IS 'Code unique de suivi format NAI-AAAA-XXX-XXXXX';
COMMENT ON COLUMN public.declarations_naissance.statut IS 'Statut de la déclaration: en_attente, en_traitement, validee, rejetee';
COMMENT ON COLUMN public.declarations_naissance.acte_id IS 'ID de l''acte officiel généré après validation';

-- ========================================
-- VÉRIFICATION
-- ========================================

SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'declarations_naissance'
ORDER BY ordinal_position;
