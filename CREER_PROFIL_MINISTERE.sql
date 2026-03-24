-- ============================================
-- CRÉER PROFIL MINISTÈRE
-- ============================================
-- Script pour créer un utilisateur ministère
-- ============================================

-- ÉTAPE 1: Créer l'utilisateur dans Supabase Auth
-- ------------------------------------------------
-- 1. Aller dans Supabase → Authentication → Users
-- 2. Cliquer sur "Add user"
-- 3. Remplir:
--    - Email: ministere@gouv.ci
--    - Password: VotreMotDePasseSecurise123!
--    - Email Confirm: ✅ (cocher)
-- 4. Cliquer "Create user"
-- 5. COPIER L'ID DE L'UTILISATEUR CRÉÉ

-- ÉTAPE 2: Créer le profil dans public.users
-- -------------------------------------------
-- Remplacer 'VOTRE_USER_ID_ICI' par l'ID copié ci-dessus

INSERT INTO public.users (
  id,
  email,
  role,
  nom,
  prenom,
  telephone,
  mairie_id,
  created_at,
  updated_at
)
VALUES (
  '44b85afa-4106-4f4f-98d1-7858177daab5',  -- ⚠️ REMPLACER PAR L'ID RÉEL
  'ministere@gouv.ci',
  'ministere',
  'Ministère',
  'Intérieur et Administration du Territoire',
  '+225 27 20 30 40 50',
  NULL,  -- Le ministère n'est pas lié à une mairie
  NOW(),
  NOW()
);

-- ÉTAPE 3: Vérifier que le profil a été créé
-- -------------------------------------------
SELECT 
  id,
  email,
  role,
  nom,
  prenom,
  created_at
FROM public.users 
WHERE role = 'ministere';

-- ============================================
-- EXEMPLE AVEC UN ID RÉEL
-- ============================================

-- Si votre ID utilisateur est: 12345678-1234-1234-1234-123456789abc
-- Utilisez cette commande:

/*
INSERT INTO public.users (
  id,
  email,
  role,
  nom,
  prenom,
  telephone,
  mairie_id
)
VALUES (
  '12345678-1234-1234-1234-123456789abc',
  'ministere@gouv.ci',
  'ministere',
  'Ministère',
  'Intérieur',
  '+225 27 20 30 40 50',
  NULL
);
*/

-- ============================================
-- ALTERNATIVE: Utiliser l'email pour trouver l'ID
-- ============================================

-- Si vous avez créé l'utilisateur mais oublié l'ID:

/*
-- 1. Trouver l'ID dans auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'ministere@gouv.ci';

-- 2. Copier l'ID affiché
-- 3. Utiliser l'INSERT ci-dessus avec cet ID
*/

-- ============================================
-- VÉRIFICATIONS
-- ============================================

-- Vérifier que l'utilisateur existe dans auth.users
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
WHERE email = 'ministere@gouv.ci';

-- Vérifier que le profil existe dans public.users
SELECT id, email, role, nom, prenom
FROM public.users
WHERE email = 'ministere@gouv.ci';

-- Vérifier que le rôle 'ministere' existe
SELECT enum_range(NULL::user_role) AS roles_disponibles;

-- ============================================
-- RÉSOLUTION DE PROBLÈMES
-- ============================================

/*
ERREUR: "invalid input syntax for type uuid"
SOLUTION: Vérifiez que l'ID est bien au format UUID
          Format correct: 12345678-1234-1234-1234-123456789abc

ERREUR: "duplicate key value"
SOLUTION: Le profil existe déjà
          SELECT * FROM public.users WHERE email = 'ministere@gouv.ci';

ERREUR: "invalid input value for enum user_role: ministere"
SOLUTION: Le rôle n'existe pas encore
          ALTER TYPE user_role ADD VALUE 'ministere';

ERREUR: "violates foreign key constraint"
SOLUTION: L'utilisateur n'existe pas dans auth.users
          Créez d'abord l'utilisateur dans Supabase Auth
*/

-- ============================================
-- APRÈS CRÉATION
-- ============================================

-- Tester la connexion:
-- 1. Aller sur: http://localhost:3000/login
-- 2. Email: ministere@gouv.ci
-- 3. Password: VotreMotDePasseSecurise123!
-- 4. Vous devriez être redirigé vers /ministere/dashboard

-- ============================================
-- FIN DU SCRIPT
-- ============================================

SELECT 'Script de création de profil ministère prêt!' AS message;
SELECT 'N''oubliez pas de remplacer VOTRE_USER_ID_ICI par l''ID réel' AS important;
