-- ========================================
-- SEED DONNÉES GÉOGRAPHIQUES CÔTE D'IVOIRE
-- ========================================

-- ========================================
-- 1. DISTRICTS (12 districts)
-- ========================================

INSERT INTO public.districts (nom, code) VALUES
('Abidjan', 'DIS-ABJ'),
('Bas-Sassandra', 'DIS-BSS'),
('Comoé', 'DIS-COM'),
('Denguélé', 'DIS-DEN'),
('Gôh-Djiboua', 'DIS-GDJ'),
('Lacs', 'DIS-LAC'),
('Lagunes', 'DIS-LAG'),
('Montagnes', 'DIS-MON'),
('Sassandra-Marahoué', 'DIS-SAM'),
('Savanes', 'DIS-SAV'),
('Vallée du Bandama', 'DIS-VDB'),
('Woroba', 'DIS-WOR'),
('Yamoussoukro', 'DIS-YAM'),
('Zanzan', 'DIS-ZAN')
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- 2. RÉGIONS (31 régions principales)
-- ========================================

-- Régions du District d'Abidjan
INSERT INTO public.regions (nom, code, district_id) VALUES
('Abidjan', 'REG-ABJ', (SELECT id FROM districts WHERE code = 'DIS-ABJ'))
ON CONFLICT (code) DO NOTHING;

-- Régions du District Bas-Sassandra
INSERT INTO public.regions (nom, code, district_id) VALUES
('Gbôklé', 'REG-GBO', (SELECT id FROM districts WHERE code = 'DIS-BSS')),
('Nawa', 'REG-NAW', (SELECT id FROM districts WHERE code = 'DIS-BSS')),
('San-Pédro', 'REG-SPE', (SELECT id FROM districts WHERE code = 'DIS-BSS'))
ON CONFLICT (code) DO NOTHING;

-- Régions du District Comoé
INSERT INTO public.regions (nom, code, district_id) VALUES
('Indénié-Djuablin', 'REG-IDJ', (SELECT id FROM districts WHERE code = 'DIS-COM')),
('Sud-Comoé', 'REG-SCO', (SELECT id FROM districts WHERE code = 'DIS-COM'))
ON CONFLICT (code) DO NOTHING;

-- Régions du District Denguélé
INSERT INTO public.regions (nom, code, district_id) VALUES
('Folon', 'REG-FOL', (SELECT id FROM districts WHERE code = 'DIS-DEN')),
('Kabadougou', 'REG-KAB', (SELECT id FROM districts WHERE code = 'DIS-DEN'))
ON CONFLICT (code) DO NOTHING;

-- Régions du District Gôh-Djiboua
INSERT INTO public.regions (nom, code, district_id) VALUES
('Gôh', 'REG-GOH', (SELECT id FROM districts WHERE code = 'DIS-GDJ')),
('Lôh-Djiboua', 'REG-LDJ', (SELECT id FROM districts WHERE code = 'DIS-GDJ'))
ON CONFLICT (code) DO NOTHING;

-- Régions du District Lacs
INSERT INTO public.regions (nom, code, district_id) VALUES
('Bélier', 'REG-BEL', (SELECT id FROM districts WHERE code = 'DIS-LAC')),
('Iffou', 'REG-IFF', (SELECT id FROM districts WHERE code = 'DIS-LAC')),
('Moronou', 'REG-MOR', (SELECT id FROM districts WHERE code = 'DIS-LAC')),
('N''Zi', 'REG-NZI', (SELECT id FROM districts WHERE code = 'DIS-LAC'))
ON CONFLICT (code) DO NOTHING;

-- Régions du District Lagunes
INSERT INTO public.regions (nom, code, district_id) VALUES
('Agnéby-Tiassa', 'REG-AGT', (SELECT id FROM districts WHERE code = 'DIS-LAG')),
('Grands-Ponts', 'REG-GPO', (SELECT id FROM districts WHERE code = 'DIS-LAG')),
('La Mé', 'REG-LME', (SELECT id FROM districts WHERE code = 'DIS-LAG'))
ON CONFLICT (code) DO NOTHING;

-- Régions du District Montagnes
INSERT INTO public.regions (nom, code, district_id) VALUES
('Cavally', 'REG-CAV', (SELECT id FROM districts WHERE code = 'DIS-MON')),
('Guémon', 'REG-GUE', (SELECT id FROM districts WHERE code = 'DIS-MON')),
('Tonkpi', 'REG-TON', (SELECT id FROM districts WHERE code = 'DIS-MON'))
ON CONFLICT (code) DO NOTHING;

-- Régions du District Sassandra-Marahoué
INSERT INTO public.regions (nom, code, district_id) VALUES
('Haut-Sassandra', 'REG-HSA', (SELECT id FROM districts WHERE code = 'DIS-SAM')),
('Marahoué', 'REG-MAR', (SELECT id FROM districts WHERE code = 'DIS-SAM'))
ON CONFLICT (code) DO NOTHING;

-- Régions du District Savanes
INSERT INTO public.regions (nom, code, district_id) VALUES
('Bagoué', 'REG-BAG', (SELECT id FROM districts WHERE code = 'DIS-SAV')),
('Poro', 'REG-POR', (SELECT id FROM districts WHERE code = 'DIS-SAV')),
('Tchologo', 'REG-TCH', (SELECT id FROM districts WHERE code = 'DIS-SAV'))
ON CONFLICT (code) DO NOTHING;

-- Régions du District Vallée du Bandama
INSERT INTO public.regions (nom, code, district_id) VALUES
('Gbêkê', 'REG-GBE', (SELECT id FROM districts WHERE code = 'DIS-VDB')),
('Hambol', 'REG-HAM', (SELECT id FROM districts WHERE code = 'DIS-VDB'))
ON CONFLICT (code) DO NOTHING;

-- Régions du District Woroba
INSERT INTO public.regions (nom, code, district_id) VALUES
('Béré', 'REG-BER', (SELECT id FROM districts WHERE code = 'DIS-WOR')),
('Bafing', 'REG-BAF', (SELECT id FROM districts WHERE code = 'DIS-WOR')),
('Worodougou', 'REG-WRO', (SELECT id FROM districts WHERE code = 'DIS-WOR'))
ON CONFLICT (code) DO NOTHING;

-- Région du District Yamoussoukro
INSERT INTO public.regions (nom, code, district_id) VALUES
('Yamoussoukro', 'REG-YAM', (SELECT id FROM districts WHERE code = 'DIS-YAM'))
ON CONFLICT (code) DO NOTHING;

-- Régions du District Zanzan
INSERT INTO public.regions (nom, code, district_id) VALUES
('Bounkani', 'REG-BOU', (SELECT id FROM districts WHERE code = 'DIS-ZAN')),
('Gontougo', 'REG-GON', (SELECT id FROM districts WHERE code = 'DIS-ZAN'))
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- 3. DÉPARTEMENTS (Principaux départements)
-- ========================================

-- Départements de la Région d'Abidjan
INSERT INTO public.departements (nom, code, region_id) VALUES
('Abidjan', 'DEP-ABJ', (SELECT id FROM regions WHERE code = 'REG-ABJ')),
('Anyama', 'DEP-ANY', (SELECT id FROM regions WHERE code = 'REG-ABJ')),
('Bingerville', 'DEP-BIN', (SELECT id FROM regions WHERE code = 'REG-ABJ')),
('Songon', 'DEP-SON', (SELECT id FROM regions WHERE code = 'REG-ABJ'))
ON CONFLICT (code) DO NOTHING;

-- Départements de la Région Gbêkê (Bouaké)
INSERT INTO public.departements (nom, code, region_id) VALUES
('Bouaké', 'DEP-BKE', (SELECT id FROM regions WHERE code = 'REG-GBE')),
('Béoumi', 'DEP-BEO', (SELECT id FROM regions WHERE code = 'REG-GBE')),
('Botro', 'DEP-BOT', (SELECT id FROM regions WHERE code = 'REG-GBE')),
('Sakassou', 'DEP-SAK', (SELECT id FROM regions WHERE code = 'REG-GBE'))
ON CONFLICT (code) DO NOTHING;

-- Départements de la Région Yamoussoukro
INSERT INTO public.departements (nom, code, region_id) VALUES
('Yamoussoukro', 'DEP-YAM', (SELECT id FROM regions WHERE code = 'REG-YAM')),
('Attiégouakro', 'DEP-ATT', (SELECT id FROM regions WHERE code = 'REG-YAM')),
('Tiébissou', 'DEP-TIE', (SELECT id FROM regions WHERE code = 'REG-YAM'))
ON CONFLICT (code) DO NOTHING;

-- Départements de la Région San-Pédro
INSERT INTO public.departements (nom, code, region_id) VALUES
('San-Pédro', 'DEP-SPE', (SELECT id FROM regions WHERE code = 'REG-SPE')),
('Tabou', 'DEP-TAB', (SELECT id FROM regions WHERE code = 'REG-SPE')),
('Sassandra', 'DEP-SAS', (SELECT id FROM regions WHERE code = 'REG-SPE'))
ON CONFLICT (code) DO NOTHING;

-- Départements de la Région Poro (Korhogo)
INSERT INTO public.departements (nom, code, region_id) VALUES
('Korhogo', 'DEP-KOR', (SELECT id FROM regions WHERE code = 'REG-POR')),
('Sinématiali', 'DEP-SIN', (SELECT id FROM regions WHERE code = 'REG-POR')),
('M''Bengué', 'DEP-MBE', (SELECT id FROM regions WHERE code = 'REG-POR'))
ON CONFLICT (code) DO NOTHING;

-- Départements de la Région Tonkpi (Man)
INSERT INTO public.departements (nom, code, region_id) VALUES
('Man', 'DEP-MAN', (SELECT id FROM regions WHERE code = 'REG-TON')),
('Biankouma', 'DEP-BIA', (SELECT id FROM regions WHERE code = 'REG-TON')),
('Danané', 'DEP-DAN', (SELECT id FROM regions WHERE code = 'REG-TON'))
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- 4. SOUS-PRÉFECTURES (Exemples)
-- ========================================

-- Sous-préfectures du Département d'Abidjan
INSERT INTO public.sous_prefectures (nom, code, departement_id, chef_lieu) VALUES
('Abobo', 'SP-ABO', (SELECT id FROM departements WHERE code = 'DEP-ABJ'), 'Abobo'),
('Adjamé', 'SP-ADJ', (SELECT id FROM departements WHERE code = 'DEP-ABJ'), 'Adjamé'),
('Attécoubé', 'SP-ATT', (SELECT id FROM departements WHERE code = 'DEP-ABJ'), 'Attécoubé'),
('Cocody', 'SP-COC', (SELECT id FROM departements WHERE code = 'DEP-ABJ'), 'Cocody'),
('Koumassi', 'SP-KOU', (SELECT id FROM departements WHERE code = 'DEP-ABJ'), 'Koumassi'),
('Marcory', 'SP-MAR', (SELECT id FROM departements WHERE code = 'DEP-ABJ'), 'Marcory'),
('Plateau', 'SP-PLA', (SELECT id FROM departements WHERE code = 'DEP-ABJ'), 'Plateau'),
('Port-Bouët', 'SP-PBO', (SELECT id FROM departements WHERE code = 'DEP-ABJ'), 'Port-Bouët'),
('Treichville', 'SP-TRE', (SELECT id FROM departements WHERE code = 'DEP-ABJ'), 'Treichville'),
('Yopougon', 'SP-YOP', (SELECT id FROM departements WHERE code = 'DEP-ABJ'), 'Yopougon')
ON CONFLICT (code) DO NOTHING;

-- Sous-préfectures du Département de Bouaké
INSERT INTO public.sous_prefectures (nom, code, departement_id, chef_lieu) VALUES
('Bouaké', 'SP-BKE', (SELECT id FROM departements WHERE code = 'DEP-BKE'), 'Bouaké'),
('Brobo', 'SP-BRO', (SELECT id FROM departements WHERE code = 'DEP-BKE'), 'Brobo'),
('Djébonoua', 'SP-DJE', (SELECT id FROM departements WHERE code = 'DEP-BKE'), 'Djébonoua')
ON CONFLICT (code) DO NOTHING;

-- Sous-préfectures du Département de Yamoussoukro
INSERT INTO public.sous_prefectures (nom, code, departement_id, chef_lieu) VALUES
('Yamoussoukro', 'SP-YAM', (SELECT id FROM departements WHERE code = 'DEP-YAM'), 'Yamoussoukro'),
('Kossou', 'SP-KOS', (SELECT id FROM departements WHERE code = 'DEP-YAM'), 'Kossou')
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- 5. COMMUNES (Exemples de communes urbaines)
-- ========================================

-- Communes d'Abidjan
INSERT INTO public.communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Abobo', 'COM-ABO-001', (SELECT id FROM sous_prefectures WHERE code = 'SP-ABO'), 'urbaine', 1500000),
('Adjamé', 'COM-ADJ-001', (SELECT id FROM sous_prefectures WHERE code = 'SP-ADJ'), 'urbaine', 400000),
('Attécoubé', 'COM-ATT-001', (SELECT id FROM sous_prefectures WHERE code = 'SP-ATT'), 'urbaine', 300000),
('Cocody', 'COM-COC-001', (SELECT id FROM sous_prefectures WHERE code = 'SP-COC'), 'urbaine', 500000),
('Koumassi', 'COM-KOU-001', (SELECT id FROM sous_prefectures WHERE code = 'SP-KOU'), 'urbaine', 450000),
('Marcory', 'COM-MAR-001', (SELECT id FROM sous_prefectures WHERE code = 'SP-MAR'), 'urbaine', 350000),
('Plateau', 'COM-PLA-001', (SELECT id FROM sous_prefectures WHERE code = 'SP-PLA'), 'urbaine', 50000),
('Port-Bouët', 'COM-PBO-001', (SELECT id FROM sous_prefectures WHERE code = 'SP-PBO'), 'urbaine', 400000),
('Treichville', 'COM-TRE-001', (SELECT id FROM sous_prefectures WHERE code = 'SP-TRE'), 'urbaine', 150000),
('Yopougon', 'COM-YOP-001', (SELECT id FROM sous_prefectures WHERE code = 'SP-YOP'), 'urbaine', 1200000)
ON CONFLICT (code) DO NOTHING;

-- Communes de Bouaké
INSERT INTO public.communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Bouaké', 'COM-BKE-001', (SELECT id FROM sous_prefectures WHERE code = 'SP-BKE'), 'urbaine', 700000)
ON CONFLICT (code) DO NOTHING;

-- Commune de Yamoussoukro
INSERT INTO public.communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Yamoussoukro', 'COM-YAM-001', (SELECT id FROM sous_prefectures WHERE code = 'SP-YAM'), 'urbaine', 300000)
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- 6. VILLAGES (Exemples)
-- ========================================

-- Villages de la commune d'Abobo
INSERT INTO public.villages (nom, code, commune_id, sous_prefecture_id, population) VALUES
('Abobo-Gare', 'VIL-ABO-001', (SELECT id FROM communes WHERE code = 'COM-ABO-001'), (SELECT id FROM sous_prefectures WHERE code = 'SP-ABO'), 50000),
('Abobo-Baoulé', 'VIL-ABO-002', (SELECT id FROM communes WHERE code = 'COM-ABO-001'), (SELECT id FROM sous_prefectures WHERE code = 'SP-ABO'), 40000),
('Abobo-PK18', 'VIL-ABO-003', (SELECT id FROM communes WHERE code = 'COM-ABO-001'), (SELECT id FROM sous_prefectures WHERE code = 'SP-ABO'), 35000)
ON CONFLICT (code) DO NOTHING;

-- Villages de la commune de Cocody
INSERT INTO public.villages (nom, code, commune_id, sous_prefecture_id, population) VALUES
('Cocody-Riviera', 'VIL-COC-001', (SELECT id FROM communes WHERE code = 'COM-COC-001'), (SELECT id FROM sous_prefectures WHERE code = 'SP-COC'), 80000),
('Cocody-Angré', 'VIL-COC-002', (SELECT id FROM communes WHERE code = 'COM-COC-001'), (SELECT id FROM sous_prefectures WHERE code = 'SP-COC'), 60000),
('Cocody-Deux-Plateaux', 'VIL-COC-003', (SELECT id FROM communes WHERE code = 'COM-COC-001'), (SELECT id FROM sous_prefectures WHERE code = 'SP-COC'), 70000)
ON CONFLICT (code) DO NOTHING;

-- Villages de la commune de Yopougon
INSERT INTO public.villages (nom, code, commune_id, sous_prefecture_id, population) VALUES
('Yopougon-Niangon', 'VIL-YOP-001', (SELECT id FROM communes WHERE code = 'COM-YOP-001'), (SELECT id FROM sous_prefectures WHERE code = 'SP-YOP'), 100000),
('Yopougon-Sicogi', 'VIL-YOP-002', (SELECT id FROM communes WHERE code = 'COM-YOP-001'), (SELECT id FROM sous_prefectures WHERE code = 'SP-YOP'), 90000),
('Yopougon-Millionnaire', 'VIL-YOP-003', (SELECT id FROM communes WHERE code = 'COM-YOP-001'), (SELECT id FROM sous_prefectures WHERE code = 'SP-YOP'), 80000)
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- VÉRIFICATIONS
-- ========================================

-- Compter les données insérées
SELECT 
  'Districts' as table_name, COUNT(*) as count FROM districts
UNION ALL
SELECT 'Régions', COUNT(*) FROM regions
UNION ALL
SELECT 'Départements', COUNT(*) FROM departements
UNION ALL
SELECT 'Sous-préfectures', COUNT(*) FROM sous_prefectures
UNION ALL
SELECT 'Communes', COUNT(*) FROM communes
UNION ALL
SELECT 'Villages', COUNT(*) FROM villages;

-- Afficher la hiérarchie d'Abidjan
SELECT * FROM v_communes_hierarchie WHERE commune_nom LIKE '%Abobo%';

-- Tester la recherche de villages
SELECT * FROM search_villages('Cocody');
