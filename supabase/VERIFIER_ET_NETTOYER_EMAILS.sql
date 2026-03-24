-- ============================================
-- VÉRIFIER ET NETTOYER LES EMAILS
-- ============================================
-- Utiliser ce script pour vérifier si un email existe
-- et le supprimer si nécessaire
-- ============================================

-- 1. VÉRIFIER SI L'EMAIL EXISTE DANS AUTH.USERS
-- Remplacer 'email@example.com' par l'email que vous voulez vérifier
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'votre.email@mairie.ci';  -- REMPLACER ICI

-- 2. VÉRIFIER SI L'EMAIL EXISTE DANS PUBLIC.USERS
SELECT 
  id,
  email,
  role,
  nom,
  prenom,
  created_at
FROM public.users
WHERE email = 'votre.email@mairie.ci';  -- REMPLACER ICI

-- ============================================
-- SI L'EMAIL EXISTE ET VOUS VOULEZ LE SUPPRIMER
-- ============================================

-- 3. SUPPRIMER DE PUBLIC.USERS (d'abord)
DELETE FROM public.users
WHERE email = 'votre.email@mairie.ci';  -- REMPLACER ICI

-- 4. SUPPRIMER DE AUTH.USERS (ensuite)
-- ⚠️ ATTENTION : Cette opération est irréversible !
-- Décommenter la ligne ci-dessous pour supprimer
-- DELETE FROM auth.users WHERE email = 'votre.email@mairie.ci';

-- ============================================
-- VOIR TOUS LES EMAILS DANS AUTH.USERS
-- ============================================
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 20;

-- ============================================
-- VOIR TOUS LES AGENTS
-- ============================================
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

-- ============================================
-- NETTOYER LES UTILISATEURS ORPHELINS
-- ============================================
-- Utilisateurs dans auth.users mais pas dans public.users

-- Voir les orphelins
SELECT 
  au.id,
  au.email,
  au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;

-- Supprimer les orphelins (DÉCOMMENTER SI NÉCESSAIRE)
-- DELETE FROM auth.users
-- WHERE id IN (
--   SELECT au.id
--   FROM auth.users au
--   LEFT JOIN public.users pu ON au.id = pu.id
--   WHERE pu.id IS NULL
-- );

-- ============================================
-- NOTES
-- ============================================
-- Si vous voyez l'email dans auth.users mais pas dans public.users,
-- c'est un "utilisateur orphelin" qui bloque la création.
-- 
-- Solution : Supprimer de auth.users avec la commande DELETE ci-dessus
-- ============================================
