-- Script pour créer un utilisateur de test manuellement
-- À exécuter dans Supabase SQL Editor

-- IMPORTANT: Vous devez d'abord créer l'utilisateur dans Authentication → Users
-- Puis récupérer son ID et le remplacer ci-dessous

-- Exemple d'utilisateur à créer dans Auth:
-- Email: citoyen@test.com
-- Password: Test123456!
-- Auto Confirm User: ✅ (cocher)

-- Une fois l'utilisateur créé dans Auth, copiez son ID et exécutez:

INSERT INTO users (
  id,
  nom,
  prenom,
  email,
  telephone,
  role,
  mairie_id,
  created_at,
  updated_at
) VALUES (
  'REMPLACER_PAR_ID_UTILISATEUR',  -- ⚠️ Remplacez par l'ID réel de l'utilisateur Auth
  'Kouadio',
  'Jean',
  'citoyen@test.com',
  '+225 07 12 34 56 78',
  'citoyen',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  nom = EXCLUDED.nom,
  prenom = EXCLUDED.prenom,
  email = EXCLUDED.email,
  telephone = EXCLUDED.telephone,
  updated_at = NOW();

-- Vérifier que l'utilisateur a bien été créé
SELECT * FROM users WHERE email = 'citoyen@test.com';

-- Créer d'autres utilisateurs de test si nécessaire:

-- AGENT
-- 1. Créer dans Auth: agent@test.com / Test123456!
-- 2. Récupérer l'ID
-- 3. Exécuter:
/*
INSERT INTO users (id, nom, prenom, email, telephone, role, mairie_id)
VALUES (
  'ID_AGENT_ICI',
  'Traoré',
  'Aminata',
  'agent@test.com',
  '+225 07 98 76 54 32',
  'agent',
  '11111111-1111-1111-1111-111111111111'  -- ID de la mairie de Cocody
);
*/

-- ADMIN
-- 1. Créer dans Auth: admin@test.com / Test123456!
-- 2. Récupérer l'ID
-- 3. Exécuter:
/*
INSERT INTO users (id, nom, prenom, email, telephone, role, mairie_id)
VALUES (
  'ID_ADMIN_ICI',
  'Koné',
  'Ibrahim',
  'admin@test.com',
  '+225 07 11 22 33 44',
  'admin',
  NULL
);
*/
