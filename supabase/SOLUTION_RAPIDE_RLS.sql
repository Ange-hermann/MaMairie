-- ============================================
-- SOLUTION RAPIDE : Désactiver RLS sur mairies
-- ============================================
-- Exécuter ce script dans Supabase SQL Editor
-- ============================================

-- Désactiver RLS sur la table mairies
ALTER TABLE public.mairies DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur la table users (si pas déjà fait)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Vérifier que ça fonctionne
SELECT id, nom_mairie, ville, region FROM public.mairies;

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Vous devriez voir toutes les mairies
-- Le dropdown fonctionnera immédiatement
-- ============================================
