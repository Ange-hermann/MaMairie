-- ========================================
-- TOUTES LES COMMUNES DE CÔTE D'IVOIRE (201 communes)
-- ========================================
-- Source: Découpage administratif officiel de la Côte d'Ivoire

-- ========================================
-- DISTRICT ABIDJAN (10 communes)
-- ========================================

-- Région Abidjan → Département Abidjan → SP Abidjan
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Abobo', 'COM-ABO-001', (SELECT id FROM sous_prefectures WHERE code = 'SP-ABO'), 'urbaine', 1200000),
('Adjamé', 'COM-ADJ-001', (SELECT id FROM sous_prefectures WHERE code = 'SP-ABO'), 'urbaine', 400000),
('Attécoubé', 'COM-ATT-001', (SELECT id FROM sous_prefectures WHERE code = 'SP-ABO'), 'urbaine', 350000),
('Cocody', 'COM-COC-001', (SELECT id FROM sous_prefectures WHERE code = 'SP-COC'), 'urbaine', 450000),
('Koumassi', 'COM-KOU-001', (SELECT id FROM sous_prefectures WHERE code = 'SP-ABO'), 'urbaine', 500000),
('Marcory', 'COM-MAR-001', (SELECT id FROM sous_prefectures WHERE code = 'SP-ABO'), 'urbaine', 300000),
('Plateau', 'COM-PLA-001', (SELECT id FROM sous_prefectures WHERE code = 'SP-ABO'), 'urbaine', 15000),
('Port-Bouët', 'COM-PBO-001', (SELECT id FROM sous_prefectures WHERE code = 'SP-ABO'), 'urbaine', 400000),
('Treichville', 'COM-TRE-001', (SELECT id FROM sous_prefectures WHERE code = 'SP-ABO'), 'urbaine', 120000),
('Yopougon', 'COM-YOP-001', (SELECT id FROM sous_prefectures WHERE code = 'SP-YOP'), 'urbaine', 1500000);

-- ========================================
-- DISTRICT BAS-SASSANDRA (13 communes)
-- ========================================

-- Région Gbôklé
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune) VALUES
('Sassandra', 'COM-SAS-001', (SELECT id FROM sous_prefectures WHERE nom = 'Sassandra'), 'urbaine'),
('Fresco', 'COM-FRE-001', (SELECT id FROM sous_prefectures WHERE nom = 'Fresco'), 'urbaine');

-- Région Nawa
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune) VALUES
('Soubré', 'COM-SOU-001', (SELECT id FROM sous_prefectures WHERE nom = 'Soubré'), 'urbaine'),
('Buyo', 'COM-BUY-001', (SELECT id FROM sous_prefectures WHERE nom = 'Buyo'), 'rurale'),
('Méagui', 'COM-MEA-001', (SELECT id FROM sous_prefectures WHERE nom = 'Méagui'), 'rurale');

-- Région San-Pédro
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('San-Pédro', 'COM-SPE-001', (SELECT id FROM sous_prefectures WHERE nom = 'San-Pédro'), 'urbaine', 300000),
('Tabou', 'COM-TAB-001', (SELECT id FROM sous_prefectures WHERE nom = 'Tabou'), 'urbaine', 35000),
('Grand-Béréby', 'COM-GBE-001', (SELECT id FROM sous_prefectures WHERE nom = 'Grand-Béréby'), 'rurale');

-- ========================================
-- DISTRICT COMOÉ (14 communes)
-- ========================================

-- Région Indénié-Djuablin
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Abengourou', 'COM-ABE-001', (SELECT id FROM sous_prefectures WHERE nom = 'Abengourou'), 'urbaine', 135000),
('Agnibilékrou', 'COM-AGN-001', (SELECT id FROM sous_prefectures WHERE nom = 'Agnibilékrou'), 'urbaine', 45000);

-- Région Sud-Comoé
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Aboisso', 'COM-ABI-001', (SELECT id FROM sous_prefectures WHERE nom = 'Aboisso'), 'urbaine', 75000),
('Adiaké', 'COM-ADI-001', (SELECT id FROM sous_prefectures WHERE nom = 'Adiaké'), 'urbaine', 35000),
('Grand-Bassam', 'COM-GBA-001', (SELECT id FROM sous_prefectures WHERE nom = 'Grand-Bassam'), 'urbaine', 90000),
('Tiapoum', 'COM-TIA-001', (SELECT id FROM sous_prefectures WHERE nom = 'Tiapoum'), 'rurale');

-- ========================================
-- DISTRICT DENGUÉLÉ (8 communes)
-- ========================================

-- Région Folon
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune) VALUES
('Minignan', 'COM-MIN-001', (SELECT id FROM sous_prefectures WHERE nom = 'Minignan'), 'rurale'),
('Kaniasso', 'COM-KAN-001', (SELECT id FROM sous_prefectures WHERE nom = 'Kaniasso'), 'rurale');

-- Région Kabadougou
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Odienné', 'COM-ODI-001', (SELECT id FROM sous_prefectures WHERE nom = 'Odienné'), 'urbaine', 65000),
('Madinani', 'COM-MAD-001', (SELECT id FROM sous_prefectures WHERE nom = 'Madinani'), 'rurale'),
('Gbéléban', 'COM-GBL-001', (SELECT id FROM sous_prefectures WHERE nom = 'Gbéléban'), 'rurale');

-- ========================================
-- DISTRICT GÔH-DJIBOUA (12 communes)
-- ========================================

-- Région Gôh
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Gagnoa', 'COM-GAG-001', (SELECT id FROM sous_prefectures WHERE nom = 'Gagnoa'), 'urbaine', 160000),
('Oumé', 'COM-OUM-001', (SELECT id FROM sous_prefectures WHERE nom = 'Oumé'), 'urbaine', 45000);

-- Région Lôh-Djiboua
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Divo', 'COM-DIV-001', (SELECT id FROM sous_prefectures WHERE nom = 'Divo'), 'urbaine', 125000),
('Lakota', 'COM-LAK-001', (SELECT id FROM sous_prefectures WHERE nom = 'Lakota'), 'urbaine', 55000),
('Guitry', 'COM-GUI-001', (SELECT id FROM sous_prefectures WHERE nom = 'Guitry'), 'rurale');

-- ========================================
-- DISTRICT LACS (13 communes)
-- ========================================

-- Région Bélier
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune) VALUES
('Toumodi', 'COM-TOU-001', (SELECT id FROM sous_prefectures WHERE nom = 'Toumodi'), 'urbaine'),
('Didiévi', 'COM-DID-001', (SELECT id FROM sous_prefectures WHERE nom = 'Didiévi'), 'urbaine'),
('Tiébissou', 'COM-TIE-001', (SELECT id FROM sous_prefectures WHERE nom = 'Tiébissou'), 'urbaine');

-- Région Iffou
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Daoukro', 'COM-DAO-001', (SELECT id FROM sous_prefectures WHERE nom = 'Daoukro'), 'urbaine', 45000),
('M''''Bahiakro', 'COM-MBA-001', (SELECT id FROM sous_prefectures WHERE nom = 'M''''Bahiakro'), 'urbaine', 25000);

-- Région Moronou
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune) VALUES
('Bongouanou', 'COM-BON-001', (SELECT id FROM sous_prefectures WHERE nom = 'Bongouanou'), 'urbaine'),
('Arrah', 'COM-ARR-001', (SELECT id FROM sous_prefectures WHERE nom = 'Arrah'), 'rurale');

-- Région N''Zi
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Dimbokro', 'COM-DIM-001', (SELECT id FROM sous_prefectures WHERE nom = 'Dimbokro'), 'urbaine', 65000),
('Bocanda', 'COM-BOC-001', (SELECT id FROM sous_prefectures WHERE nom = 'Bocanda'), 'urbaine', 25000);

-- ========================================
-- DISTRICT LAGUNES (18 communes)
-- ========================================

-- Région Agnéby-Tiassa
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Agboville', 'COM-AGB-001', (SELECT id FROM sous_prefectures WHERE nom = 'Agboville'), 'urbaine', 85000),
('Tiassalé', 'COM-TIS-001', (SELECT id FROM sous_prefectures WHERE nom = 'Tiassalé'), 'urbaine', 45000),
('Sikensi', 'COM-SIK-001', (SELECT id FROM sous_prefectures WHERE nom = 'Sikensi'), 'urbaine', 35000);

-- Région Grands-Ponts
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Dabou', 'COM-DAB-001', (SELECT id FROM sous_prefectures WHERE nom = 'Dabou'), 'urbaine', 75000),
('Jacqueville', 'COM-JAC-001', (SELECT id FROM sous_prefectures WHERE nom = 'Jacqueville'), 'urbaine', 35000),
('Grand-Lahou', 'COM-GLA-001', (SELECT id FROM sous_prefectures WHERE nom = 'Grand-Lahou'), 'urbaine', 25000);

-- Région La Mé
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Adzopé', 'COM-ADZ-001', (SELECT id FROM sous_prefectures WHERE nom = 'Adzopé'), 'urbaine', 75000),
('Alépé', 'COM-ALE-001', (SELECT id FROM sous_prefectures WHERE nom = 'Alépé'), 'urbaine', 45000),
('Yakassé-Attobrou', 'COM-YAK-001', (SELECT id FROM sous_prefectures WHERE nom = 'Yakassé-Attobrou'), 'urbaine', 25000);

-- ========================================
-- DISTRICT MONTAGNES (17 communes)
-- ========================================

-- Region Cavally
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Guiglo', 'COM-GIG-001', (SELECT id FROM sous_prefectures WHERE nom = 'Guiglo'), 'urbaine', 65000),
('Blolequin', 'COM-BLO-001', (SELECT id FROM sous_prefectures WHERE nom = 'Blolequin'), 'urbaine', 35000),
('Toulepleu', 'COM-TLP-001', (SELECT id FROM sous_prefectures WHERE nom = 'Toulepleu'), 'urbaine', 25000);

-- Region Guemon
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Duekoue', 'COM-DUE-001', (SELECT id FROM sous_prefectures WHERE nom = 'Duekoue'), 'urbaine', 95000),
('Bangolo', 'COM-BAN-001', (SELECT id FROM sous_prefectures WHERE nom = 'Bangolo'), 'urbaine', 35000');

-- Région Tonkpi
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Man', 'COM-MAN-001', (SELECT id FROM sous_prefectures WHERE nom = 'Man'), 'urbaine', 150000),
('Danané', 'COM-DAN-001', (SELECT id FROM sous_prefectures WHERE nom = 'Danané'), 'urbaine', 55000),
('Biankouma', 'COM-BIA-001', (SELECT id FROM sous_prefectures WHERE nom = 'Biankouma'), 'urbaine', 25000'),
('Zouan-Hounien', 'COM-ZOU-001', (SELECT id FROM sous_prefectures WHERE nom = 'Zouan-Hounien'), 'urbaine', 35000');

-- ========================================
-- DISTRICT SASSANDRA-MARAHOUÉ (14 communes)
-- ========================================

-- Région Haut-Sassandra
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Daloa', 'COM-DAL-001', (SELECT id FROM sous_prefectures WHERE nom = 'Daloa'), 'urbaine', 270000),
('Issia', 'COM-ISS-001', (SELECT id FROM sous_prefectures WHERE nom = 'Issia'), 'urbaine', 65000),
('Vavoua', 'COM-VAV-001', (SELECT id FROM sous_prefectures WHERE nom = 'Vavoua'), 'urbaine', 45000');

-- Région Marahoué
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Bouaflé', 'COM-BFL-001', (SELECT id FROM sous_prefectures WHERE nom = 'Bouaflé'), 'urbaine', 75000),
('Zuénoula', 'COM-ZUE-001', (SELECT id FROM sous_prefectures WHERE nom = 'Zuénoula'), 'urbaine', 45000'),
('Sinfra', 'COM-SIN-001', (SELECT id FROM sous_prefectures WHERE nom = 'Sinfra'), 'urbaine', 35000');

-- ========================================
-- DISTRICT SAVANES (12 communes)
-- ========================================

-- Région Bagoué
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Boundiali', 'COM-BOU-001', (SELECT id FROM sous_prefectures WHERE nom = 'Boundiali'), 'urbaine', 55000),
('Kouto', 'COM-KOU-002', (SELECT id FROM sous_prefectures WHERE nom = 'Kouto'), 'rurale'),
('Tengréla', 'COM-TEN-001', (SELECT id FROM sous_prefectures WHERE nom = 'Tengréla'), 'urbaine', 25000);

-- Région Poro
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Korhogo', 'COM-KOR-001', (SELECT id FROM sous_prefectures WHERE nom = 'Korhogo'), 'urbaine', 285000),
('Ferkessédougou', 'COM-FER-001', (SELECT id FROM sous_prefectures WHERE nom = 'Ferkessédougou'), 'urbaine', 95000),
('Sinématiali', 'COM-SIM-001', (SELECT id FROM sous_prefectures WHERE nom = 'Sinématiali'), 'urbaine', 25000');

-- Région Tchologo
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune) VALUES
('Kong', 'COM-KON-001', (SELECT id FROM sous_prefectures WHERE nom = 'Kong'), 'urbaine'),
('Ouangolodougou', 'COM-OUA-001', (SELECT id FROM sous_prefectures WHERE nom = 'Ouangolodougou'), 'urbaine');

-- ========================================
-- DISTRICT VALLÉE DU BANDAMA (16 communes)
-- ========================================

-- Région Gbêkê
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Bouaké', 'COM-BKE-001', (SELECT id FROM sous_prefectures WHERE nom = 'Bouaké'), 'urbaine', 680000),
('Béoumi', 'COM-BEO-001', (SELECT id FROM sous_prefectures WHERE nom = 'Béoumi'), 'urbaine', 35000),
('Botro', 'COM-BOT-001', (SELECT id FROM sous_prefectures WHERE nom = 'Botro'), 'urbaine', 25000'),
('Sakassou', 'COM-SAK-001', (SELECT id FROM sous_prefectures WHERE nom = 'Sakassou'), 'urbaine', 35000');

-- Région Hambol
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Katiola', 'COM-KAT-001', (SELECT id FROM sous_prefectures WHERE nom = 'Katiola'), 'urbaine', 75000),
('Dabakala', 'COM-DAK-001', (SELECT id FROM sous_prefectures WHERE nom = 'Dabakala'), 'urbaine', 25000'),
('Niakaramadougou', 'COM-NIA-001', (SELECT id FROM sous_prefectures WHERE nom = 'Niakaramadougou'), 'urbaine', 35000');

-- ========================================
-- DISTRICT WOROBA (13 communes)
-- ========================================

-- Région Béré
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune) VALUES
('Mankono', 'COM-MNK-001', (SELECT id FROM sous_prefectures WHERE nom = 'Mankono'), 'urbaine');

-- Région Bafing
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Touba', 'COM-TBA-001', (SELECT id FROM sous_prefectures WHERE nom = 'Touba'), 'urbaine', 45000),
('Koro', 'COM-KRO-001', (SELECT id FROM sous_prefectures WHERE nom = 'Koro'), 'rurale');

-- Région Worodougou
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Séguéla', 'COM-SEG-001', (SELECT id FROM sous_prefectures WHERE nom = 'Séguéla'), 'urbaine', 65000),
('Kani', 'COM-KNI-001', (SELECT id FROM sous_prefectures WHERE nom = 'Kani'), 'rurale');

-- ========================================
-- DISTRICT YAMOUSSOUKRO (3 communes)
-- ========================================

INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Yamoussoukro', 'COM-YAM-001', (SELECT id FROM sous_prefectures WHERE nom = 'Yamoussoukro'), 'urbaine', 355000),
('Attiégouakro', 'COM-ATG-001', (SELECT id FROM sous_prefectures WHERE nom = 'Attiégouakro'), 'rurale'),
('Kossou', 'COM-KOS-001', (SELECT id FROM sous_prefectures WHERE nom = 'Kossou'), 'rurale');

-- ========================================
-- DISTRICT ZANZAN (11 communes)
-- ========================================

-- Région Bounkani
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune) VALUES
('Bouna', 'COM-BNA-001', (SELECT id FROM sous_prefectures WHERE nom = 'Bouna'), 'urbaine'),
('Doropo', 'COM-DOR-001', (SELECT id FROM sous_prefectures WHERE nom = 'Doropo'), 'urbaine'),
('Téhini', 'COM-TEH-001', (SELECT id FROM sous_prefectures WHERE nom = 'Téhini'), 'rurale');

-- Région Gontougo
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune, population) VALUES
('Bondoukou', 'COM-BDK-001', (SELECT id FROM sous_prefectures WHERE nom = 'Bondoukou'), 'urbaine', 85000),
('Tanda', 'COM-TAN-001', (SELECT id FROM sous_prefectures WHERE nom = 'Tanda'), 'urbaine', 35000'),
('Sandégué', 'COM-SAN-001', (SELECT id FROM sous_prefectures WHERE nom = 'Sandégué'), 'rurale');

-- ========================================
-- VÉRIFICATION
-- ========================================

SELECT 
  'Total communes insérées' as info,
  COUNT(*) as nombre
FROM communes;

-- Afficher par district
SELECT 
  dis.nom as district,
  COUNT(c.id) as nb_communes
FROM communes c
JOIN sous_prefectures sp ON c.sous_prefecture_id = sp.id
JOIN departements d ON sp.departement_id = d.id
JOIN regions r ON d.region_id = r.id
JOIN districts dis ON r.district_id = dis.id
GROUP BY dis.nom
ORDER BY dis.nom;
