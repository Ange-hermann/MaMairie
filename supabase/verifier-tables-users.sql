-- Vérifier quelles tables existent pour les utilisateurs/agents
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%user%' OR table_name LIKE '%agent%'
ORDER BY table_name;

-- Voir toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
