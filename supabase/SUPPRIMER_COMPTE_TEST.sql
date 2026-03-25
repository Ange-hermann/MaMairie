-- Supprimer le compte test "Comptant"
-- ATTENTION : Cette requête supprime définitivement les données

-- 1. Trouver l'utilisateur
SELECT id, email, nom, prenom, role 
FROM users 
WHERE nom = 'Comptant' OR email LIKE '%comptant%';

-- 2. Supprimer les demandes liées (si c'est un citoyen)
-- DELETE FROM requests WHERE user_id = 'ID_A_REMPLACER';

-- 3. Supprimer les notifications liées
-- DELETE FROM notifications WHERE user_id = 'ID_A_REMPLACER';

-- 4. Supprimer l'utilisateur de la table users
-- DELETE FROM users WHERE id = 'ID_A_REMPLACER';

-- 5. Supprimer de auth.users (Supabase Auth)
-- DELETE FROM auth.users WHERE email = 'EMAIL_A_REMPLACER';


-- OU pour supprimer TOUS les comptes de test d'un coup :
-- (Décommentez les lignes ci-dessous si vous voulez tout supprimer)

/*
-- Supprimer tous les utilisateurs avec "test" dans l'email
DELETE FROM requests WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%test%');
DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%test%');
DELETE FROM users WHERE email LIKE '%test%';
DELETE FROM auth.users WHERE email LIKE '%test%';
*/
