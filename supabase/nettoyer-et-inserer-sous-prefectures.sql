-- ========================================
-- NETTOYAGE ET INSERTION DES SOUS-PRÉFECTURES
-- Environ 510 sous-préfectures en Côte d'Ivoire
-- ========================================

-- ÉTAPE 1 : Rendre les colonnes nullable temporairement
ALTER TABLE sous_prefectures ALTER COLUMN departement_id DROP NOT NULL;
ALTER TABLE communes ALTER COLUMN sous_prefecture_id DROP NOT NULL;
ALTER TABLE villages ALTER COLUMN sous_prefecture_id DROP NOT NULL;
ALTER TABLE mairies ALTER COLUMN sous_prefecture_id DROP NOT NULL;

-- ÉTAPE 2 : Nettoyer les références
UPDATE mairies SET sous_prefecture_id = NULL WHERE sous_prefecture_id IS NOT NULL;
UPDATE communes SET sous_prefecture_id = NULL WHERE sous_prefecture_id IS NOT NULL;
UPDATE villages SET sous_prefecture_id = NULL WHERE sous_prefecture_id IS NOT NULL;

-- ÉTAPE 3 : Supprimer toutes les sous-préfectures existantes
DELETE FROM sous_prefectures;

-- ========================================
-- ÉTAPE 3 : INSÉRER LES SOUS-PRÉFECTURES
-- ========================================

-- Pour chaque département, créer automatiquement des sous-préfectures
-- basées sur le nom du département

INSERT INTO sous_prefectures (nom, code, departement_id)
SELECT 
  d.nom || ' Centre',
  'SP-' || UPPER(LEFT(REPLACE(d.nom, ' ', ''), 3)) || '-001',
  d.id
FROM departements d
WHERE NOT EXISTS (
  SELECT 1 FROM sous_prefectures sp WHERE sp.departement_id = d.id
)
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- SOUS-PRÉFECTURES SPÉCIFIQUES PAR DISTRICT
-- ========================================

-- DISTRICT ABIDJAN
INSERT INTO sous_prefectures (nom, code, departement_id) VALUES
('Abobo', 'SP-ABO', (SELECT id FROM departements WHERE nom LIKE '%Abidjan%' LIMIT 1)),
('Cocody', 'SP-COC', (SELECT id FROM departements WHERE nom LIKE '%Abidjan%' LIMIT 1)),
('Yopougon', 'SP-YOP', (SELECT id FROM departements WHERE nom LIKE '%Abidjan%' LIMIT 1)),
('Songon', 'SP-SON', (SELECT id FROM departements WHERE nom LIKE '%Abidjan%' LIMIT 1)),
('Bingerville', 'SP-BIN', (SELECT id FROM departements WHERE nom LIKE '%Abidjan%' LIMIT 1)),
('Anyama', 'SP-ANY', (SELECT id FROM departements WHERE nom LIKE '%Abidjan%' LIMIT 1))
ON CONFLICT (code) DO NOTHING;

-- DISTRICT BAS-SASSANDRA
INSERT INTO sous_prefectures (nom, code, departement_id)
SELECT nom_sp, 'SP-' || UPPER(LEFT(REPLACE(nom_sp, ' ', ''), 3)) || '-' || LPAD(ROW_NUMBER() OVER ()::TEXT, 3, '0'), dept_id
FROM (VALUES
  ('Sassandra', (SELECT id FROM departements WHERE nom LIKE '%Sassandra%' LIMIT 1)),
  ('Fresco', (SELECT id FROM departements WHERE nom LIKE '%Fresco%' LIMIT 1)),
  ('Soubre', (SELECT id FROM departements WHERE nom LIKE '%Soubre%' LIMIT 1)),
  ('Buyo', (SELECT id FROM departements WHERE nom LIKE '%Soubre%' LIMIT 1)),
  ('Meagui', (SELECT id FROM departements WHERE nom LIKE '%Soubre%' LIMIT 1)),
  ('San-Pedro', (SELECT id FROM departements WHERE nom LIKE '%San%' LIMIT 1)),
  ('Tabou', (SELECT id FROM departements WHERE nom LIKE '%Tabou%' LIMIT 1)),
  ('Grand-Bereby', (SELECT id FROM departements WHERE nom LIKE '%Bereby%' LIMIT 1))
) AS t(nom_sp, dept_id)
ON CONFLICT (code) DO NOTHING;

-- DISTRICT COMOE
INSERT INTO sous_prefectures (nom, code, departement_id)
SELECT nom_sp, 'SP-' || UPPER(LEFT(REPLACE(nom_sp, ' ', ''), 3)) || '-' || LPAD(ROW_NUMBER() OVER ()::TEXT, 3, '0'), dept_id
FROM (VALUES
  ('Abengourou', (SELECT id FROM departements WHERE nom LIKE '%Abengourou%' LIMIT 1)),
  ('Agnibilekrou', (SELECT id FROM departements WHERE nom LIKE '%Agnibilekrou%' LIMIT 1)),
  ('Aboisso', (SELECT id FROM departements WHERE nom LIKE '%Aboisso%' LIMIT 1)),
  ('Adiake', (SELECT id FROM departements WHERE nom LIKE '%Adiake%' LIMIT 1)),
  ('Grand-Bassam', (SELECT id FROM departements WHERE nom LIKE '%Bassam%' LIMIT 1)),
  ('Bonoua', (SELECT id FROM departements WHERE nom LIKE '%Bassam%' LIMIT 1)),
  ('Tiapoum', (SELECT id FROM departements WHERE nom LIKE '%Aboisso%' LIMIT 1)),
  ('Ayame', (SELECT id FROM departements WHERE nom LIKE '%Aboisso%' LIMIT 1))
) AS t(nom_sp, dept_id)
ON CONFLICT (code) DO NOTHING;

-- DISTRICT SAVANES
INSERT INTO sous_prefectures (nom, code, departement_id)
SELECT nom_sp, 'SP-' || UPPER(LEFT(REPLACE(nom_sp, ' ', ''), 3)) || '-' || LPAD(ROW_NUMBER() OVER ()::TEXT, 3, '0'), dept_id
FROM (VALUES
  ('Korhogo', (SELECT id FROM departements WHERE nom LIKE '%Korhogo%' LIMIT 1)),
  ('Ferkessedougou', (SELECT id FROM departements WHERE nom LIKE '%Ferkessedougou%' LIMIT 1)),
  ('Boundiali', (SELECT id FROM departements WHERE nom LIKE '%Boundiali%' LIMIT 1)),
  ('Odienne', (SELECT id FROM departements WHERE nom LIKE '%Odienne%' LIMIT 1)),
  ('Tengréla', (SELECT id FROM departements WHERE nom LIKE '%Tengréla%' LIMIT 1)),
  ('Sinematiali', (SELECT id FROM departements WHERE nom LIKE '%Sinematiali%' LIMIT 1)),
  ('Kong', (SELECT id FROM departements WHERE nom LIKE '%Kong%' LIMIT 1)),
  ('Ouangolodougou', (SELECT id FROM departements WHERE nom LIKE '%Ouangolodougou%' LIMIT 1))
) AS t(nom_sp, dept_id)
ON CONFLICT (code) DO NOTHING;

-- DISTRICT VALLEE DU BANDAMA
INSERT INTO sous_prefectures (nom, code, departement_id)
SELECT nom_sp, 'SP-' || UPPER(LEFT(REPLACE(nom_sp, ' ', ''), 3)) || '-' || LPAD(ROW_NUMBER() OVER ()::TEXT, 3, '0'), dept_id
FROM (VALUES
  ('Bouake', (SELECT id FROM departements WHERE nom LIKE '%Bouake%' LIMIT 1)),
  ('Katiola', (SELECT id FROM departements WHERE nom LIKE '%Katiola%' LIMIT 1)),
  ('Dabakala', (SELECT id FROM departements WHERE nom LIKE '%Dabakala%' LIMIT 1)),
  ('Niakaramadougou', (SELECT id FROM departements WHERE nom LIKE '%Niakaramadougou%' LIMIT 1)),
  ('Sakassou', (SELECT id FROM departements WHERE nom LIKE '%Sakassou%' LIMIT 1)),
  ('Beou mi', (SELECT id FROM departements WHERE nom LIKE '%Beoumi%' LIMIT 1)),
  ('Botro', (SELECT id FROM departements WHERE nom LIKE '%Botro%' LIMIT 1))
) AS t(nom_sp, dept_id)
ON CONFLICT (code) DO NOTHING;

-- DISTRICT MONTAGNES
INSERT INTO sous_prefectures (nom, code, departement_id)
SELECT nom_sp, 'SP-' || UPPER(LEFT(REPLACE(nom_sp, ' ', ''), 3)) || '-' || LPAD(ROW_NUMBER() OVER ()::TEXT, 3, '0'), dept_id
FROM (VALUES
  ('Man', (SELECT id FROM departements WHERE nom LIKE '%Man%' LIMIT 1)),
  ('Danane', (SELECT id FROM departements WHERE nom LIKE '%Danane%' LIMIT 1)),
  ('Biankouma', (SELECT id FROM departements WHERE nom LIKE '%Biankouma%' LIMIT 1)),
  ('Zouan-Hounien', (SELECT id FROM departements WHERE nom LIKE '%Zouan%' LIMIT 1)),
  ('Guiglo', (SELECT id FROM departements WHERE nom LIKE '%Guiglo%' LIMIT 1)),
  ('Duekoue', (SELECT id FROM departements WHERE nom LIKE '%Duekoue%' LIMIT 1)),
  ('Bangolo', (SELECT id FROM departements WHERE nom LIKE '%Bangolo%' LIMIT 1)),
  ('Blolequin', (SELECT id FROM departements WHERE nom LIKE '%Blolequin%' LIMIT 1)),
  ('Toulepleu', (SELECT id FROM departements WHERE nom LIKE '%Toulepleu%' LIMIT 1))
) AS t(nom_sp, dept_id)
ON CONFLICT (code) DO NOTHING;

-- DISTRICT SASSANDRA-MARAHOUE
INSERT INTO sous_prefectures (nom, code, departement_id)
SELECT nom_sp, 'SP-' || UPPER(LEFT(REPLACE(nom_sp, ' ', ''), 3)) || '-' || LPAD(ROW_NUMBER() OVER ()::TEXT, 3, '0'), dept_id
FROM (VALUES
  ('Daloa', (SELECT id FROM departements WHERE nom LIKE '%Daloa%' LIMIT 1)),
  ('Issia', (SELECT id FROM departements WHERE nom LIKE '%Issia%' LIMIT 1)),
  ('Vavoua', (SELECT id FROM departements WHERE nom LIKE '%Vavoua%' LIMIT 1)),
  ('Bouafle', (SELECT id FROM departements WHERE nom LIKE '%Bouafle%' LIMIT 1)),
  ('Zuenoula', (SELECT id FROM departements WHERE nom LIKE '%Zuenoula%' LIMIT 1)),
  ('Sinfra', (SELECT id FROM departements WHERE nom LIKE '%Sinfra%' LIMIT 1))
) AS t(nom_sp, dept_id)
ON CONFLICT (code) DO NOTHING;

-- DISTRICT YAMOUSSOUKRO
INSERT INTO sous_prefectures (nom, code, departement_id)
SELECT nom_sp, 'SP-' || UPPER(LEFT(REPLACE(nom_sp, ' ', ''), 3)) || '-' || LPAD(ROW_NUMBER() OVER ()::TEXT, 3, '0'), dept_id
FROM (VALUES
  ('Yamoussoukro', (SELECT id FROM departements WHERE nom LIKE '%Yamoussoukro%' LIMIT 1)),
  ('Attieguakro', (SELECT id FROM departements WHERE nom LIKE '%Yamoussoukro%' LIMIT 1)),
  ('Kossou', (SELECT id FROM departements WHERE nom LIKE '%Yamoussoukro%' LIMIT 1))
) AS t(nom_sp, dept_id)
ON CONFLICT (code) DO NOTHING;

-- DISTRICT LAGUNES
INSERT INTO sous_prefectures (nom, code, departement_id)
SELECT nom_sp, 'SP-' || UPPER(LEFT(REPLACE(nom_sp, ' ', ''), 3)) || '-' || LPAD(ROW_NUMBER() OVER ()::TEXT, 3, '0'), dept_id
FROM (VALUES
  ('Agboville', (SELECT id FROM departements WHERE nom LIKE '%Agboville%' LIMIT 1)),
  ('Tiassale', (SELECT id FROM departements WHERE nom LIKE '%Tiassale%' LIMIT 1)),
  ('Sikensi', (SELECT id FROM departements WHERE nom LIKE '%Sikensi%' LIMIT 1)),
  ('Dabou', (SELECT id FROM departements WHERE nom LIKE '%Dabou%' LIMIT 1)),
  ('Jacqueville', (SELECT id FROM departements WHERE nom LIKE '%Jacqueville%' LIMIT 1)),
  ('Grand-Lahou', (SELECT id FROM departements WHERE nom LIKE '%Lahou%' LIMIT 1)),
  ('Adzope', (SELECT id FROM departements WHERE nom LIKE '%Adzope%' LIMIT 1)),
  ('Alepe', (SELECT id FROM departements WHERE nom LIKE '%Alepe%' LIMIT 1)),
  ('Yakasse-Attobrou', (SELECT id FROM departements WHERE nom LIKE '%Yakasse%' LIMIT 1))
) AS t(nom_sp, dept_id)
ON CONFLICT (code) DO NOTHING;

-- DISTRICT GOH-DJIBOUA
INSERT INTO sous_prefectures (nom, code, departement_id)
SELECT nom_sp, 'SP-' || UPPER(LEFT(REPLACE(nom_sp, ' ', ''), 3)) || '-' || LPAD(ROW_NUMBER() OVER ()::TEXT, 3, '0'), dept_id
FROM (VALUES
  ('Gagnoa', (SELECT id FROM departements WHERE nom LIKE '%Gagnoa%' LIMIT 1)),
  ('Oume', (SELECT id FROM departements WHERE nom LIKE '%Oume%' LIMIT 1)),
  ('Divo', (SELECT id FROM departements WHERE nom LIKE '%Divo%' LIMIT 1)),
  ('Lakota', (SELECT id FROM departements WHERE nom LIKE '%Lakota%' LIMIT 1)),
  ('Guitry', (SELECT id FROM departements WHERE nom LIKE '%Guitry%' LIMIT 1))
) AS t(nom_sp, dept_id)
ON CONFLICT (code) DO NOTHING;

-- DISTRICT LACS
INSERT INTO sous_prefectures (nom, code, departement_id)
SELECT nom_sp, 'SP-' || UPPER(LEFT(REPLACE(nom_sp, ' ', ''), 3)) || '-' || LPAD(ROW_NUMBER() OVER ()::TEXT, 3, '0'), dept_id
FROM (VALUES
  ('Toumodi', (SELECT id FROM departements WHERE nom LIKE '%Toumodi%' LIMIT 1)),
  ('Didievi', (SELECT id FROM departements WHERE nom LIKE '%Didievi%' LIMIT 1)),
  ('Tiebissou', (SELECT id FROM departements WHERE nom LIKE '%Tiebissou%' LIMIT 1)),
  ('Daoukro', (SELECT id FROM departements WHERE nom LIKE '%Daoukro%' LIMIT 1)),
  ('M-Bahiakro', (SELECT id FROM departements WHERE nom LIKE '%Bahiakro%' LIMIT 1)),
  ('Bongouanou', (SELECT id FROM departements WHERE nom LIKE '%Bongouanou%' LIMIT 1)),
  ('Arrah', (SELECT id FROM departements WHERE nom LIKE '%Arrah%' LIMIT 1)),
  ('Dimbokro', (SELECT id FROM departements WHERE nom LIKE '%Dimbokro%' LIMIT 1)),
  ('Bocanda', (SELECT id FROM departements WHERE nom LIKE '%Bocanda%' LIMIT 1))
) AS t(nom_sp, dept_id)
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- GÉNÉRATION AUTOMATIQUE DES SP RESTANTES
-- ========================================

-- Pour chaque département sans sous-préfecture, en créer une
INSERT INTO sous_prefectures (nom, code, departement_id)
SELECT 
  d.nom,
  'SP-' || UPPER(LEFT(REPLACE(d.nom, ' ', ''), 3)) || '-' || LPAD((ROW_NUMBER() OVER (PARTITION BY d.id ORDER BY d.nom))::TEXT, 3, '0'),
  d.id
FROM departements d
WHERE NOT EXISTS (
  SELECT 1 FROM sous_prefectures sp WHERE sp.departement_id = d.id
)
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- VÉRIFICATION
-- ========================================

SELECT 
  'Total sous-prefectures' as info,
  COUNT(*) as nombre
FROM sous_prefectures;

SELECT 
  'Par district' as info,
  dis.nom as district,
  COUNT(sp.id) as nb_sous_prefectures
FROM sous_prefectures sp
JOIN departements d ON sp.departement_id = d.id
JOIN regions r ON d.region_id = r.id
JOIN districts dis ON r.district_id = dis.id
GROUP BY dis.nom
ORDER BY dis.nom;

-- Départements sans sous-préfecture
SELECT 
  'Departements sans SP' as info,
  COUNT(*) as nombre
FROM departements d
WHERE NOT EXISTS (
  SELECT 1 FROM sous_prefectures sp WHERE sp.departement_id = d.id
);

-- ========================================
-- ÉTAPE FINALE (OPTIONNEL) : Remettre les contraintes NOT NULL
-- ========================================
-- Décommentez si vous voulez remettre les contraintes
-- ALTER TABLE communes ALTER COLUMN sous_prefecture_id SET NOT NULL;
-- ALTER TABLE villages ALTER COLUMN sous_prefecture_id SET NOT NULL;
-- ALTER TABLE mairies ALTER COLUMN sous_prefecture_id SET NOT NULL;
