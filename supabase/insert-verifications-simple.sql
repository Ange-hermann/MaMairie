-- ============================================
-- INSÉRER DES VÉRIFICATIONS DE TEST (VERSION SIMPLE)
-- ============================================

-- D'abord, voir la structure de la table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'verifications_actes'
ORDER BY ordinal_position;

-- Si la table a une colonne acte_id NOT NULL, 
-- il faut d'abord récupérer les vrais IDs des actes

-- Vérifier les actes existants
SELECT id, numero_acte, 'naissance' as type FROM naissances LIMIT 5;

-- OPTION 1: Insérer avec les vrais IDs d'actes
-- Remplacez les UUID ci-dessous par les vrais IDs de vos actes

-- OPTION 2: Modifier la table pour rendre acte_id nullable
ALTER TABLE verifications_actes ALTER COLUMN acte_id DROP NOT NULL;

-- Puis insérer sans acte_id
INSERT INTO verifications_actes (
  numero_acte,
  type_acte,
  statut_verification,
  nombre_verifications
) VALUES
('1234567890', 'naissance', 'valide', 3),
('1234567', 'naissance', 'valide', 2),
('2353783', 'naissance', 'valide', 1),
('2323245', 'naissance', 'suspect', 2),
('9999999', 'naissance', 'suspect', 1),
('0000000', 'naissance', 'invalide', 1),
('1111111', 'naissance', 'invalide', 2);

-- Vérifier
SELECT 
  statut_verification,
  COUNT(*) as total
FROM verifications_actes
GROUP BY statut_verification;
