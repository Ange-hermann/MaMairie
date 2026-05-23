-- ========================================
-- CRÉATION TABLE AVIS DE MENTION
-- ========================================

-- Créer l'enum pour le type d'acte cible
DROP TYPE IF EXISTS type_acte_mention_enum CASCADE;
CREATE TYPE type_acte_mention_enum AS ENUM ('naissance', 'mariage', 'deces');

-- Créer l'enum pour le type de mention
DROP TYPE IF EXISTS type_mention_enum CASCADE;
CREATE TYPE type_mention_enum AS ENUM (
  'divorce',
  'reconnaissance_paternite',
  'adoption',
  'changement_nom',
  'changement_prenom',
  'deces',
  'mariage',
  'annulation',
  'rectification'
);

-- Créer l'enum pour le statut
DROP TYPE IF EXISTS statut_mention_enum CASCADE;
CREATE TYPE statut_mention_enum AS ENUM ('en_attente', 'en_traitement', 'approuvee', 'rejetee');

-- Créer la table avis_mentions
DROP TABLE IF EXISTS public.avis_mentions CASCADE;
CREATE TABLE public.avis_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_suivi TEXT UNIQUE NOT NULL,
  
  -- Demandeur
  citoyen_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Acte cible (à annoter)
  type_acte_cible type_acte_mention_enum NOT NULL,
  numero_acte_cible TEXT NOT NULL,
  mairie_id UUID REFERENCES public.mairies(id),
  annee_acte_cible INTEGER NOT NULL,
  
  -- Détails de la mention
  type_mention type_mention_enum NOT NULL,
  description_mention TEXT NOT NULL,
  date_evenement DATE NOT NULL,
  
  -- Pièces justificatives
  pieces_justificatives TEXT[] DEFAULT '{}',
  
  -- Gestion de la demande
  statut statut_mention_enum DEFAULT 'en_attente' NOT NULL,
  motif_rejet TEXT,
  agent_id UUID REFERENCES auth.users(id),
  date_traitement TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_avis_mentions_code_suivi ON public.avis_mentions(code_suivi);
CREATE INDEX idx_avis_mentions_citoyen ON public.avis_mentions(citoyen_id);
CREATE INDEX idx_avis_mentions_mairie ON public.avis_mentions(mairie_id);
CREATE INDEX idx_avis_mentions_statut ON public.avis_mentions(statut);
CREATE INDEX idx_avis_mentions_acte_cible ON public.avis_mentions(numero_acte_cible, annee_acte_cible);
CREATE INDEX idx_avis_mentions_created ON public.avis_mentions(created_at DESC);

-- Commentaires pour documentation
COMMENT ON TABLE public.avis_mentions IS 'Avis de mention pour annotations marginales sur actes d''état civil';
COMMENT ON COLUMN public.avis_mentions.code_suivi IS 'Code unique format MEN-AAAA-XXX-XXXXX';
COMMENT ON COLUMN public.avis_mentions.type_acte_cible IS 'Type de l''acte à annoter';
COMMENT ON COLUMN public.avis_mentions.numero_acte_cible IS 'Numéro de l''acte original';
COMMENT ON COLUMN public.avis_mentions.type_mention IS 'Type de mention à apposer';
COMMENT ON COLUMN public.avis_mentions.pieces_justificatives IS 'URLs des documents justificatifs uploadés';

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_avis_mentions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_avis_mentions_updated_at ON public.avis_mentions;
CREATE TRIGGER trigger_avis_mentions_updated_at
  BEFORE UPDATE ON public.avis_mentions
  FOR EACH ROW
  EXECUTE FUNCTION update_avis_mentions_updated_at();

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Activer RLS
ALTER TABLE public.avis_mentions ENABLE ROW LEVEL SECURITY;

-- Policy : Le citoyen voit uniquement ses propres avis
DROP POLICY IF EXISTS "Citoyens voient leurs avis" ON public.avis_mentions;
CREATE POLICY "Citoyens voient leurs avis"
  ON public.avis_mentions
  FOR SELECT
  USING (auth.uid() = citoyen_id);

-- Policy : Le citoyen peut créer ses propres avis
DROP POLICY IF EXISTS "Citoyens créent leurs avis" ON public.avis_mentions;
CREATE POLICY "Citoyens créent leurs avis"
  ON public.avis_mentions
  FOR INSERT
  WITH CHECK (auth.uid() = citoyen_id);

-- Policy : Les agents voient les avis de leur mairie
DROP POLICY IF EXISTS "Agents voient avis de leur mairie" ON public.avis_mentions;
CREATE POLICY "Agents voient avis de leur mairie"
  ON public.avis_mentions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'agent'
      AND users.mairie_id = avis_mentions.mairie_id
    )
  );

-- Policy : Les agents peuvent modifier les avis de leur mairie
DROP POLICY IF EXISTS "Agents modifient avis de leur mairie" ON public.avis_mentions;
CREATE POLICY "Agents modifient avis de leur mairie"
  ON public.avis_mentions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'agent'
      AND users.mairie_id = avis_mentions.mairie_id
    )
  );

-- Policy : Le ministère voit tous les avis
DROP POLICY IF EXISTS "Ministère voit tous les avis" ON public.avis_mentions;
CREATE POLICY "Ministère voit tous les avis"
  ON public.avis_mentions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'ministere'
    )
  );

-- Policy : Accès public par code de suivi (pour le suivi)
DROP POLICY IF EXISTS "Public peut chercher par code mention" ON public.avis_mentions;
CREATE POLICY "Public peut chercher par code mention"
  ON public.avis_mentions
  FOR SELECT
  USING (true);

-- ========================================
-- TABLE DE LIAISON : MENTIONS APPOSÉES
-- ========================================
-- Historique des mentions effectivement apposées sur les actes

DROP TABLE IF EXISTS public.mentions_apposees CASCADE;
CREATE TABLE public.mentions_apposees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avis_mention_id UUID NOT NULL REFERENCES public.avis_mentions(id) ON DELETE CASCADE,
  
  -- Acte annoté
  type_acte type_acte_mention_enum NOT NULL,
  acte_id UUID NOT NULL, -- ID de l'acte (naissance/mariage/deces)
  
  -- Mention
  type_mention type_mention_enum NOT NULL,
  texte_mention TEXT NOT NULL,
  date_mention DATE NOT NULL,
  
  -- Agent ayant apposé la mention
  agent_id UUID NOT NULL REFERENCES auth.users(id),
  date_apposition TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_mentions_apposees_acte ON public.mentions_apposees(type_acte, acte_id);
CREATE INDEX idx_mentions_apposees_avis ON public.mentions_apposees(avis_mention_id);

-- RLS
ALTER TABLE public.mentions_apposees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tous peuvent voir mentions apposées" ON public.mentions_apposees;
CREATE POLICY "Tous peuvent voir mentions apposées"
  ON public.mentions_apposees
  FOR SELECT
  USING (true);

-- ========================================
-- VÉRIFICATION
-- ========================================

-- Vérifier les types créés
SELECT 
  typname as type_name,
  array_agg(enumlabel ORDER BY enumsortorder) as values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE typname LIKE '%mention%'
GROUP BY typname;

-- Vérifier les tables
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('avis_mentions', 'mentions_apposees');

-- Vérifier les policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename IN ('avis_mentions', 'mentions_apposees')
ORDER BY tablename, policyname;
