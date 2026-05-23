-- ========================================
-- CORRIGER L'ACCÈS AU DASHBOARD MINISTÈRE
-- ========================================

-- ÉTAPE 1 : Voir les utilisateurs ministère
SELECT 
  id,
  email,
  nom,
  prenom,
  role,
  mairie_id
FROM users
WHERE role = 'ministere' OR role = 'admin' OR email LIKE '%ministere%'
ORDER BY created_at DESC;

-- ÉTAPE 2 : Vérifier s'ils ont un mairie_id
SELECT 
  'Utilisateurs ministère sans mairie' as info,
  COUNT(*) as nombre
FROM users
WHERE (role = 'ministere' OR role = 'admin')
AND mairie_id IS NULL;

-- ÉTAPE 3 : Les utilisateurs ministère ne devraient PAS avoir de mairie_id
-- Ils doivent avoir mairie_id = NULL pour accéder au dashboard national

-- Si vous ne pouvez pas vous connecter, c'est peut-être un problème de rôle
-- Vérifiez votre rôle :
SELECT 
  email,
  role,
  mairie_id
FROM users
WHERE email = 'votre-email@example.com';  -- Remplacez par votre email

-- ÉTAPE 4 : Si votre rôle n'est pas 'ministere', corrigez-le
-- UPDATE users 
-- SET role = 'ministere', mairie_id = NULL
-- WHERE email = 'votre-email@example.com';

-- ÉTAPE 5 : Vérifier les rôles disponibles
SELECT DISTINCT role, COUNT(*) as nombre
FROM users
GROUP BY role
ORDER BY role;

-- ÉTAPE 6 : Si le problème persiste, vérifiez la route de protection
-- Le fichier /app/ministere/layout.tsx vérifie probablement :
-- - role === 'ministere' OU role === 'admin'
-- - mairie_id === null (pour accès national)
