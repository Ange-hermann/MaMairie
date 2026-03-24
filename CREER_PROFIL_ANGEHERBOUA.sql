-- Créer le profil pour angeherboua@gmail.com
-- ID utilisateur : 84ed3a18-a758-406b-a251-a523344f0ef1

-- 1. Vérifier que l'utilisateur existe dans auth
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'angeherboua@gmail.com';

-- 2. Créer le profil dans la table users
INSERT INTO public.users (
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
  '84ed3a18-a758-406b-a251-a523344f0ef1',  -- ID de l'utilisateur
  'Herboua',                                 -- Nom
  'Ange',                                    -- Prénom
  'angeherboua@gmail.com',                   -- Email
  '+225 01 40 78 78 45',                     -- Téléphone (modifiez si besoin)
  'citoyen',                                 -- Role
  NULL,                                      -- NULL pour citoyen
  NOW(),
  NOW()
);

-- 3. Vérifier que le profil a été créé
SELECT * FROM public.users WHERE email = 'angeherboua@gmail.com';

-- 4. Vérification complète
SELECT 
  auth.users.id as auth_id,
  auth.users.email,
  auth.users.email_confirmed_at,
  public.users.id as profile_id,
  public.users.nom,
  public.users.prenom,
  public.users.role
FROM auth.users
INNER JOIN public.users ON auth.users.id = public.users.id
WHERE auth.users.email = 'angeherboua@gmail.com';
