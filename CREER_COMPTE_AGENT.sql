-- ========================================
-- CRÉER UN COMPTE AGENT DANS SUPABASE
-- ========================================
-- Ce script crée un utilisateur agent pour accéder à l'espace agent

-- OPTION 1 : Utiliser votre compte existant (angeherboua@gmail.com)
-- ========================================

-- 1. Changer le rôle de votre compte existant en agent
UPDATE public.users
SET role = 'agent'
WHERE email = 'angeherboua@gmail.com';

-- 2. Assigner une mairie (si pas déjà fait)
UPDATE public.users
SET mairie_id = (SELECT id FROM public.mairies LIMIT 1)
WHERE email = 'angeherboua@gmail.com'
AND mairie_id IS NULL;

-- 3. Vérifier que tout est OK
SELECT 
  id,
  email,
  nom,
  prenom,
  role,
  mairie_id,
  (SELECT nom_mairie FROM public.mairies WHERE id = users.mairie_id) as mairie_nom
FROM public.users
WHERE email = 'angeherboua@gmail.com';

-- ✅ Maintenant déconnectez-vous et reconnectez-vous avec angeherboua@gmail.com
-- Vous aurez accès à l'espace agent !


-- ========================================
-- OPTION 2 : Créer un nouveau compte agent
-- ========================================
-- Si vous voulez un compte séparé pour tester

-- IMPORTANT : D'abord, créez l'utilisateur via l'interface Supabase :
-- 1. Allez sur https://supabase.com
-- 2. Authentication → Users → Add User
-- 3. Email : agent@mamairie.com
-- 4. Password : Agent123!
-- 5. Copiez l'ID de l'utilisateur créé

-- Ensuite, exécutez ce script en remplaçant 'USER_ID_ICI' par l'ID copié :

/*
INSERT INTO public.users (
  id,
  email,
  nom,
  prenom,
  telephone,
  role,
  mairie_id
) VALUES (
  'USER_ID_ICI'::uuid,  -- Remplacez par l'ID de l'utilisateur Auth
  'agent@mamairie.com',
  'Agent',
  'Test',
  '+225 07 00 00 00 00',
  'agent',
  (SELECT id FROM public.mairies LIMIT 1)
);
*/

-- Vérifier le nouveau compte :
/*
SELECT 
  u.id,
  u.email,
  u.nom,
  u.prenom,
  u.role,
  m.nom_mairie
FROM public.users u
LEFT JOIN public.mairies m ON u.mairie_id = m.id
WHERE u.email = 'agent@mamairie.com';
*/


-- ========================================
-- OPTION 3 : Créer plusieurs agents de test
-- ========================================

-- Pour créer plusieurs agents, répétez le processus :
-- 1. Créer l'utilisateur dans Authentication
-- 2. Ajouter le profil dans public.users

-- Exemple d'agents :
-- agent1@mamairie.com / Agent123!
-- agent2@mamairie.com / Agent123!
-- agent3@mamairie.com / Agent123!


-- ========================================
-- VÉRIFICATIONS IMPORTANTES
-- ========================================

-- 1. Vérifier qu'il y a au moins une mairie
SELECT COUNT(*) as nombre_mairies FROM public.mairies;

-- Si 0, créer une mairie :
/*
INSERT INTO public.mairies (nom_mairie, ville, pays, code_mairie)
VALUES ('Mairie de Test', 'Abidjan', 'Côte d''Ivoire', 'MAI001');
*/

-- 2. Vérifier tous les agents
SELECT 
  u.email,
  u.nom,
  u.prenom,
  u.role,
  m.nom_mairie
FROM public.users u
LEFT JOIN public.mairies m ON u.mairie_id = m.id
WHERE u.role = 'agent';

-- 3. Vérifier les tables État Civil existent
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('naissances', 'mariages', 'deces');

-- Si les tables n'existent pas, exécutez : supabase/etat-civil-schema.sql


-- ========================================
-- RÉSUMÉ DES ÉTAPES
-- ========================================

/*
POUR UTILISER VOTRE COMPTE EXISTANT :
1. Exécutez les lignes 9-24 de ce fichier
2. Déconnectez-vous de l'application
3. Reconnectez-vous avec angeherboua@gmail.com
4. ✅ Vous êtes maintenant agent !

POUR CRÉER UN NOUVEAU COMPTE :
1. Supabase → Authentication → Users → Add User
2. Email : agent@mamairie.com
3. Password : Agent123!
4. Copiez l'ID utilisateur
5. Exécutez les lignes 38-51 en remplaçant USER_ID_ICI
6. Connectez-vous avec agent@mamairie.com / Agent123!
7. ✅ Compte agent créé !

ACCÈS À L'ESPACE AGENT :
- URL : http://localhost:3000/dashboard-agent
- Menu : État Civil → Naissances, Mariages, Décès
- Demandes : Traiter les demandes des citoyens
*/


-- ========================================
-- DONNÉES DE TEST (Optionnel)
-- ========================================

-- Créer quelques naissances de test
/*
INSERT INTO public.naissances (
  mairie_id,
  agent_id,
  nom_enfant,
  prenom_enfant,
  date_naissance,
  lieu_naissance,
  sexe,
  nom_pere,
  nom_mere,
  numero_acte,
  annee
) VALUES 
(
  (SELECT mairie_id FROM public.users WHERE email = 'angeherboua@gmail.com'),
  (SELECT id FROM public.users WHERE email = 'angeherboua@gmail.com'),
  'Kouassi',
  'Jean',
  '2024-01-15',
  'Abidjan',
  'Masculin',
  'Kouassi Père',
  'Kouassi Mère',
  'N001',
  2024
),
(
  (SELECT mairie_id FROM public.users WHERE email = 'angeherboua@gmail.com'),
  (SELECT id FROM public.users WHERE email = 'angeherboua@gmail.com'),
  'Yao',
  'Marie',
  '2024-02-20',
  'Abidjan',
  'Féminin',
  'Yao Père',
  'Yao Mère',
  'N002',
  2024
);
*/

-- ✅ SCRIPT TERMINÉ
-- Exécutez les sections appropriées selon votre besoin !
