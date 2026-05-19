-- Trouver l'identifiant (email) du compte Ministère

-- 1. Chercher dans la table users
SELECT 
    id,
    email,
    nom,
    prenom,
    role,
    created_at
FROM users
WHERE role = 'ministere'
ORDER BY created_at DESC;

-- 2. Si vous cherchez l'email pour vous connecter
SELECT 
    email as "Email de connexion",
    nom,
    prenom
FROM users
WHERE role = 'ministere'
LIMIT 1;
