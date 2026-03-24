-- Créer le bucket pour les documents des demandes
-- À exécuter dans Supabase SQL Editor

-- 1. Créer le bucket "demandes-documents"
INSERT INTO storage.buckets (id, name, public)
VALUES ('demandes-documents', 'demandes-documents', false);

-- 2. Créer les policies pour le bucket
-- Policy pour permettre aux utilisateurs connectés d'uploader leurs documents
CREATE POLICY "Les utilisateurs peuvent uploader leurs documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'demandes-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy pour permettre aux utilisateurs de voir leurs propres documents
CREATE POLICY "Les utilisateurs peuvent voir leurs documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'demandes-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy pour permettre aux agents de voir tous les documents
CREATE POLICY "Les agents peuvent voir tous les documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'demandes-documents' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('agent', 'admin')
  )
);

-- Policy pour permettre aux utilisateurs de supprimer leurs documents
CREATE POLICY "Les utilisateurs peuvent supprimer leurs documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'demandes-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Vérifier que le bucket a été créé
SELECT * FROM storage.buckets WHERE id = 'demandes-documents';
