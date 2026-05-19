-- ============================================
-- COMPTER TOUTES LES DONNÉES
-- ============================================

-- 1. Total de naissances
SELECT 'NAISSANCES' as table_name, COUNT(*) as total FROM naissances;

-- 2. Total de demandes
SELECT 'DEMANDES' as table_name, COUNT(*) as total FROM requests;

-- 3. Total de mariages
SELECT 'MARIAGES' as table_name, COUNT(*) as total FROM mariages;

-- 4. Total de décès
SELECT 'DECES' as table_name, COUNT(*) as total FROM deces;

-- 5. Naissances par mairie
SELECT 
    m.nom_mairie,
    m.region,
    COUNT(n.id) as naissances
FROM mairies m
LEFT JOIN naissances n ON n.mairie_id = m.id
GROUP BY m.id, m.nom_mairie, m.region
ORDER BY naissances DESC;

-- 6. Demandes par mairie
SELECT 
    m.nom_mairie,
    m.region,
    COUNT(r.id) as demandes
FROM mairies m
LEFT JOIN requests r ON r.mairie_id = m.id
GROUP BY m.id, m.nom_mairie, m.region
ORDER BY demandes DESC;

-- 7. TOTAL PAR RÉGION (CE QUE LE GRAPHIQUE DEVRAIT AFFICHER)
SELECT 
    m.region,
    COUNT(DISTINCT n.id) as naissances,
    COUNT(DISTINCT r.id) as demandes
FROM mairies m
LEFT JOIN naissances n ON n.mairie_id = m.id
LEFT JOIN requests r ON r.mairie_id = m.id
WHERE m.region IS NOT NULL
GROUP BY m.region
ORDER BY demandes DESC;
