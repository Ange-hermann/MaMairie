-- Script pour changer le rôle d'un utilisateur en Agent
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier l'utilisateur actuel
SELECT id, email, nom, prenom, role, mairie_id
FROM public.users
WHERE email = 'angeherboua@gmail.com';

-- 2. Changer le rôle en 'agent'
UPDATE public.users
SET role = 'agent'
WHERE email = 'angeherboua@gmail.com';

-- 3. Assigner une mairie (si pas déjà fait)
-- Récupérer l'ID d'une mairie existante
SELECT id, nom FROM public.mairies LIMIT 5;

-- Assigner la première mairie (remplacez l'ID si nécessaire)
UPDATE public.users
SET mairie_id = (SELECT id FROM public.mairies LIMIT 1)
WHERE email = 'angeherboua@gmail.com'
AND mairie_id IS NULL;

-- 4. Vérifier le changement
SELECT id, email, nom, prenom, role, mairie_id
FROM public.users
WHERE email = 'angeherboua@gmail.com';

-- 5. Vérifier la mairie assignée
SELECT u.email, u.role, m.nom as mairie
FROM public.users u
LEFT JOIN public.mairies m ON u.mairie_id = m.id
WHERE u.email = 'angeherboua@gmail.com';

-- ✅ Vous êtes maintenant un agent !
-- Déconnectez-vous et reconnectez-vous pour que les changements prennent effet
