-- ========================================
-- COMMUNES PRINCIPALES DE CÔTE D'IVOIRE
-- Version simplifiée sans accents problématiques
-- ========================================

-- DISTRICT ABIDJAN (10 communes)
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Abobo', 'COM-ABO-001', id, 'urbaine', 1200000 FROM sous_prefectures WHERE nom = 'Abobo' LIMIT 1;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Adjame', 'COM-ADJ-001', id, 'urbaine', 400000 FROM sous_prefectures WHERE nom = 'Adjame' OR nom = 'Abobo' LIMIT 1;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Attecoube', 'COM-ATT-001', id, 'urbaine', 350000 FROM sous_prefectures WHERE nom = 'Attecoube' OR nom = 'Abobo' LIMIT 1;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Cocody', 'COM-COC-001', id, 'urbaine', 450000 FROM sous_prefectures WHERE nom = 'Cocody' LIMIT 1;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Koumassi', 'COM-KOU-001', id, 'urbaine', 500000 FROM sous_prefectures WHERE nom = 'Koumassi' OR nom = 'Abobo' LIMIT 1;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Marcory', 'COM-MAR-001', id, 'urbaine', 300000 FROM sous_prefectures WHERE nom = 'Marcory' OR nom = 'Abobo' LIMIT 1;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Plateau', 'COM-PLA-001', id, 'urbaine', 15000 FROM sous_prefectures WHERE nom = 'Plateau' OR nom = 'Abobo' LIMIT 1;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Port-Bouet', 'COM-PBO-001', id, 'urbaine', 400000 FROM sous_prefectures WHERE nom = 'Port-Bouet' OR nom = 'Abobo' LIMIT 1;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Treichville', 'COM-TRE-001', id, 'urbaine', 120000 FROM sous_prefectures WHERE nom = 'Treichville' OR nom = 'Abobo' LIMIT 1;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Yopougon', 'COM-YOP-001', id, 'urbaine', 1500000 FROM sous_prefectures WHERE nom = 'Yopougon' OR nom = 'Abobo' LIMIT 1;

-- GRANDES VILLES
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Bouake', 'COM-BKE-001', id, 'urbaine', 680000 FROM sous_prefectures WHERE nom = 'Bouake' LIMIT 1;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Yamoussoukro', 'COM-YAM-001', id, 'urbaine', 355000 FROM sous_prefectures WHERE nom = 'Yamoussoukro' LIMIT 1;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'San-Pedro', 'COM-SPE-001', id, 'urbaine', 300000 FROM sous_prefectures WHERE nom = 'San-Pedro' LIMIT 1;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Korhogo', 'COM-KOR-001', id, 'urbaine', 285000 FROM sous_prefectures WHERE nom = 'Korhogo' LIMIT 1;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Daloa', 'COM-DAL-001', id, 'urbaine', 270000 FROM sous_prefectures WHERE nom = 'Daloa' LIMIT 1;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Man', 'COM-MAN-001', id, 'urbaine', 150000 FROM sous_prefectures WHERE nom = 'Man' LIMIT 1;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Gagnoa', 'COM-GAG-001', id, 'urbaine', 160000 FROM sous_prefectures WHERE nom = 'Gagnoa' LIMIT 1;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Abengourou', 'COM-ABE-001', id, 'urbaine', 135000 FROM sous_prefectures WHERE nom = 'Abengourou' LIMIT 1;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Divo', 'COM-DIV-001', id, 'urbaine', 125000 FROM sous_prefectures WHERE nom = 'Divo' LIMIT 1;

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) 
SELECT 'Ferkessedougou', 'COM-FER-001', id, 'urbaine', 95000 FROM sous_prefectures WHERE nom = 'Ferkessedougou' LIMIT 1;

-- VERIFICATION
SELECT 
  'Total communes inserees' as info,
  COUNT(*) as nombre
FROM communes;
