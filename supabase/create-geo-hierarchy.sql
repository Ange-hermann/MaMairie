-- ========================================
-- CRÉATION HIÉRARCHIE GÉOGRAPHIQUE CÔTE D'IVOIRE
-- ========================================
-- Hiérarchie : District → Région → Département → Sous-préfecture → Commune → Village

-- Activer l'extension pg_trgm pour la recherche full-text
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ========================================
-- 1. TABLE DISTRICTS
-- ========================================
DROP TABLE IF EXISTS public.districts CASCADE;
CREATE TABLE public.districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_districts_nom ON public.districts(nom);
CREATE INDEX idx_districts_code ON public.districts(code);

-- Commentaires
COMMENT ON TABLE public.districts IS 'Districts administratifs de Côte d''Ivoire (12 districts)';
COMMENT ON COLUMN public.districts.code IS 'Code unique du district (ex: DIS-ABJ)';

-- ========================================
-- 2. TABLE RÉGIONS
-- ========================================
DROP TABLE IF EXISTS public.regions CASCADE;
CREATE TABLE public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_regions_nom ON public.regions(nom);
CREATE INDEX idx_regions_code ON public.regions(code);
CREATE INDEX idx_regions_district ON public.regions(district_id);

-- Commentaires
COMMENT ON TABLE public.regions IS 'Régions administratives de Côte d''Ivoire (31 régions)';
COMMENT ON COLUMN public.regions.district_id IS 'District parent';

-- ========================================
-- 3. TABLE DÉPARTEMENTS
-- ========================================
DROP TABLE IF EXISTS public.departements CASCADE;
CREATE TABLE public.departements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  region_id UUID NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_departements_nom ON public.departements(nom);
CREATE INDEX idx_departements_code ON public.departements(code);
CREATE INDEX idx_departements_region ON public.departements(region_id);

-- Commentaires
COMMENT ON TABLE public.departements IS 'Départements de Côte d''Ivoire (107 départements)';
COMMENT ON COLUMN public.departements.region_id IS 'Région parente';

-- ========================================
-- 4. TABLE SOUS-PRÉFECTURES
-- ========================================
DROP TABLE IF EXISTS public.sous_prefectures CASCADE;
CREATE TABLE public.sous_prefectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  departement_id UUID NOT NULL REFERENCES public.departements(id) ON DELETE CASCADE,
  chef_lieu TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_sous_prefectures_nom ON public.sous_prefectures(nom);
CREATE INDEX idx_sous_prefectures_code ON public.sous_prefectures(code);
CREATE INDEX idx_sous_prefectures_departement ON public.sous_prefectures(departement_id);

-- Commentaires
COMMENT ON TABLE public.sous_prefectures IS 'Sous-préfectures de Côte d''Ivoire (510 sous-préfectures)';
COMMENT ON COLUMN public.sous_prefectures.chef_lieu IS 'Chef-lieu de la sous-préfecture';

-- ========================================
-- 5. ENUM TYPE COMMUNE
-- ========================================
DROP TYPE IF EXISTS type_commune_enum CASCADE;
CREATE TYPE type_commune_enum AS ENUM ('urbaine', 'rurale');

-- ========================================
-- 6. TABLE COMMUNES (modifier ou recréer)
-- ========================================
DROP TABLE IF EXISTS public.communes CASCADE;
CREATE TABLE public.communes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  sous_prefecture_id UUID NOT NULL REFERENCES public.sous_prefectures(id) ON DELETE CASCADE,
  type_commune type_commune_enum DEFAULT 'rurale',
  population INTEGER,
  superficie_km2 DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_communes_nom ON public.communes(nom);
CREATE INDEX idx_communes_code ON public.communes(code);
CREATE INDEX idx_communes_sous_prefecture ON public.communes(sous_prefecture_id);
CREATE INDEX idx_communes_type ON public.communes(type_commune);

-- Commentaires
COMMENT ON TABLE public.communes IS 'Communes de Côte d''Ivoire (201 communes)';
COMMENT ON COLUMN public.communes.code IS 'Code unique (ex: COM-ABJ-001)';
COMMENT ON COLUMN public.communes.type_commune IS 'Type : urbaine ou rurale';

-- ========================================
-- 7. TABLE VILLAGES
-- ========================================
DROP TABLE IF EXISTS public.villages CASCADE;
CREATE TABLE public.villages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  commune_id UUID NOT NULL REFERENCES public.communes(id) ON DELETE CASCADE,
  sous_prefecture_id UUID NOT NULL REFERENCES public.sous_prefectures(id) ON DELETE CASCADE,
  population INTEGER,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_villages_nom ON public.villages(nom);
CREATE INDEX idx_villages_code ON public.villages(code);
CREATE INDEX idx_villages_commune ON public.villages(commune_id);
CREATE INDEX idx_villages_sous_prefecture ON public.villages(sous_prefecture_id);
CREATE INDEX idx_villages_coords ON public.villages(latitude, longitude);

-- Index full-text search
CREATE INDEX idx_villages_nom_trgm ON public.villages USING gin(nom gin_trgm_ops);

-- Commentaires
COMMENT ON TABLE public.villages IS 'Villages de Côte d''Ivoire (8000+ villages)';
COMMENT ON COLUMN public.villages.latitude IS 'Coordonnée GPS latitude';
COMMENT ON COLUMN public.villages.longitude IS 'Coordonnée GPS longitude';

-- ========================================
-- 8. MODIFIER TABLE MAIRIES (lien avec communes)
-- ========================================
-- Ajouter colonne commune_id si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mairies' AND column_name = 'commune_id'
  ) THEN
    ALTER TABLE public.mairies ADD COLUMN commune_id UUID REFERENCES public.communes(id);
    CREATE INDEX idx_mairies_commune ON public.mairies(commune_id);
    COMMENT ON COLUMN public.mairies.commune_id IS 'Commune de rattachement de la mairie';
  END IF;
END $$;

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sous_prefectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;

-- Policy : Tout le monde peut lire (données publiques)
CREATE POLICY "Public peut lire districts" ON public.districts FOR SELECT USING (true);
CREATE POLICY "Public peut lire regions" ON public.regions FOR SELECT USING (true);
CREATE POLICY "Public peut lire departements" ON public.departements FOR SELECT USING (true);
CREATE POLICY "Public peut lire sous_prefectures" ON public.sous_prefectures FOR SELECT USING (true);
CREATE POLICY "Public peut lire communes" ON public.communes FOR SELECT USING (true);
CREATE POLICY "Public peut lire villages" ON public.villages FOR SELECT USING (true);

-- Policy : Seuls les admins peuvent modifier
CREATE POLICY "Admin peut modifier districts" ON public.districts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Admin peut modifier regions" ON public.regions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Admin peut modifier departements" ON public.departements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Admin peut modifier sous_prefectures" ON public.sous_prefectures FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Admin peut modifier communes" ON public.communes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Admin peut modifier villages" ON public.villages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- ========================================
-- VUES UTILES
-- ========================================

-- Vue : Hiérarchie complète des communes
CREATE OR REPLACE VIEW v_communes_hierarchie AS
SELECT 
  c.id as commune_id,
  c.nom as commune_nom,
  c.code as commune_code,
  c.type_commune,
  sp.id as sous_prefecture_id,
  sp.nom as sous_prefecture_nom,
  d.id as departement_id,
  d.nom as departement_nom,
  r.id as region_id,
  r.nom as region_nom,
  dis.id as district_id,
  dis.nom as district_nom
FROM communes c
JOIN sous_prefectures sp ON c.sous_prefecture_id = sp.id
JOIN departements d ON sp.departement_id = d.id
JOIN regions r ON d.region_id = r.id
JOIN districts dis ON r.district_id = dis.id;

-- Vue : Hiérarchie complète des villages
CREATE OR REPLACE VIEW v_villages_hierarchie AS
SELECT 
  v.id as village_id,
  v.nom as village_nom,
  v.code as village_code,
  v.population as village_population,
  c.id as commune_id,
  c.nom as commune_nom,
  sp.id as sous_prefecture_id,
  sp.nom as sous_prefecture_nom,
  d.id as departement_id,
  d.nom as departement_nom,
  r.id as region_id,
  r.nom as region_nom,
  dis.id as district_id,
  dis.nom as district_nom
FROM villages v
JOIN communes c ON v.commune_id = c.id
JOIN sous_prefectures sp ON c.sous_prefecture_id = sp.id
JOIN departements d ON sp.departement_id = d.id
JOIN regions r ON d.region_id = r.id
JOIN districts dis ON r.district_id = dis.id;

-- ========================================
-- FONCTIONS UTILES
-- ========================================

-- Fonction : Obtenir la hiérarchie complète d'une commune
CREATE OR REPLACE FUNCTION get_commune_hierarchy(commune_uuid UUID)
RETURNS TABLE (
  district_nom TEXT,
  region_nom TEXT,
  departement_nom TEXT,
  sous_prefecture_nom TEXT,
  commune_nom TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dis.nom,
    r.nom,
    d.nom,
    sp.nom,
    c.nom
  FROM communes c
  JOIN sous_prefectures sp ON c.sous_prefecture_id = sp.id
  JOIN departements d ON sp.departement_id = d.id
  JOIN regions r ON d.region_id = r.id
  JOIN districts dis ON r.district_id = dis.id
  WHERE c.id = commune_uuid;
END;
$$ LANGUAGE plpgsql;

-- Fonction : Recherche full-text villages
CREATE OR REPLACE FUNCTION search_villages(search_query TEXT)
RETURNS TABLE (
  village_id UUID,
  village_nom TEXT,
  commune_nom TEXT,
  sous_prefecture_nom TEXT,
  region_nom TEXT,
  similarity_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.nom,
    c.nom,
    sp.nom,
    r.nom,
    similarity(v.nom, search_query) as score
  FROM villages v
  JOIN communes c ON v.commune_id = c.id
  JOIN sous_prefectures sp ON c.sous_prefecture_id = sp.id
  JOIN departements d ON sp.departement_id = d.id
  JOIN regions r ON d.region_id = r.id
  WHERE v.nom ILIKE '%' || search_query || '%'
  ORDER BY score DESC, v.nom
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- VÉRIFICATIONS
-- ========================================

-- Vérifier les tables créées
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('districts', 'regions', 'departements', 'sous_prefectures', 'communes', 'villages')
ORDER BY table_name;

-- Vérifier les index
SELECT 
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('districts', 'regions', 'departements', 'sous_prefectures', 'communes', 'villages')
ORDER BY tablename, indexname;

-- Vérifier les policies
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('districts', 'regions', 'departements', 'sous_prefectures', 'communes', 'villages')
ORDER BY tablename, policyname;
