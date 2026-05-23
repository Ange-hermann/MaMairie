-- ========================================
-- TOUTES LES MAIRIES DE CÔTE D'IVOIRE
-- Version ultra-simple
-- ========================================

-- Nettoyer les références dans les autres tables (si elles existent)
-- Décommentez seulement les lignes pour les tables qui existent dans votre base
-- UPDATE verifications_actes SET mairie_id = NULL WHERE mairie_id IS NOT NULL;
-- UPDATE demandes_extraits SET mairie_id = NULL WHERE mairie_id IS NOT NULL;
-- UPDATE declarations_naissance SET mairie_id = NULL WHERE mairie_id IS NOT NULL;

-- Nettoyer les mairies existantes
TRUNCATE TABLE mairies CASCADE;

-- ========================================
-- DISTRICT ABIDJAN (13 mairies)
-- ========================================

INSERT INTO mairies (nom_mairie, ville, pays) VALUES
('Mairie d''Abobo', 'Abobo', 'Côte d''Ivoire'),
('Mairie d''Adjamé', 'Adjamé', 'Côte d''Ivoire'),
('Mairie d''Attécoubé', 'Attécoubé', 'Côte d''Ivoire'),
('Mairie de Cocody', 'Cocody', 'Côte d''Ivoire'),
('Mairie de Koumassi', 'Koumassi', 'Côte d''Ivoire'),
('Mairie de Marcory', 'Marcory', 'Côte d''Ivoire'),
('Mairie du Plateau', 'Plateau', 'Côte d''Ivoire'),
('Mairie de Port-Bouët', 'Port-Bouët', 'Côte d''Ivoire'),
('Mairie de Treichville', 'Treichville', 'Côte d''Ivoire'),
('Mairie de Yopougon', 'Yopougon', 'Côte d''Ivoire'),
('Mairie de Songon', 'Songon', 'Côte d''Ivoire'),
('Mairie de Bingerville', 'Bingerville', 'Côte d''Ivoire'),
('Mairie d''Anyama', 'Anyama', 'Côte d''Ivoire')
;

-- ========================================
-- DISTRICT BAS-SASSANDRA
-- ========================================

INSERT INTO mairies (nom_mairie, ville) VALUES
('Mairie de Sassandra', 'Sassandra'),
('Mairie de Fresco', 'Fresco'),
('Mairie de Soubré', 'Soubré'),
('Mairie de Buyo', 'Buyo'),
('Mairie de Méagui', 'Méagui'),
('Mairie de San-Pédro', 'San-Pédro'),
('Mairie de Tabou', 'Tabou'),
('Mairie de Grand-Béréby', 'Grand-Béréby')
;

-- ========================================
-- DISTRICT COMOÉ
-- ========================================

INSERT INTO mairies (nom_mairie, ville) VALUES
('Mairie d''Abengourou', 'Abengourou'),
('Mairie d''Agnibilékrou', 'Agnibilékrou'),
('Mairie d''Aboisso', 'Aboisso'),
('Mairie d''Adiaké', 'Adiaké'),
('Mairie de Grand-Bassam', 'Grand-Bassam'),
('Mairie de Bonoua', 'Bonoua'),
('Mairie de Tiapoum', 'Tiapoum'),
('Mairie d''Ayamé', 'Ayamé')
;

-- ========================================
-- DISTRICT DENGUÉLÉ
-- ========================================

INSERT INTO mairies (nom_mairie, ville) VALUES
('Mairie d''Odienné', 'Odienné'),
('Mairie de Minignan', 'Minignan'),
('Mairie de Madinani', 'Madinani'),
('Mairie de Samatiguila', 'Samatiguila'),
('Mairie de Gbéléban', 'Gbéléban')
;

-- ========================================
-- DISTRICT GÔH-DJIBOUA
-- ========================================

INSERT INTO mairies (nom_mairie, ville) VALUES
('Mairie de Gagnoa', 'Gagnoa'),
('Mairie d''Oumé', 'Oumé'),
('Mairie de Divo', 'Divo'),
('Mairie de Lakota', 'Lakota'),
('Mairie de Guitry', 'Guitry')
;

-- ========================================
-- DISTRICT LACS
-- ========================================

INSERT INTO mairies (nom_mairie, ville) VALUES
('Mairie de Toumodi', 'Toumodi'),
('Mairie de Didiévi', 'Didiévi'),
('Mairie de Tiébissou', 'Tiébissou'),
('Mairie de Daoukro', 'Daoukro'),
('Mairie de M''''Bahiakro', 'M''''Bahiakro'),
('Mairie de Bongouanou', 'Bongouanou'),
('Mairie d''Arrah', 'Arrah'),
('Mairie de Dimbokro', 'Dimbokro'),
('Mairie de Bocanda', 'Bocanda')
;

-- ========================================
-- DISTRICT LAGUNES
-- ========================================

INSERT INTO mairies (nom_mairie, ville) VALUES
('Mairie d''Agboville', 'Agboville'),
('Mairie de Tiassalé', 'Tiassalé'),
('Mairie de Sikensi', 'Sikensi'),
('Mairie de Dabou', 'Dabou'),
('Mairie de Jacqueville', 'Jacqueville'),
('Mairie de Grand-Lahou', 'Grand-Lahou'),
('Mairie d''Adzopé', 'Adzopé'),
('Mairie d''Alépé', 'Alépé'),
('Mairie de Yakassé-Attobrou', 'Yakassé-Attobrou')
;

-- ========================================
-- DISTRICT MONTAGNES
-- ========================================

INSERT INTO mairies (nom_mairie, ville) VALUES
('Mairie de Man', 'Man'),
('Mairie de Danané', 'Danané'),
('Mairie de Biankouma', 'Biankouma'),
('Mairie de Zouan-Hounien', 'Zouan-Hounien'),
('Mairie de Guiglo', 'Guiglo'),
('Mairie de Duékoué', 'Duékoué'),
('Mairie de Bangolo', 'Bangolo'),
('Mairie de Bloléquin', 'Bloléquin'),
('Mairie de Toulépleu', 'Toulépleu')
;

-- ========================================
-- DISTRICT SASSANDRA-MARAHOUÉ
-- ========================================

INSERT INTO mairies (nom_mairie, ville) VALUES
('Mairie de Daloa', 'Daloa'),
('Mairie d''Issia', 'Issia'),
('Mairie de Vavoua', 'Vavoua'),
('Mairie de Bouaflé', 'Bouaflé'),
('Mairie de Zuénoula', 'Zuénoula'),
('Mairie de Sinfra', 'Sinfra')
;

-- ========================================
-- DISTRICT SAVANES
-- ========================================

INSERT INTO mairies (nom_mairie, ville) VALUES
('Mairie de Korhogo', 'Korhogo'),
('Mairie de Ferkessédougou', 'Ferkessédougou'),
('Mairie de Boundiali', 'Boundiali'),
('Mairie de Tengréla', 'Tengréla'),
('Mairie de Sinématiali', 'Sinématiali'),
('Mairie de Kong', 'Kong'),
('Mairie d''Ouangolodougou', 'Ouangolodougou'),
('Mairie de Kouto', 'Kouto')
;

-- ========================================
-- DISTRICT VALLÉE DU BANDAMA
-- ========================================

INSERT INTO mairies (nom_mairie, ville) VALUES
('Mairie de Bouaké', 'Bouaké'),
('Mairie de Katiola', 'Katiola'),
('Mairie de Dabakala', 'Dabakala'),
('Mairie de Niakaramadougou', 'Niakaramadougou'),
('Mairie de Sakassou', 'Sakassou'),
('Mairie de Béoumi', 'Béoumi'),
('Mairie de Botro', 'Botro')
;

-- ========================================
-- DISTRICT WOROBA
-- ========================================

INSERT INTO mairies (nom_mairie, ville) VALUES
('Mairie de Séguéla', 'Séguéla'),
('Mairie de Touba', 'Touba'),
('Mairie de Mankono', 'Mankono'),
('Mairie de Kani', 'Kani'),
('Mairie de Koro', 'Koro')
;

-- ========================================
-- DISTRICT YAMOUSSOUKRO
-- ========================================

INSERT INTO mairies (nom_mairie, ville) VALUES
('Mairie de Yamoussoukro', 'Yamoussoukro'),
('Mairie d''Attiégouakro', 'Attiégouakro'),
('Mairie de Kossou', 'Kossou')
;

-- ========================================
-- DISTRICT ZANZAN
-- ========================================

INSERT INTO mairies (nom_mairie, ville) VALUES
('Mairie de Bondoukou', 'Bondoukou'),
('Mairie de Tanda', 'Tanda'),
('Mairie de Bouna', 'Bouna'),
('Mairie de Doropo', 'Doropo'),
('Mairie de Téhini', 'Téhini'),
('Mairie de Sandégué', 'Sandégué')
;

-- ========================================
-- VÉRIFICATION
-- ========================================

SELECT 
  'Total mairies' as info,
  COUNT(*) as nombre
FROM mairies;

SELECT 
  'Liste des mairies' as info,
  nom_mairie,
  ville
FROM mairies
ORDER BY nom_mairie;
