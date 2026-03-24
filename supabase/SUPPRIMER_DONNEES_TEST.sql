-- ============================================
-- SUPPRIMER TOUTES LES DONNÉES DE TEST
-- ============================================
-- Nettoyer la base de données
-- ============================================

-- ⚠️ ATTENTION : Cette opération est IRRÉVERSIBLE !
-- Faites une sauvegarde avant d'exécuter ce script

-- ============================================
-- 1. SUPPRIMER LES UTILISATEURS DE TEST
-- ============================================

-- Voir les utilisateurs de test
SELECT id, email, nom, prenom, role
FROM public.users
WHERE email LIKE '%test%'
   OR email LIKE '%example%'
   OR nom = 'Test'
   OR prenom = 'Test';

-- Supprimer les utilisateurs de test de public.users
DELETE FROM public.users
WHERE email LIKE '%test%'
   OR email LIKE '%example%'
   OR nom = 'Test'
   OR prenom = 'Test';

-- Supprimer les utilisateurs de test de auth.users
-- ⚠️ DÉCOMMENTER POUR EXÉCUTER
/*
DELETE FROM auth.users
WHERE email LIKE '%test%'
   OR email LIKE '%example%';
*/

-- ============================================
-- 2. SUPPRIMER LES MAIRIES DE TEST
-- ============================================

-- Voir les mairies de test
SELECT id, nom_mairie, ville
FROM public.mairies
WHERE nom_mairie LIKE '%Test%'
   OR ville = 'Test';

-- Supprimer les mairies de test
DELETE FROM public.mairies
WHERE nom_mairie LIKE '%Test%'
   OR ville = 'Test';

-- ============================================
-- 3. SUPPRIMER LES DEMANDES DE TEST
-- ============================================

-- Voir les demandes de test
SELECT id, nom, prenom, type_document
FROM public.requests
WHERE nom = 'Test'
   OR prenom = 'Test';

-- Supprimer les demandes de test
DELETE FROM public.requests
WHERE nom = 'Test'
   OR prenom = 'Test';

-- ============================================
-- 4. SUPPRIMER LES NAISSANCES DE TEST
-- ============================================

-- Voir les naissances de test
SELECT id, nom, prenom, numero_acte
FROM public.naissances
WHERE nom = 'Test'
   OR prenom = 'Test'
   OR numero_acte LIKE '%TEST%';

-- Supprimer les naissances de test
DELETE FROM public.naissances
WHERE nom = 'Test'
   OR prenom = 'Test'
   OR numero_acte LIKE '%TEST%';

-- ============================================
-- 5. SUPPRIMER LES MARIAGES DE TEST
-- ============================================

-- Voir les mariages de test
SELECT id, nom_epoux, nom_epouse, numero_acte
FROM public.mariages
WHERE nom_epoux = 'Test'
   OR nom_epouse = 'Test'
   OR numero_acte LIKE '%TEST%';

-- Supprimer les mariages de test
DELETE FROM public.mariages
WHERE nom_epoux = 'Test'
   OR nom_epouse = 'Test'
   OR numero_acte LIKE '%TEST%';

-- ============================================
-- 6. SUPPRIMER LES DÉCÈS DE TEST
-- ============================================

-- Voir les décès de test
SELECT id, nom, prenom, numero_acte
FROM public.deces
WHERE nom = 'Test'
   OR prenom = 'Test'
   OR numero_acte LIKE '%TEST%';

-- Supprimer les décès de test
DELETE FROM public.deces
WHERE nom = 'Test'
   OR prenom = 'Test'
   OR numero_acte LIKE '%TEST%';

-- ============================================
-- 7. GARDER UNIQUEMENT VOS COMPTES RÉELS
-- ============================================

-- Voir tous les utilisateurs restants
SELECT 
  id,
  email,
  nom,
  prenom,
  role,
  created_at
FROM public.users
ORDER BY created_at DESC;

-- Voir toutes les mairies restantes
SELECT 
  id,
  nom_mairie,
  ville,
  region,
  created_at
FROM public.mairies
ORDER BY created_at DESC;

-- ============================================
-- 8. VÉRIFICATION FINALE
-- ============================================

-- Compter les utilisateurs par rôle
SELECT 
  role,
  COUNT(*) as total
FROM public.users
GROUP BY role
ORDER BY role;

-- Compter les mairies
SELECT COUNT(*) as total_mairies FROM public.mairies;

-- Compter les demandes
SELECT COUNT(*) as total_demandes FROM public.requests;

-- Compter les naissances
SELECT COUNT(*) as total_naissances FROM public.naissances;

-- Compter les mariages
SELECT COUNT(*) as total_mariages FROM public.mariages;

-- Compter les décès
SELECT COUNT(*) as total_deces FROM public.deces;

-- ============================================
-- NOTES
-- ============================================
-- Ce script supprime :
-- ✅ Tous les utilisateurs avec email contenant "test" ou "example"
-- ✅ Tous les utilisateurs avec nom/prénom "Test"
-- ✅ Toutes les mairies de test
-- ✅ Toutes les demandes de test
-- ✅ Tous les actes d'état civil de test
--
-- Sont conservés :
-- ✅ Votre compte ministère (angeherboua@gmail.com)
-- ✅ Les agents réels que vous avez créés
-- ✅ Les mairies réelles
-- ✅ Les données réelles
-- ============================================
