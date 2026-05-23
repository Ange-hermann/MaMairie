-- ========================================
-- TESTS DES FONCTIONS GÉOGRAPHIQUES
-- ========================================

-- Test 1 : Vérifier les tables créées
SELECT 
  'Tables créées' as test,
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as nb_colonnes
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('districts', 'regions', 'departements', 'sous_prefectures', 'communes', 'villages')
ORDER BY table_name;

-- Test 2 : Compter les données
SELECT 'Données chargées' as test, 'Districts' as table_name, COUNT(*) as count FROM districts
UNION ALL
SELECT 'Données chargées', 'Régions', COUNT(*) FROM regions
UNION ALL
SELECT 'Données chargées', 'Départements', COUNT(*) FROM departements
UNION ALL
SELECT 'Données chargées', 'Sous-préfectures', COUNT(*) FROM sous_prefectures
UNION ALL
SELECT 'Données chargées', 'Communes', COUNT(*) FROM communes
UNION ALL
SELECT 'Données chargées', 'Villages', COUNT(*) FROM villages;

-- Test 3 : Vérifier la hiérarchie d'une commune
SELECT 
  'Hiérarchie commune' as test,
  *
FROM v_communes_hierarchie 
WHERE commune_nom LIKE '%Abobo%'
LIMIT 1;

-- Test 4 : Vérifier la hiérarchie d'un village
SELECT 
  'Hiérarchie village' as test,
  *
FROM v_villages_hierarchie 
WHERE village_nom LIKE '%Riviera%'
LIMIT 1;

-- Test 5 : Recherche de villages
SELECT 
  'Recherche villages' as test,
  *
FROM search_villages('Cocody')
LIMIT 5;

-- Test 6 : Vérifier les mairies avec hiérarchie
SELECT 
  'Mairies avec hiérarchie' as test,
  mairie_id,
  nom_mairie,
  commune_nom,
  sous_prefecture_nom,
  region_nom,
  nb_villages
FROM v_mairies_hierarchie
LIMIT 5;

-- Test 7 : Tester get_mairie_competente (si des villages existent)
DO $$
DECLARE
  test_village_id UUID;
BEGIN
  -- Récupérer un village de test
  SELECT id INTO test_village_id FROM villages LIMIT 1;
  
  IF test_village_id IS NOT NULL THEN
    RAISE NOTICE 'Test get_mairie_competente avec village: %', test_village_id;
    
    -- Afficher le résultat
    PERFORM * FROM get_mairie_competente(test_village_id);
  ELSE
    RAISE NOTICE 'Aucun village trouvé pour tester get_mairie_competente';
  END IF;
END $$;

-- Afficher le résultat du test 7
SELECT 
  'Mairie compétente' as test,
  *
FROM get_mairie_competente(
  (SELECT id FROM villages LIMIT 1)
);

-- Test 8 : Tester get_villages_mairie (si des mairies existent)
SELECT 
  'Villages d''une mairie' as test,
  *
FROM get_villages_mairie(
  (SELECT id FROM mairies LIMIT 1)
)
LIMIT 5;

-- Test 9 : Vérifier les colonnes ajoutées à mairies
SELECT 
  'Colonnes mairies' as test,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'mairies'
AND column_name IN ('commune_id', 'sous_prefecture_id', 'gere_villages')
ORDER BY column_name;

-- Test 10 : Statistiques globales
SELECT 
  'Statistiques' as test,
  (SELECT COUNT(*) FROM districts) as nb_districts,
  (SELECT COUNT(*) FROM regions) as nb_regions,
  (SELECT COUNT(*) FROM departements) as nb_departements,
  (SELECT COUNT(*) FROM sous_prefectures) as nb_sous_prefectures,
  (SELECT COUNT(*) FROM communes) as nb_communes,
  (SELECT COUNT(*) FROM villages) as nb_villages,
  (SELECT COUNT(*) FROM mairies) as nb_mairies;

-- ========================================
-- RÉSULTAT ATTENDU
-- ========================================
/*
✅ Test 1 : 6 tables créées
✅ Test 2 : Données chargées (14 districts, 31 régions, etc.)
✅ Test 3 : Hiérarchie d'Abobo visible
✅ Test 4 : Hiérarchie de Riviera visible
✅ Test 5 : Recherche de villages fonctionne
✅ Test 6 : Mairies avec hiérarchie
✅ Test 7 : Mairie compétente trouvée
✅ Test 8 : Villages d'une mairie
✅ Test 9 : 3 colonnes ajoutées à mairies
✅ Test 10 : Statistiques globales
*/
