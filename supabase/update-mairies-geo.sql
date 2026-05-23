-- ========================================
-- MISE À JOUR TABLE MAIRIES AVEC GÉOGRAPHIE
-- ========================================

-- 1. Ajouter les colonnes géographiques à la table mairies
ALTER TABLE public.mairies 
ADD COLUMN IF NOT EXISTS commune_id UUID REFERENCES public.communes(id),
ADD COLUMN IF NOT EXISTS sous_prefecture_id UUID REFERENCES public.sous_prefectures(id),
ADD COLUMN IF NOT EXISTS gere_villages BOOLEAN DEFAULT false;

-- Index
CREATE INDEX IF NOT EXISTS idx_mairies_commune ON public.mairies(commune_id);
CREATE INDEX IF NOT EXISTS idx_mairies_sous_prefecture ON public.mairies(sous_prefecture_id);

-- Commentaires
COMMENT ON COLUMN public.mairies.commune_id IS 'Commune de rattachement (si mairie communale)';
COMMENT ON COLUMN public.mairies.sous_prefecture_id IS 'Sous-préfecture de rattachement (si mairie sous-préfectorale)';
COMMENT ON COLUMN public.mairies.gere_villages IS 'Si true, cette mairie gère directement les villages de la sous-préfecture';

-- ========================================
-- 2. FONCTION : Trouver la mairie compétente pour un village
-- ========================================

CREATE OR REPLACE FUNCTION get_mairie_competente(village_uuid UUID)
RETURNS TABLE (
  mairie_id UUID,
  mairie_nom TEXT,
  type_rattachement TEXT
) AS $$
DECLARE
  v_commune_id UUID;
  v_sous_prefecture_id UUID;
  mairie_found BOOLEAN := false;
BEGIN
  -- Récupérer les IDs de la commune et sous-préfecture du village
  SELECT commune_id, sous_prefecture_id 
  INTO v_commune_id, v_sous_prefecture_id
  FROM villages 
  WHERE id = village_uuid;

  -- 1. D'abord chercher une mairie communale
  FOR mairie_id, mairie_nom, type_rattachement IN
    SELECT m.id, m.nom_mairie, 'communale'::TEXT
    FROM mairies m
    WHERE m.commune_id = v_commune_id
    LIMIT 1
  LOOP
    mairie_found := true;
    RETURN NEXT;
  END LOOP;

  -- 2. Si pas de mairie communale, chercher une mairie sous-préfectorale
  IF NOT mairie_found THEN
    FOR mairie_id, mairie_nom, type_rattachement IN
      SELECT m.id, m.nom_mairie, 'sous_prefectorale'::TEXT
      FROM mairies m
      WHERE m.sous_prefecture_id = v_sous_prefecture_id
      AND m.gere_villages = true
      LIMIT 1
    LOOP
      RETURN NEXT;
    END LOOP;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 3. FONCTION : Obtenir tous les villages gérés par une mairie
-- ========================================

CREATE OR REPLACE FUNCTION get_villages_mairie(mairie_uuid UUID)
RETURNS TABLE (
  village_id UUID,
  village_nom TEXT,
  population INTEGER
) AS $$
DECLARE
  m_commune_id UUID;
  m_sous_prefecture_id UUID;
  m_gere_villages BOOLEAN;
BEGIN
  -- Récupérer les infos de la mairie
  SELECT commune_id, sous_prefecture_id, COALESCE(gere_villages, false)
  INTO m_commune_id, m_sous_prefecture_id, m_gere_villages
  FROM mairies
  WHERE id = mairie_uuid;

  -- Si mairie communale
  IF m_commune_id IS NOT NULL THEN
    RETURN QUERY
    SELECT v.id, v.nom, v.population
    FROM villages v
    WHERE v.commune_id = m_commune_id
    ORDER BY v.nom;
  
  -- Si mairie sous-préfectorale qui gère les villages
  ELSIF m_sous_prefecture_id IS NOT NULL AND m_gere_villages THEN
    RETURN QUERY
    SELECT v.id, v.nom, v.population
    FROM villages v
    WHERE v.sous_prefecture_id = m_sous_prefecture_id
    ORDER BY v.nom;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 4. VUE : Mairies avec leur hiérarchie géographique
-- ========================================

CREATE OR REPLACE VIEW v_mairies_hierarchie AS
SELECT 
  m.id as mairie_id,
  m.nom_mairie,
  m.ville,
  m.code_mairie,
  m.gere_villages,
  -- Commune
  c.id as commune_id,
  c.nom as commune_nom,
  c.type_commune,
  -- Sous-préfecture
  sp.id as sous_prefecture_id,
  sp.nom as sous_prefecture_nom,
  -- Département
  d.id as departement_id,
  d.nom as departement_nom,
  -- Région
  r.id as region_id,
  r.nom as region_nom,
  -- District
  dis.id as district_id,
  dis.nom as district_nom,
  -- Nombre de villages gérés
  (SELECT COUNT(*) FROM villages v 
   WHERE v.commune_id = m.commune_id 
   OR (v.sous_prefecture_id = m.sous_prefecture_id AND m.gere_villages)
  ) as nb_villages
FROM mairies m
LEFT JOIN communes c ON m.commune_id = c.id
LEFT JOIN sous_prefectures sp ON COALESCE(c.sous_prefecture_id, m.sous_prefecture_id) = sp.id
LEFT JOIN departements d ON sp.departement_id = d.id
LEFT JOIN regions r ON d.region_id = r.id
LEFT JOIN districts dis ON r.district_id = dis.id;

-- ========================================
-- 5. MISE À JOUR DES MAIRIES EXISTANTES
-- ========================================

-- Exemple : Assigner la mairie d'Abobo à la commune d'Abobo
UPDATE mairies 
SET commune_id = (SELECT id FROM communes WHERE code = 'COM-ABO-001')
WHERE ville ILIKE '%Abobo%' OR nom_mairie ILIKE '%Abobo%';

-- Exemple : Assigner la mairie de Cocody à la commune de Cocody
UPDATE mairies 
SET commune_id = (SELECT id FROM communes WHERE code = 'COM-COC-001')
WHERE ville ILIKE '%Cocody%' OR nom_mairie ILIKE '%Cocody%';

-- ========================================
-- VÉRIFICATIONS
-- ========================================

-- Voir les mairies avec leur hiérarchie
SELECT * FROM v_mairies_hierarchie LIMIT 10;

-- Tester la recherche de mairie compétente
SELECT * FROM get_mairie_competente(
  (SELECT id FROM villages WHERE nom LIKE '%Riviera%' LIMIT 1)
);

-- Voir les villages d'une mairie
SELECT * FROM get_villages_mairie(
  (SELECT id FROM mairies WHERE ville ILIKE '%Cocody%' LIMIT 1)
);
