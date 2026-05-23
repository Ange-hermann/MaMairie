-- FICHIER 2 : Ajouter 'remis'
-- Exécuter ce fichier EN DEUXIÈME (après le fichier 1)

ALTER TYPE statut_declaration_enum ADD VALUE IF NOT EXISTS 'remis';
