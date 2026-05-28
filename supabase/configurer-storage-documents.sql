-- ============================================
-- CONFIGURATION DU BUCKET STORAGE "documents"
-- ============================================

-- 1. Créer le bucket s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Politique : Permettre l'upload pour les agents authentifiés
CREATE POLICY "Agents peuvent uploader des documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid() IN (
    SELECT id FROM users WHERE role IN ('agent', 'admin', 'ministere')
  )
);

-- 3. Politique : Tout le monde peut lire les documents (bucket public)
CREATE POLICY "Lecture publique des documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');

-- 4. Politique : Les agents peuvent mettre à jour leurs documents
CREATE POLICY "Agents peuvent mettre à jour les documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid() IN (
    SELECT id FROM users WHERE role IN ('agent', 'admin', 'ministere')
  )
);

-- 5. Politique : Les admins peuvent supprimer
CREATE POLICY "Admins peuvent supprimer les documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid() IN (
    SELECT id FROM users WHERE role IN ('admin', 'ministere')
  )
);

-- Vérifier les politiques
SELECT * FROM storage.policies WHERE bucket_id = 'documents';
