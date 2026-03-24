-- ============================================
-- AJOUTER LE RÔLE MINISTÈRE
-- ============================================
-- Ajoute le rôle "ministere" à l'enum user_role
-- ============================================

-- 1. Ajouter le rôle "ministere" à l'enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'ministere';

-- 2. Vérifier que le rôle a été ajouté
SELECT enum_range(NULL::user_role) AS roles_disponibles;

-- 3. Créer un utilisateur ministère de test
-- Note: Remplacer par vos vraies informations

-- Insérer dans la table users (après avoir créé l'utilisateur dans Supabase Auth)
-- INSERT INTO public.users (id, email, role, nom, prenom, telephone, mairie_id)
-- VALUES (
--   'VOTRE_USER_ID_ICI',
--   'ministere@gouv.ci',
--   'ministere',
--   'Ministère',
--   'Intérieur',
--   '+225 00 00 00 00',
--   NULL -- Le ministère n'est pas lié à une mairie spécifique
-- );

-- ============================================
-- INSTRUCTIONS
-- ============================================

/*
ÉTAPE 1: Exécuter ce script pour ajouter le rôle

ÉTAPE 2: Créer un utilisateur dans Supabase Auth
  - Aller dans Authentication → Users
  - Cliquer "Add user"
  - Email: ministere@gouv.ci
  - Password: (choisir un mot de passe sécurisé)
  - Copier l'ID de l'utilisateur créé

ÉTAPE 3: Créer le profil dans public.users
  - Remplacer VOTRE_USER_ID_ICI par l'ID copié
  - Décommenter et exécuter l'INSERT ci-dessus

ÉTAPE 4: Exécuter ministere-schema.sql
  - Créer toutes les tables du ministère

ÉTAPE 5: Se connecter
  - URL: http://localhost:3000/login
  - Email: ministere@gouv.ci
  - Password: (votre mot de passe)
  - Redirection automatique vers /ministere/dashboard
*/

-- Vérification finale
SELECT 'Rôle ministère ajouté avec succès!' AS message;
SELECT 'Vous pouvez maintenant créer un utilisateur avec le rôle ministere' AS next_step;
