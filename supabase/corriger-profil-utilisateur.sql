-- ========================================
-- CORRIGER PROFIL UTILISATEUR INTROUVABLE
-- ========================================

-- ÉTAPE 1 : Vérifier si votre compte existe dans auth.users
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'ministere@gouv.ci'  -- Remplacez par votre email
LIMIT 1;

-- ÉTAPE 2 : Vérifier si votre profil existe dans public.users
SELECT 
  id,
  email,
  nom,
  prenom,
  role,
  mairie_id
FROM public.users
WHERE email = 'ministere@gouv.ci'  -- Remplacez par votre email
LIMIT 1;

-- ÉTAPE 3 : Si le profil n'existe pas dans public.users, le créer
-- Récupérez d'abord l'ID de auth.users
DO $$
DECLARE
  auth_user_id UUID;
BEGIN
  -- Récupérer l'ID de auth.users
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = 'ministere@gouv.ci'  -- Remplacez par votre email
  LIMIT 1;

  -- Vérifier si le profil existe déjà
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth_user_id) THEN
    -- Créer le profil
    INSERT INTO public.users (id, email, nom, prenom, role, mairie_id, telephone)
    VALUES (
      auth_user_id,
      'ministere@gouv.ci',  -- Remplacez par votre email
      'Ministère',
      'Admin',
      'ministere'::user_role,
      NULL,
      '+225 00 00 00 00'  -- Téléphone par défaut
    );
    RAISE NOTICE 'Profil créé avec succès';
  ELSE
    RAISE NOTICE 'Le profil existe déjà';
  END IF;
END $$;

-- ÉTAPE 4 : Vérifier que le profil a été créé
SELECT 
  id,
  email,
  nom,
  prenom,
  role,
  mairie_id
FROM public.users
WHERE email = 'ministere@gouv.ci'  -- Remplacez par votre email
LIMIT 1;

-- ÉTAPE 5 : Faire pareil pour tous les utilisateurs auth sans profil
INSERT INTO public.users (id, email, nom, prenom, role, mairie_id, telephone)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'nom', 'Utilisateur'),
  COALESCE(au.raw_user_meta_data->>'prenom', 'Nouveau'),
  COALESCE(au.raw_user_meta_data->>'role', 'citoyen')::user_role,
  NULL,
  COALESCE(au.raw_user_meta_data->>'telephone', '+225 00 00 00 00')
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- ÉTAPE 6 : Vérifier tous les profils
SELECT 
  'Utilisateurs auth' as type,
  COUNT(*) as nombre
FROM auth.users
UNION ALL
SELECT 
  'Profils public.users' as type,
  COUNT(*) as nombre
FROM public.users;

-- ÉTAPE 7 : Voir les utilisateurs auth sans profil
SELECT 
  au.id,
  au.email,
  au.created_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
);
