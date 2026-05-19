-- ============================================
-- FIX : Ajouter les colonnes pour lier les actes aux agents
-- ============================================

-- 1. Vérifier les colonnes existantes dans naissances
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'naissances' 
AND column_name IN ('created_by', 'agent_id', 'mairie_id');

-- 2. Vérifier les colonnes existantes dans mariages
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mariages' 
AND column_name IN ('created_by', 'agent_id', 'mairie_id');

-- 3. Vérifier les colonnes existantes dans deces
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'deces' 
AND column_name IN ('created_by', 'agent_id', 'mairie_id');

-- 4. Vérifier les colonnes existantes dans requests
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'requests' 
AND column_name IN ('traite_par', 'agent_id', 'mairie_id');

-- ============================================
-- AJOUTER LES COLONNES SI ELLES N'EXISTENT PAS
-- ============================================

-- Pour naissances
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'naissances' AND column_name = 'agent_id') THEN
        ALTER TABLE naissances ADD COLUMN agent_id UUID REFERENCES users(id);
        RAISE NOTICE 'Colonne agent_id ajoutée à naissances';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'naissances' AND column_name = 'created_by') THEN
        ALTER TABLE naissances ADD COLUMN created_by UUID REFERENCES users(id);
        RAISE NOTICE 'Colonne created_by ajoutée à naissances';
    END IF;
END $$;

-- Pour mariages
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mariages' AND column_name = 'agent_id') THEN
        ALTER TABLE mariages ADD COLUMN agent_id UUID REFERENCES users(id);
        RAISE NOTICE 'Colonne agent_id ajoutée à mariages';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mariages' AND column_name = 'created_by') THEN
        ALTER TABLE mariages ADD COLUMN created_by UUID REFERENCES users(id);
        RAISE NOTICE 'Colonne created_by ajoutée à mariages';
    END IF;
END $$;

-- Pour deces
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deces' AND column_name = 'agent_id') THEN
        ALTER TABLE deces ADD COLUMN agent_id UUID REFERENCES users(id);
        RAISE NOTICE 'Colonne agent_id ajoutée à deces';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deces' AND column_name = 'created_by') THEN
        ALTER TABLE deces ADD COLUMN created_by UUID REFERENCES users(id);
        RAISE NOTICE 'Colonne created_by ajoutée à deces';
    END IF;
END $$;

-- Pour requests
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'traite_par') THEN
        ALTER TABLE requests ADD COLUMN traite_par UUID REFERENCES users(id);
        RAISE NOTICE 'Colonne traite_par ajoutée à requests';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'agent_id') THEN
        ALTER TABLE requests ADD COLUMN agent_id UUID REFERENCES users(id);
        RAISE NOTICE 'Colonne agent_id ajoutée à requests';
    END IF;
END $$;

-- ============================================
-- TESTER LE COMPTAGE
-- ============================================

-- Compter les naissances par agent
SELECT 
    u.email,
    COUNT(n.id) as naissances_count
FROM users u
LEFT JOIN naissances n ON (n.created_by = u.id OR n.agent_id = u.id)
WHERE u.role = 'agent'
GROUP BY u.id, u.email
ORDER BY naissances_count DESC;

-- Compter les mariages par agent
SELECT 
    u.email,
    COUNT(m.id) as mariages_count
FROM users u
LEFT JOIN mariages m ON (m.created_by = u.id OR m.agent_id = u.id)
WHERE u.role = 'agent'
GROUP BY u.id, u.email
ORDER BY mariages_count DESC;

-- Compter les demandes par agent
SELECT 
    u.email,
    COUNT(r.id) as demandes_count
FROM users u
LEFT JOIN requests r ON (r.traite_par = u.id OR r.agent_id = u.id)
WHERE u.role = 'agent'
GROUP BY u.id, u.email
ORDER BY demandes_count DESC;

-- ============================================
-- STATISTIQUES GLOBALES
-- ============================================

SELECT 
    u.email,
    u.nom,
    u.prenom,
    COUNT(DISTINCT n.id) as naissances,
    COUNT(DISTINCT m.id) as mariages,
    COUNT(DISTINCT d.id) as deces,
    COUNT(DISTINCT r.id) as demandes,
    COUNT(DISTINCT n.id) + COUNT(DISTINCT m.id) + COUNT(DISTINCT d.id) as total_actes
FROM users u
LEFT JOIN naissances n ON (n.created_by = u.id OR n.agent_id = u.id)
LEFT JOIN mariages m ON (m.created_by = u.id OR m.agent_id = u.id)
LEFT JOIN deces d ON (d.created_by = u.id OR d.agent_id = u.id)
LEFT JOIN requests r ON (r.traite_par = u.id OR r.agent_id = u.id)
WHERE u.role = 'agent'
GROUP BY u.id, u.email, u.nom, u.prenom
ORDER BY total_actes DESC;
