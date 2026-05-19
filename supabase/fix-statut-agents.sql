-- ============================================
-- FIX : Ajouter la colonne statut pour les agents
-- ============================================

-- Vérifier si la colonne statut existe
DO $$ 
BEGIN
    -- Ajouter la colonne statut si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'statut'
    ) THEN
        ALTER TABLE users ADD COLUMN statut VARCHAR(20) DEFAULT 'actif';
        RAISE NOTICE 'Colonne statut ajoutée avec succès';
    ELSE
        RAISE NOTICE 'Colonne statut existe déjà';
    END IF;
END $$;

-- Mettre à jour les agents existants sans statut
UPDATE users 
SET statut = 'actif' 
WHERE role = 'agent' 
AND (statut IS NULL OR statut = '');

-- Vérifier les résultats
SELECT 
    id,
    email,
    nom,
    prenom,
    role,
    statut,
    created_at
FROM users
WHERE role = 'agent'
ORDER BY created_at DESC
LIMIT 10;

-- Statistiques
SELECT 
    statut,
    COUNT(*) as nombre
FROM users
WHERE role = 'agent'
GROUP BY statut;

-- ============================================
-- TESTS
-- ============================================

-- Test 1 : Bloquer un agent
-- UPDATE users SET statut = 'bloque' WHERE email = 'test@mairie.ci';

-- Test 2 : Débloquer un agent
-- UPDATE users SET statut = 'actif' WHERE email = 'test@mairie.ci';

-- Test 3 : Vérifier un agent spécifique
-- SELECT id, email, statut FROM users WHERE email = 'test@mairie.ci';
