-- ========================================
-- CRÉATION HIÉRARCHIE GÉOGRAPHIQUE (VERSION SIMPLIFIÉE)
-- ========================================
-- Sans extension pg_trgm pour compatibilité maximale

-- ========================================
-- 1. TABLE DISTRICTS
-- ========================================
CREATE TABLE IF NOT EXISTS public.districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_districts_nom ON public.districts(nom);
CREATE INDEX IF NOT EXISTS idx_districts_code ON public.districts(code);

-- ========================================
-- 2. TABLE RÉGIONS
-- ========================================
CREATE TABLE IF NOT EXISTS public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_regions_nom ON public.regions(nom);
CREATE INDEX IF NOT EXISTS idx_regions_code ON public.regions(code);
CREATE INDEX IF NOT EXISTS idx_regions_district ON public.regions(district_id);

-- ========================================
-- 3. TABLE DÉPARTEMENTS
-- ========================================
CREATE TABLE IF NOT EXISTS public.departements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  region_id UUID NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_departements_nom ON public.departements(nom);
CREATE INDEX IF NOT EXISTS idx_departements_code ON public.departements(code);
CREATE INDEX IF NOT EXISTS idx_departements_region ON public.departements(region_id);

-- ========================================
-- 4. TABLE SOUS-PRÉFECTURES
-- ========================================
CREATE TABLE IF NOT EXISTS public.sous_prefectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  departement_id UUID NOT NULL REFERENCES public.departements(id) ON DELETE CASCADE,
  chef_lieu TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sous_prefectures_nom ON public.sous_prefectures(nom);
CREATE INDEX IF NOT EXISTS idx_sous_prefectures_code ON public.sous_prefectures(code);
CREATE INDEX IF NOT EXISTS idx_sous_prefectures_departement ON public.sous_prefectures(departement_id);

-- ========================================
-- 5. ENUM TYPE COMMUNE
-- ========================================
DO $$ BEGIN
  CREATE TYPE type_commune_enum AS ENUM ('urbaine', 'rurale');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ========================================
-- 6. TABLE COMMUNES
-- ========================================
CREATE TABLE IF NOT EXISTS public.communes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  sous_prefecture_id UUID NOT NULL REFERENCES public.sous_prefectures(id) ON DELETE CASCADE,
  type_commune type_commune_enum DEFAULT 'rurale',
  population INTEGER,
  superficie_km2 DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_communes_nom ON public.communes(nom);
CREATE INDEX IF NOT EXISTS idx_communes_code ON public.communes(code);
CREATE INDEX IF NOT EXISTS idx_communes_sous_prefecture ON public.communes(sous_prefecture_id);
CREATE INDEX IF NOT EXISTS idx_communes_type ON public.communes(type_commune);

-- ========================================
-- 7. TABLE VILLAGES
-- ========================================
CREATE TABLE IF NOT EXISTS public.villages (
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

CREATE INDEX IF NOT EXISTS idx_villages_nom ON public.villages(nom);
CREATE INDEX IF NOT EXISTS idx_villages_code ON public.villages(code);
CREATE INDEX IF NOT EXISTS idx_villages_commune ON public.villages(commune_id);
CREATE INDEX IF NOT EXISTS idx_villages_sous_prefecture ON public.villages(sous_prefecture_id);
CREATE INDEX IF NOT EXISTS idx_villages_coords ON public.villages(latitude, longitude);

-- ========================================
-- 8. MODIFIER TABLE MAIRIES (lien avec communes)
-- ========================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mairies' AND column_name = 'commune_id'
  ) THEN
    ALTER TABLE public.mairies ADD COLUMN commune_id UUID REFERENCES public.communes(id);
    CREATE INDEX idx_mairies_commune ON public.mairies(commune_id);
  END IF;
END $$;

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================

ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sous_prefectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;

-- Policy : Lecture publique
DROP POLICY IF EXISTS "Public peut lire districts" ON public.districts;
CREATE POLICY "Public peut lire districts" ON public.districts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public peut lire regions" ON public.regions;
CREATE POLICY "Public peut lire regions" ON public.regions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public peut lire departements" ON public.departements;
CREATE POLICY "Public peut lire departements" ON public.departements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public peut lire sous_prefectures" ON public.sous_prefectures;
CREATE POLICY "Public peut lire sous_prefectures" ON public.sous_prefectures FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public peut lire communes" ON public.communes;
CREATE POLICY "Public peut lire communes" ON public.communes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public peut lire villages" ON public.villages;
CREATE POLICY "Public peut lire villages" ON public.villages FOR SELECT USING (true);

-- ========================================
-- VUES UTILES
-- ========================================

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
-- FONCTION : Recherche villages (version simple)
-- ========================================

CREATE OR REPLACE FUNCTION search_villages(search_query TEXT)
RETURNS TABLE (
  village_id UUID,
  village_nom TEXT,
  commune_nom TEXT,
  sous_prefecture_nom TEXT,
  region_nom TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.nom,
    c.nom,
    sp.nom,
    r.nom
  FROM villages v
  JOIN communes c ON v.commune_id = c.id
  JOIN sous_prefectures sp ON c.sous_prefecture_id = sp.id
  JOIN departements d ON sp.departement_id = d.id
  JOIN regions r ON d.region_id = r.id
  WHERE v.nom ILIKE '%' || search_query || '%'
  ORDER BY v.nom
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- VÉRIFICATIONS
-- ========================================

SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('districts', 'regions', 'departements', 'sous_prefectures', 'communes', 'villages')
ORDER BY table_name;
