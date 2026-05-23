-- ========================================
-- GÉNÉRATION AUTOMATIQUE DES 201 COMMUNES
-- ========================================
-- Ce script crée automatiquement une commune pour chaque sous-préfecture
-- qui n'en a pas encore, pour atteindre les 201 communes officielles

-- ========================================
-- ÉTAPE 1 : Créer les communes principales (déjà fait)
-- ========================================
-- Exécuter d'abord seed-toutes-communes-ci.sql

-- ========================================
-- ÉTAPE 2 : Générer les communes manquantes
-- ========================================

-- Pour chaque sous-préfecture sans commune, créer une commune du même nom
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune)
SELECT 
  sp.nom,
  'COM-' || UPPER(LEFT(sp.nom, 3)) || '-' || LPAD(ROW_NUMBER() OVER (ORDER BY sp.nom)::TEXT, 3, '0'),
  sp.id,
  CASE 
    WHEN sp.nom IN (
      'Abidjan', 'Bouaké', 'Daloa', 'Yamoussoukro', 'San-Pédro', 'Korhogo',
      'Man', 'Gagnoa', 'Abengourou', 'Bondoukou', 'Ferkessédougou', 'Divo',
      'Odienné', 'Séguéla', 'Soubré', 'Sassandra', 'Tabou', 'Grand-Bassam',
      'Aboisso', 'Adzopé', 'Agboville', 'Dabou', 'Daoukro', 'Dimbokro',
      'Issia', 'Katiola', 'Boundiali', 'Guiglo', 'Duékoué', 'Danané',
      'Touba', 'Mankono', 'Bouna', 'Tanda', 'Agnibilékrou', 'Bongouanou',
      'Toumodi', 'Tiassalé', 'Lakota', 'Oumé', 'Vavoua', 'Bouaflé',
      'Zuénoula', 'Sinfra', 'Béoumi', 'Sakassou', 'Botro', 'Dabakala',
      'Niakaramadougou', 'Didiévi', 'Tiébissou', 'Bocanda', 'M''Bahiakro',
      'Arrah', 'Sikensi', 'Alépé', 'Yakassé-Attobrou', 'Jacqueville',
      'Grand-Lahou', 'Bloléquin', 'Toulépleu', 'Bangolo', 'Biankouma',
      'Zouan-Hounien', 'Fresco', 'Buyo', 'Méagui', 'Grand-Béréby',
      'Adiaké', 'Tiapoum', 'Minignan', 'Kaniasso', 'Madinani', 'Gbéléban',
      'Guitry', 'Kong', 'Ouangolodougou', 'Kouto', 'Tengréla', 'Sinématiali',
      'Koro', 'Kani', 'Doropo', 'Téhini', 'Sandégué', 'Attiégouakro', 'Kossou'
    ) THEN 'urbaine'
    ELSE 'rurale'
  END
FROM sous_prefectures sp
WHERE NOT EXISTS (
  SELECT 1 FROM communes c WHERE c.sous_prefecture_id = sp.id
)
ORDER BY sp.nom;

-- ========================================
-- ÉTAPE 3 : Compléter avec les communes restantes
-- ========================================

-- Ajouter les communes spécifiques qui manquent encore
-- (Certaines sous-préfectures ont plusieurs communes)

-- District Abidjan - Communes supplémentaires
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune) VALUES
('Songon', 'COM-SON-001', (SELECT id FROM sous_prefectures WHERE nom = 'Songon'), 'rurale'),
('Bingerville', 'COM-BIN-001', (SELECT id FROM sous_prefectures WHERE nom = 'Bingerville'), 'urbaine'),
('Anyama', 'COM-ANY-001', (SELECT id FROM sous_prefectures WHERE nom = 'Anyama'), 'urbaine')
ON CONFLICT DO NOTHING;

-- Lagunes - Communes supplémentaires
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune) VALUES
('Azaguié', 'COM-AZA-001', (SELECT id FROM sous_prefectures WHERE nom = 'Azaguié'), 'rurale'),
('Rubino', 'COM-RUB-001', (SELECT id FROM sous_prefectures WHERE nom = 'Rubino'), 'rurale'),
('Taabo', 'COM-TAA-001', (SELECT id FROM sous_prefectures WHERE nom = 'Taabo'), 'rurale')
ON CONFLICT DO NOTHING;

-- Comoé - Communes supplémentaires
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune) VALUES
('Ayamé', 'COM-AYA-001', (SELECT id FROM sous_prefectures WHERE nom = 'Ayamé'), 'rurale'),
('Bianouan', 'COM-BNO-001', (SELECT id FROM sous_prefectures WHERE nom = 'Bianouan'), 'rurale'),
('Maféré', 'COM-MAF-001', (SELECT id FROM sous_prefectures WHERE nom = 'Maféré'), 'rurale'),
('Zaranou', 'COM-ZAR-001', (SELECT id FROM sous_prefectures WHERE nom = 'Zaranou'), 'rurale')
ON CONFLICT DO NOTHING;

-- Savanes - Communes supplémentaires
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune) VALUES
('Dikodougou', 'COM-DIK-001', (SELECT id FROM sous_prefectures WHERE nom = 'Dikodougou'), 'rurale'),
('Karakoro', 'COM-KAR-001', (SELECT id FROM sous_prefectures WHERE nom = 'Karakoro'), 'rurale'),
('Napié', 'COM-NAP-001', (SELECT id FROM sous_prefectures WHERE nom = 'Napié'), 'rurale'),
('Niofoin', 'COM-NIO-001', (SELECT id FROM sous_prefectures WHERE nom = 'Niofoin'), 'rurale')
ON CONFLICT DO NOTHING;

-- Montagnes - Communes supplémentaires
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune) VALUES
('Facobly', 'COM-FAC-001', (SELECT id FROM sous_prefectures WHERE nom = 'Facobly'), 'rurale'),
('Gbonné', 'COM-GBO-001', (SELECT id FROM sous_prefectures WHERE nom = 'Gbonné'), 'rurale'),
('Kouibly', 'COM-KOI-001', (SELECT id FROM sous_prefectures WHERE nom = 'Kouibly'), 'rurale'),
('Sipilou', 'COM-SIP-001', (SELECT id FROM sous_prefectures WHERE nom = 'Sipilou'), 'rurale')
ON CONFLICT DO NOTHING;

-- Bas-Sassandra - Communes supplémentaires
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune) VALUES
('Dakpadou', 'COM-DAK-002', (SELECT id FROM sous_prefectures WHERE nom = 'Dakpadou'), 'rurale'),
('Gnagbodougnoa', 'COM-GNA-001', (SELECT id FROM sous_prefectures WHERE nom = 'Gnagbodougnoa'), 'rurale'),
('Lobakuya', 'COM-LOB-001', (SELECT id FROM sous_prefectures WHERE nom = 'Lobakuya'), 'rurale')
ON CONFLICT DO NOTHING;

-- Gôh-Djiboua - Communes supplémentaires
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune) VALUES
('Bayota', 'COM-BAY-001', (SELECT id FROM sous_prefectures WHERE nom = 'Bayota'), 'rurale'),
('Dignago', 'COM-DIG-001', (SELECT id FROM sous_prefectures WHERE nom = 'Dignago'), 'rurale'),
('Guibéroua', 'COM-GUB-001', (SELECT id FROM sous_prefectures WHERE nom = 'Guibéroua'), 'rurale'),
('Serihio', 'COM-SER-001', (SELECT id FROM sous_prefectures WHERE nom = 'Serihio'), 'rurale')
ON CONFLICT DO NOTHING;

-- Lacs - Communes supplémentaires
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune) VALUES
('Ettrokro', 'COM-ETT-001', (SELECT id FROM sous_prefectures WHERE nom = 'Ettrokro'), 'rurale'),
('Raviart', 'COM-RAV-001', (SELECT id FROM sous_prefectures WHERE nom = 'Raviart'), 'rurale'),
('Yakpabo-Sakassou', 'COM-YAK-002', (SELECT id FROM sous_prefectures WHERE nom = 'Yakpabo-Sakassou'), 'rurale')
ON CONFLICT DO NOTHING;

-- Sassandra-Marahoué - Communes supplémentaires
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune) VALUES
('Bonon', 'COM-BON-002', (SELECT id FROM sous_prefectures WHERE nom = 'Bonon'), 'rurale'),
('Gohitafla', 'COM-GOH-001', (SELECT id FROM sous_prefectures WHERE nom = 'Gohitafla'), 'rurale'),
('Saioua', 'COM-SAI-001', (SELECT id FROM sous_prefectures WHERE nom = 'Saioua'), 'rurale')
ON CONFLICT DO NOTHING;

-- Vallée du Bandama - Communes supplémentaires
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune) VALUES
('Brobo', 'COM-BRO-001', (SELECT id FROM sous_prefectures WHERE nom = 'Brobo'), 'rurale'),
('Djébonoua', 'COM-DJE-001', (SELECT id FROM sous_prefectures WHERE nom = 'Djébonoua'), 'rurale'),
('Kondrobo', 'COM-KON-002', (SELECT id FROM sous_prefectures WHERE nom = 'Kondrobo'), 'rurale'),
('Languibonou', 'COM-LAN-001', (SELECT id FROM sous_prefectures WHERE nom = 'Languibonou'), 'rurale')
ON CONFLICT DO NOTHING;

-- Woroba - Communes supplémentaires
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune) VALUES
('Borotou-Koro', 'COM-BOR-001', (SELECT id FROM sous_prefectures WHERE nom = 'Borotou-Koro'), 'rurale'),
('Ouaninou', 'COM-OUN-001', (SELECT id FROM sous_prefectures WHERE nom = 'Ouaninou'), 'rurale'),
('Tiéningboué', 'COM-TIE-002', (SELECT id FROM sous_prefectures WHERE nom = 'Tiéningboué'), 'rurale')
ON CONFLICT DO NOTHING;

-- Zanzan - Communes supplémentaires
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune) VALUES
('Assuéfry', 'COM-ASS-001', (SELECT id FROM sous_prefectures WHERE nom = 'Assuéfry'), 'rurale'),
('Koun-Fao', 'COM-KOF-001', (SELECT id FROM sous_prefectures WHERE nom = 'Koun-Fao'), 'rurale'),
('Transua', 'COM-TRA-001', (SELECT id FROM sous_prefectures WHERE nom = 'Transua'), 'rurale')
ON CONFLICT DO NOTHING;

-- Denguélé - Communes supplémentaires
INSERT INTO communes (nom, code, sous_prefecture_id, type_commune) VALUES
('Samatiguila', 'COM-SAM-001', (SELECT id FROM sous_prefectures WHERE nom = 'Samatiguila'), 'rurale'),
('Kimbirila-Nord', 'COM-KIM-001', (SELECT id FROM sous_prefectures WHERE nom = 'Kimbirila-Nord'), 'rurale')
ON CONFLICT DO NOTHING;

-- ========================================
-- VÉRIFICATION FINALE
-- ========================================

-- Compter le total de communes
SELECT 
  '=== RÉSULTAT FINAL ===' as titre,
  COUNT(*) as total_communes
FROM communes;

-- Afficher par district
SELECT 
  dis.nom as district,
  COUNT(c.id) as nb_communes,
  COUNT(CASE WHEN c.type_commune = 'urbaine' THEN 1 END) as urbaines,
  COUNT(CASE WHEN c.type_commune = 'rurale' THEN 1 END) as rurales
FROM communes c
JOIN sous_prefectures sp ON c.sous_prefecture_id = sp.id
JOIN departements d ON sp.departement_id = d.id
JOIN regions r ON d.region_id = r.id
JOIN districts dis ON r.district_id = dis.id
GROUP BY dis.nom
ORDER BY dis.nom;

-- Vérifier s'il reste des sous-préfectures sans commune
SELECT 
  'Sous-préfectures sans commune' as info,
  COUNT(*) as nombre
FROM sous_prefectures sp
WHERE NOT EXISTS (
  SELECT 1 FROM communes c WHERE c.sous_prefecture_id = sp.id
);

-- Afficher les sous-préfectures sans commune (s'il y en a)
SELECT 
  sp.nom as sous_prefecture,
  d.nom as departement,
  r.nom as region
FROM sous_prefectures sp
JOIN departements d ON sp.departement_id = d.id
JOIN regions r ON d.region_id = r.id
WHERE NOT EXISTS (
  SELECT 1 FROM communes c WHERE c.sous_prefecture_id = sp.id
)
ORDER BY r.nom, d.nom, sp.nom;

-- ========================================
-- RÉSULTAT ATTENDU : 201 COMMUNES
-- ========================================
