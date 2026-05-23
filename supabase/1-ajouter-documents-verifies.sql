-- FICHIER 1 : Ajouter 'documents_verifies'
-- Exécuter ce fichier EN PREMIER

ALTER TYPE statut_declaration_enum ADD VALUE IF NOT EXISTS 'documents_verifies';
