-- Réinitialiser le mot de passe du compte Ministère
-- ATTENTION : Vous devrez utiliser l'interface Supabase Auth pour cela

-- 1. D'abord, trouvez l'email du compte Ministère
SELECT 
    email,
    nom,
    prenom
FROM users
WHERE role = 'ministere';

-- 2. Pour réinitialiser le mot de passe :
-- Allez dans Supabase Dashboard > Authentication > Users
-- Trouvez l'utilisateur avec cet email
-- Cliquez sur les 3 points (...) > Reset Password
-- Ou envoyez un email de réinitialisation

-- 3. OU créez un nouveau compte Ministère avec un mot de passe connu
-- Utilisez la page d'inscription de votre application
