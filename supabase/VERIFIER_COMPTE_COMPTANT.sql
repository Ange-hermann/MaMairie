-- Vérifier s'il existe un compte "Comptant" dans la base de données

-- 1. Chercher dans la table users
SELECT 
    id,
    email,
    nom,
    prenom,
    role,
    mairie_id,
    created_at
FROM users
WHERE nom ILIKE '%comptant%' 
   OR prenom ILIKE '%comptant%'
   OR email ILIKE '%comptant%';

-- 2. Chercher dans auth.users
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users
WHERE email ILIKE '%comptant%';

-- 3. Vérifier tous les agents
SELECT 
    id,
    email,
    nom,
    prenom,
    mairie_id
FROM users
WHERE role = 'agent'
ORDER BY created_at DESC;
