-- ============================================
-- FIX : Création d'Agent Bloquée
-- ============================================
-- L'utilisateur est créé dans auth.users
-- mais le profil n'est pas créé dans public.users
-- ============================================

-- SOLUTION : Désactiver RLS sur public.users
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Vérifier que RLS est désactivé
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'mairies');

-- ============================================
-- NETTOYER LES UTILISATEURS ORPHELINS
-- ============================================
-- Utilisateurs dans auth.users mais pas dans public.users

-- 1. Voir les utilisateurs orphelins
SELECT 
  au.id,
  au.email,
  au.created_at,
  'ORPHELIN - Existe dans auth mais pas dans public.users' as statut
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;

-- 2. Pour chaque orphelin, créer le profil manuellement
-- EXEMPLE : Remplacer les valeurs par celles de l'orphelin
/*
INSERT INTO public.users (id, email, role, nom, prenom, statut)
VALUES (
  'ID_DE_AUTH_USERS',  -- Copier depuis la requête ci-dessus
  'email@mairie.ci',
  'agent',
  'Nom',
  'Prenom',
  'actif'
);
*/

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Voir tous les agents
SELECT 
  u.id,
  u.email,
  u.nom,
  u.prenom,
  u.role,
  m.nom_mairie,
  u.created_at
FROM public.users u
LEFT JOIN public.mairies m ON u.mairie_id = m.id
WHERE u.role = 'agent'
ORDER BY u.created_at DESC;

-- Compter les utilisateurs
SELECT 
  'auth.users' as table_name,
  COUNT(*) as total
FROM auth.users
UNION ALL
SELECT 
  'public.users' as table_name,
  COUNT(*) as total
FROM public.users;

-- ============================================
-- APRÈS AVOIR EXÉCUTÉ CE SCRIPT
-- ============================================
-- 1. RLS est désactivé sur public.users
-- 2. Vous pouvez créer des agents
-- 3. Le profil sera créé automatiquement
-- ============================================
