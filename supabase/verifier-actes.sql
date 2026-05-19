-- ============================================
-- VÉRIFIER LES ACTES DANS LA BASE
-- ============================================

-- 1. Compter les actes de naissance
SELECT 'Naissances' AS type, COUNT(*) AS total FROM naissances;

-- 2. Voir quelques exemples de numéros d'actes
SELECT numero_acte, nom, prenom, date_naissance 
FROM naissances 
LIMIT 5;

-- 3. Compter les mariages
SELECT 'Mariages' AS type, COUNT(*) AS total FROM mariages;

-- 4. Compter les décès
SELECT 'Décès' AS type, COUNT(*) AS total FROM deces;

-- 5. Vérifier si un numéro d'acte spécifique existe
-- Remplacez 'VOTRE_NUMERO' par le numéro que vous testez
SELECT * FROM naissances WHERE numero_acte = 'VOTRE_NUMERO';
