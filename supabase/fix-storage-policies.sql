-- ============================================
-- CORRIGER LES POLITIQUES DU BUCKET demandes-documents
-- ============================================

-- 1. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Agents peuvent uploader" ON storage.objects;
DROP POLICY IF EXISTS "Lecture publique" ON storage.objects;
DROP POLICY IF EXISTS "Agents upload demandes-documents" ON storage.objects;
DROP POLICY IF EXISTS "Public read demandes-documents" ON storage.objects;

-- 2. Politique : Permettre l'upload pour les utilisateurs authentifiés
CREATE POLICY "Agents upload demandes-documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'demandes-documents'
);

-- 3. Politique : Lecture publique
CREATE POLICY "Public read demandes-documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'demandes-documents');

-- 4. Politique : Mise à jour pour les authentifiés
CREATE POLICY "Agents update demandes-documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'demandes-documents');

-- 5. Politique : Suppression pour les authentifiés
CREATE POLICY "Agents delete demandes-documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'demandes-documents');

-- Politiques créées avec succès !
