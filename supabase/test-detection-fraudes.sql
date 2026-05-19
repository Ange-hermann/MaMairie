-- ============================================
-- TESTS DE DÉTECTION DE FRAUDES
-- ============================================

-- 1. VÉRIFIER QUE LES FONCTIONS EXISTENT
SELECT 
  proname as fonction_name,
  pg_get_function_result(oid) as return_type
FROM pg_proc
WHERE proname IN (
  'detect_doublons_naissances',
  'detect_doublons_mariages',
  'detect_dates_incoherentes',
  'detect_numeros_suspects',
  'detect_volumes_anormaux',
  'executer_detection_fraudes',
  'get_stats_fraudes'
)
ORDER BY proname;

-- 2. VÉRIFIER QUE LES TRIGGERS EXISTENT
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname IN (
  'after_insert_naissance_detection',
  'after_insert_mariage_detection'
);

-- 3. TESTER LA DÉTECTION MANUELLE
-- Exécuter la détection sur toutes les données existantes
SELECT executer_detection_fraudes();

-- 4. VOIR LES STATISTIQUES
SELECT * FROM get_stats_fraudes();

-- 5. VOIR LES ALERTES CRÉÉES
SELECT 
  id,
  type,
  severite,
  titre,
  description,
  statut,
  date_detection,
  mairie_id
FROM alertes_ministere
WHERE statut = 'nouvelle'
ORDER BY date_detection DESC
LIMIT 20;

-- 6. COMPTER LES ALERTES PAR TYPE
SELECT 
  type,
  COUNT(*) as nombre,
  severite
FROM alertes_ministere
WHERE statut = 'nouvelle'
GROUP BY type, severite
ORDER BY nombre DESC;

-- ============================================
-- TESTS AVEC DONNÉES DE TEST
-- ============================================

-- 7. CRÉER UN DOUBLON DE NAISSANCE (TEST)
-- ATTENTION : Remplacez les UUIDs par des valeurs réelles de votre base

-- Récupérer un mairie_id et created_by valides
DO $$
DECLARE
  test_mairie_id UUID;
  test_user_id UUID;
BEGIN
  -- Récupérer une mairie
  SELECT id INTO test_mairie_id FROM mairies LIMIT 1;
  
  -- Récupérer un agent
  SELECT id INTO test_user_id FROM users WHERE role = 'agent' LIMIT 1;
  
  -- Créer 2 naissances identiques
  IF test_mairie_id IS NOT NULL AND test_user_id IS NOT NULL THEN
    INSERT INTO naissances (
      nom_enfant, 
      prenom_enfant, 
      date_naissance, 
      lieu_naissance, 
      numero_acte, 
      mairie_id,
      created_by,
      sexe,
      nom_pere,
      nom_mere
    )
    VALUES 
      ('TEST_DOUBLON', 'Jean', '2024-01-01', 'Abidjan', 'TEST-DOUBLON-001', test_mairie_id, test_user_id, 'M', 'PERE', 'MERE'),
      ('TEST_DOUBLON', 'Jean', '2024-01-01', 'Abidjan', 'TEST-DOUBLON-002', test_mairie_id, test_user_id, 'M', 'PERE', 'MERE');
    
    RAISE NOTICE 'Doublons de test créés avec succès';
  ELSE
    RAISE NOTICE 'Impossible de créer les doublons : mairie ou agent introuvable';
  END IF;
END $$;

-- 8. CRÉER UNE DATE FUTURE (TEST)
DO $$
DECLARE
  test_mairie_id UUID;
  test_user_id UUID;
BEGIN
  SELECT id INTO test_mairie_id FROM mairies LIMIT 1;
  SELECT id INTO test_user_id FROM users WHERE role = 'agent' LIMIT 1;
  
  IF test_mairie_id IS NOT NULL AND test_user_id IS NOT NULL THEN
    INSERT INTO naissances (
      nom_enfant, 
      prenom_enfant, 
      date_naissance, 
      lieu_naissance, 
      numero_acte, 
      mairie_id,
      created_by,
      sexe,
      nom_pere,
      nom_mere
    )
    VALUES 
      ('TEST_FUTUR', 'Marie', '2030-12-31', 'Abidjan', 'TEST-FUTUR-001', test_mairie_id, test_user_id, 'F', 'PERE', 'MERE');
    
    RAISE NOTICE 'Naissance future créée avec succès';
  END IF;
END $$;

-- 9. LANCER LA DÉTECTION APRÈS LES TESTS
SELECT executer_detection_fraudes();

-- 10. VÉRIFIER LES NOUVELLES ALERTES
SELECT 
  type,
  severite,
  titre,
  description,
  date_detection
FROM alertes_ministere
WHERE description LIKE '%TEST%'
ORDER BY date_detection DESC;

-- ============================================
-- NETTOYAGE DES DONNÉES DE TEST
-- ============================================

-- 11. SUPPRIMER LES DONNÉES DE TEST
DELETE FROM naissances WHERE nom_enfant LIKE 'TEST_%';
DELETE FROM alertes_ministere WHERE description LIKE '%TEST%';

RAISE NOTICE 'Données de test supprimées';

-- ============================================
-- COMMANDES UTILES
-- ============================================

-- Désactiver temporairement les triggers
-- ALTER TABLE naissances DISABLE TRIGGER after_insert_naissance_detection;
-- ALTER TABLE mariages DISABLE TRIGGER after_insert_mariage_detection;

-- Réactiver les triggers
-- ALTER TABLE naissances ENABLE TRIGGER after_insert_naissance_detection;
-- ALTER TABLE mariages ENABLE TRIGGER after_insert_mariage_detection;

-- Supprimer toutes les alertes (ATTENTION !)
-- DELETE FROM alertes_ministere WHERE statut = 'nouvelle';

-- Voir les alertes par mairie
-- SELECT 
--   m.nom_mairie,
--   m.ville,
--   COUNT(a.id) as nombre_alertes
-- FROM alertes_ministere a
-- JOIN mairies m ON m.id = a.mairie_id
-- WHERE a.statut = 'nouvelle'
-- GROUP BY m.nom_mairie, m.ville
-- ORDER BY nombre_alertes DESC;
