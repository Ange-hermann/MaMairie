-- ============================================
-- SETUP SIMPLE : BUCKET AVATARS
-- ============================================
-- Script simplifié pour créer le bucket avatars
-- ============================================

-- 1. Créer le bucket "avatars" (PUBLIC)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Ajouter la colonne avatar_url à la table users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Désactiver RLS sur storage.objects (pour simplifier)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 4. Vérification
SELECT * FROM storage.buckets WHERE id = 'avatars';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'avatar_url';

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Bucket "avatars" créé (public = true)
-- Colonne "avatar_url" ajoutée à la table users
-- RLS désactivé sur storage.objects
-- ============================================

-- ============================================
-- NOTES
-- ============================================
-- Ce script désactive RLS sur storage.objects pour simplifier
-- En production, vous pourrez créer des policies appropriées
-- ============================================
