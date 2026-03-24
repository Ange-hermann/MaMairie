-- ============================================
-- CRÉER LE BUCKET POUR LES AVATARS
-- ============================================
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- 1. Créer le bucket "avatars" (PUBLIC pour affichage facile)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Créer les policies pour le bucket avatars

-- Policy pour permettre aux utilisateurs d'uploader leur avatar
CREATE POLICY "Les utilisateurs peuvent uploader leur avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy pour permettre à tout le monde de voir les avatars (bucket public)
CREATE POLICY "Tout le monde peut voir les avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy pour permettre aux utilisateurs de mettre à jour leur avatar
CREATE POLICY "Les utilisateurs peuvent mettre à jour leur avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy pour permettre aux utilisateurs de supprimer leur avatar
CREATE POLICY "Les utilisateurs peuvent supprimer leur avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Ajouter la colonne avatar_url à la table users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 4. Vérifier que le bucket a été créé
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- 5. Vérifier que la colonne avatar_url existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'avatar_url';

-- ============================================
-- NOTES
-- ============================================
-- Le bucket "avatars" est PUBLIC pour faciliter l'affichage
-- Les utilisateurs peuvent uniquement gérer leur propre avatar
-- Format des fichiers : {user_id}/avatar.jpg
-- ============================================
