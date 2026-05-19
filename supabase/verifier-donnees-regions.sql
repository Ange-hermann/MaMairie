-- ============================================
-- VÉRIFIER LES VRAIES DONNÉES PAR RÉGION
-- ============================================

-- 1. Voir toutes les mairies et leurs régions
SELECT 
    id,
    nom_mairie,
    ville,
    region
FROM mairies
ORDER BY region, nom_mairie;

-- 2. Compter les mairies par région
SELECT 
    region,
    COUNT(*) as nombre_mairies
FROM mairies
WHERE region IS NOT NULL
GROUP BY region
ORDER BY nombre_mairies DESC;

-- 3. Compter les naissances par région
SELECT 
    m.region,
    COUNT(n.id) as naissances
FROM mairies m
LEFT JOIN naissances n ON n.mairie_id = m.id
WHERE m.region IS NOT NULL
GROUP BY m.region
ORDER BY naissances DESC;

-- 4. Compter les demandes par région
SELECT 
    m.region,
    COUNT(r.id) as demandes
FROM mairies m
LEFT JOIN requests r ON r.mairie_id = m.id
WHERE m.region IS NOT NULL
GROUP BY m.region
ORDER BY demandes DESC;

-- 5. Statistiques complètes par région
SELECT 
    m.region,
    COUNT(DISTINCT m.id) as mairies,
    COUNT(DISTINCT n.id) as naissances,
    COUNT(DISTINCT ma.id) as mariages,
    COUNT(DISTINCT d.id) as deces,
    COUNT(DISTINCT r.id) as demandes
FROM mairies m
LEFT JOIN naissances n ON n.mairie_id = m.id
LEFT JOIN mariages ma ON ma.mairie_id = m.id
LEFT JOIN deces d ON d.mairie_id = m.id
LEFT JOIN requests r ON r.mairie_id = m.id
WHERE m.region IS NOT NULL
GROUP BY m.region
ORDER BY (COUNT(DISTINCT n.id) + COUNT(DISTINCT r.id)) DESC;

-- 6. Détail pour Abidjan (pour vérifier)
SELECT 
    'Naissances' as type,
    COUNT(*) as total
FROM naissances n
JOIN mairies m ON n.mairie_id = m.id
WHERE m.region = 'Abidjan'

UNION ALL

SELECT 
    'Demandes' as type,
    COUNT(*) as total
FROM requests r
JOIN mairies m ON r.mairie_id = m.id
WHERE m.region = 'Abidjan';

-- 7. Vérifier s'il y a des données orphelines (sans mairie_id)
SELECT 
    'Naissances sans mairie' as type,
    COUNT(*) as total
FROM naissances
WHERE mairie_id IS NULL

UNION ALL

SELECT 
    'Demandes sans mairie' as type,
    COUNT(*) as total
FROM requests
WHERE mairie_id IS NULL;
