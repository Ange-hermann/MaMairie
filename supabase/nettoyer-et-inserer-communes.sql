-- ========================================
-- NETTOYAGE ET INSERTION DES 201 COMMUNES
-- ========================================

-- ÉTAPE 1 : Nettoyer les références dans les mairies
UPDATE mairies SET commune_id = NULL WHERE commune_id IS NOT NULL;
UPDATE mairies SET sous_prefecture_id = NULL WHERE sous_prefecture_id IS NOT NULL;

-- ÉTAPE 2 : Supprimer toutes les communes existantes
DELETE FROM communes;

-- ÉTAPE 2 : Réinitialiser la séquence (si vous utilisez des ID auto-incrémentés)
-- ALTER SEQUENCE communes_id_seq RESTART WITH 1;

-- ========================================
-- ÉTAPE 3 : INSÉRER LES COMMUNES
-- ========================================

-- DISTRICT ABIDJAN (13 communes)
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Abobo', 'COM-ABO-001', id, 'urbaine', 1200000 FROM sous_prefectures WHERE nom LIKE '%Abobo%' OR nom LIKE '%Abidjan%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Adjame', 'COM-ADJ-001', id, 'urbaine', 400000 FROM sous_prefectures WHERE nom LIKE '%Adjame%' OR nom LIKE '%Abidjan%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Attecoube', 'COM-ATT-001', id, 'urbaine', 350000 FROM sous_prefectures WHERE nom LIKE '%Attecoube%' OR nom LIKE '%Abidjan%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Cocody', 'COM-COC-001', id, 'urbaine', 450000 FROM sous_prefectures WHERE nom LIKE '%Cocody%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Koumassi', 'COM-KOU-001', id, 'urbaine', 500000 FROM sous_prefectures WHERE nom LIKE '%Koumassi%' OR nom LIKE '%Abidjan%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Marcory', 'COM-MAR-001', id, 'urbaine', 300000 FROM sous_prefectures WHERE nom LIKE '%Marcory%' OR nom LIKE '%Abidjan%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Plateau', 'COM-PLA-001', id, 'urbaine', 15000 FROM sous_prefectures WHERE nom LIKE '%Plateau%' OR nom LIKE '%Abidjan%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Port-Bouet', 'COM-PBO-001', id, 'urbaine', 400000 FROM sous_prefectures WHERE nom LIKE '%Port%' OR nom LIKE '%Abidjan%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Treichville', 'COM-TRE-001', id, 'urbaine', 120000 FROM sous_prefectures WHERE nom LIKE '%Treichville%' OR nom LIKE '%Abidjan%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Yopougon', 'COM-YOP-001', id, 'urbaine', 1500000 FROM sous_prefectures WHERE nom LIKE '%Yopougon%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Songon', 'COM-SON-001', id, 'rurale', 50000 FROM sous_prefectures WHERE nom LIKE '%Songon%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Bingerville', 'COM-BIN-001', id, 'urbaine', 90000 FROM sous_prefectures WHERE nom LIKE '%Bingerville%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Anyama', 'COM-ANY-001', id, 'urbaine', 100000 FROM sous_prefectures WHERE nom LIKE '%Anyama%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

-- GRANDES VILLES
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Bouake', 'COM-BKE-001', id, 'urbaine', 680000 FROM sous_prefectures WHERE nom LIKE '%Bouake%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Yamoussoukro', 'COM-YAM-001', id, 'urbaine', 355000 FROM sous_prefectures WHERE nom LIKE '%Yamoussoukro%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'San-Pedro', 'COM-SPE-001', id, 'urbaine', 300000 FROM sous_prefectures WHERE nom LIKE '%San%Pedro%' OR nom LIKE '%San-Pedro%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Korhogo', 'COM-KOR-001', id, 'urbaine', 285000 FROM sous_prefectures WHERE nom LIKE '%Korhogo%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Daloa', 'COM-DAL-001', id, 'urbaine', 270000 FROM sous_prefectures WHERE nom LIKE '%Daloa%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Man', 'COM-MAN-001', id, 'urbaine', 150000 FROM sous_prefectures WHERE nom LIKE '%Man%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Gagnoa', 'COM-GAG-001', id, 'urbaine', 160000 FROM sous_prefectures WHERE nom LIKE '%Gagnoa%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Abengourou', 'COM-ABE-001', id, 'urbaine', 135000 FROM sous_prefectures WHERE nom LIKE '%Abengourou%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Divo', 'COM-DIV-001', id, 'urbaine', 125000 FROM sous_prefectures WHERE nom LIKE '%Divo%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Ferkessedougou', 'COM-FER-001', id, 'urbaine', 95000 FROM sous_prefectures WHERE nom LIKE '%Ferkessedougou%' LIMIT 1
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- ÉTAPE 4 : GÉNÉRER LES COMMUNES RESTANTES
-- ========================================

-- Pour chaque sous-préfecture sans commune, créer une commune
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune)
SELECT 
  sp.nom,
  'COM-' || UPPER(LEFT(REPLACE(sp.nom, ' ', ''), 3)) || '-' || LPAD(ROW_NUMBER() OVER (ORDER BY sp.nom)::TEXT, 3, '0'),
  sp.id,
  'rurale'
FROM sous_prefectures sp
WHERE NOT EXISTS (
  SELECT 1 FROM communes c WHERE c.sous_prefecture_id = sp.id
)
ORDER BY sp.nom
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- VÉRIFICATION
-- ========================================

SELECT 
  'Total communes' as info,
  COUNT(*) as nombre
FROM communes;

SELECT 
  'Par type' as info,
  type_commune,
  COUNT(*) as nombre
FROM communes
GROUP BY type_commune;

SELECT 
  'Par district' as info,
  dis.nom as district,
  COUNT(c.id) as nb_communes
FROM communes c
JOIN sous_prefectures sp ON c.sous_prefecture_id = sp.id
JOIN departements d ON sp.departement_id = d.id
JOIN regions r ON d.region_id = r.id
JOIN districts dis ON r.district_id = dis.id
GROUP BY dis.nom
ORDER BY dis.nom;
