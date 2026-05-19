-- ============================================
-- IMPORT POPULATION INITIALE PAR MAIRIE
-- ============================================

-- Option 1 : Importer depuis une API externe (ex: API INS Côte d'Ivoire)
-- Option 2 : Importer depuis un fichier CSV
-- Option 3 : Saisir manuellement les données de recensement

-- ============================================
-- MÉTHODE 1 : TABLE DE POPULATION INITIALE
-- ============================================

-- Créer une table pour stocker la population initiale
CREATE TABLE IF NOT EXISTS population_initiale (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mairie_id UUID REFERENCES mairies(id) ON DELETE CASCADE,
  annee INTEGER NOT NULL,
  population INTEGER NOT NULL,
  source VARCHAR(255), -- Ex: "Recensement 2021", "API INS", "Estimation"
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(mairie_id, annee)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_population_initiale_mairie ON population_initiale(mairie_id);
CREATE INDEX IF NOT EXISTS idx_population_initiale_annee ON population_initiale(annee);

-- ============================================
-- EXEMPLE : IMPORTER DES DONNÉES
-- ============================================

-- Exemple pour quelques mairies (REMPLACER PAR VOS VRAIES DONNÉES)
INSERT INTO population_initiale (mairie_id, annee, population, source)
VALUES
  -- Récupérer les IDs de mairies
  ((SELECT id FROM mairies WHERE nom_mairie = 'Mairie de Cocody' LIMIT 1), 2021, 450000, 'Recensement 2021'),
  ((SELECT id FROM mairies WHERE nom_mairie = 'Mairie de Yopougon' LIMIT 1), 2021, 1200000, 'Recensement 2021'),
  ((SELECT id FROM mairies WHERE nom_mairie = 'Mairie de Bouaké' LIMIT 1), 2021, 680000, 'Recensement 2021'),
  ((SELECT id FROM mairies WHERE nom_mairie = 'Mairie de Daloa' LIMIT 1), 2021, 320000, 'Recensement 2021')
ON CONFLICT (mairie_id, annee) DO NOTHING;

-- ============================================
-- FONCTION : CALCULER POPULATION AVEC DONNÉES INITIALES
-- ============================================

CREATE OR REPLACE FUNCTION get_population_complete()
RETURNS TABLE (
  mairie_id UUID,
  nom_mairie VARCHAR,
  ville VARCHAR,
  region VARCHAR,
  naissances BIGINT,
  mariages BIGINT,
  deces BIGINT,
  population_initiale INTEGER,
  population_actuelle BIGINT,
  evolution INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as mairie_id,
    m.nom_mairie,
    m.ville,
    m.region,
    COALESCE(COUNT(DISTINCT n.id), 0) as naissances,
    COALESCE(COUNT(DISTINCT ma.id), 0) as mariages,
    COALESCE(COUNT(DISTINCT d.id), 0) as deces,
    COALESCE(pi.population, 0) as population_initiale,
    -- Population actuelle = Population initiale + (Naissances - Décès depuis l'année de référence)
    COALESCE(pi.population, 0) + 
    COALESCE(COUNT(DISTINCT n.id), 0) - 
    COALESCE(COUNT(DISTINCT d.id), 0) as population_actuelle,
    -- Évolution en %
    CASE 
      WHEN COALESCE(pi.population, 0) > 0 THEN
        ROUND(((COALESCE(COUNT(DISTINCT n.id), 0) - COALESCE(COUNT(DISTINCT d.id), 0))::NUMERIC / pi.population * 100)::NUMERIC, 2)::INTEGER
      ELSE 0
    END as evolution
  FROM mairies m
  LEFT JOIN population_initiale pi ON pi.mairie_id = m.id AND pi.annee = 2021
  LEFT JOIN naissances n ON n.mairie_id = m.id
  LEFT JOIN mariages ma ON ma.mairie_id = m.id
  LEFT JOIN deces d ON d.mairie_id = m.id
  GROUP BY m.id, m.nom_mairie, m.ville, m.region, pi.population
  ORDER BY population_actuelle DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- UTILISATION
-- ============================================

-- Voir la population complète
SELECT * FROM get_population_complete();

-- Voir uniquement les mairies avec population initiale
SELECT * FROM get_population_complete()
WHERE population_initiale > 0;

-- ============================================
-- IMPORT DEPUIS CSV (EXEMPLE)
-- ============================================

-- Si vous avez un fichier CSV avec les données de recensement :
-- 1. Préparer le CSV avec colonnes : nom_mairie, population, annee
-- 2. Utiliser l'interface Supabase pour importer
-- 3. Ou utiliser COPY (si accès direct à PostgreSQL)

/*
COPY population_initiale (mairie_id, annee, population, source)
FROM '/path/to/recensement.csv'
DELIMITER ','
CSV HEADER;
*/

-- ============================================
-- IMPORT DEPUIS API EXTERNE
-- ============================================

-- Créer une fonction pour importer depuis une API
CREATE OR REPLACE FUNCTION import_population_from_api(api_data JSONB)
RETURNS void AS $$
DECLARE
  item JSONB;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(api_data)
  LOOP
    INSERT INTO population_initiale (mairie_id, annee, population, source)
    VALUES (
      (SELECT id FROM mairies WHERE nom_mairie = item->>'nom_mairie' LIMIT 1),
      (item->>'annee')::INTEGER,
      (item->>'population')::INTEGER,
      item->>'source'
    )
    ON CONFLICT (mairie_id, annee) DO UPDATE
    SET population = EXCLUDED.population;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Exemple d'utilisation :
/*
SELECT import_population_from_api('[
  {"nom_mairie": "Mairie de Cocody", "annee": 2021, "population": 450000, "source": "API INS"},
  {"nom_mairie": "Mairie de Yopougon", "annee": 2021, "population": 1200000, "source": "API INS"}
]'::jsonb);
*/

-- ============================================
-- VÉRIFICATIONS
-- ============================================

-- Compter les mairies avec population initiale
SELECT COUNT(*) as mairies_avec_population
FROM population_initiale;

-- Voir la population totale
SELECT 
  SUM(population) as population_totale,
  COUNT(*) as nombre_mairies,
  AVG(population) as population_moyenne
FROM population_initiale
WHERE annee = 2021;

-- Mairies sans population initiale
SELECT m.nom_mairie, m.ville
FROM mairies m
LEFT JOIN population_initiale pi ON pi.mairie_id = m.id
WHERE pi.id IS NULL;
