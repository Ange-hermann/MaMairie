-- ============================================
-- VÉRIFIER LE RÔLE MINISTÈRE
-- ============================================

-- Vérifier le profil ministère
SELECT 
  id,
  email,
  role,
  nom,
  prenom,
  created_at
FROM public.users 
WHERE email = 'ministere@gouv.ci';

-- Résultat attendu:
-- role devrait être 'ministere'

-- Si le rôle n'est pas 'ministere', le corriger:
-- UPDATE public.users 
-- SET role = 'ministere' 
-- WHERE email = 'ministere@gouv.ci';
