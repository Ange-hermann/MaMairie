-- ============================================
-- DEBUG : Vérifier les demandes et leurs colonnes
-- ============================================

-- 1. Voir la structure de la table requests
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'requests'
ORDER BY ordinal_position;

-- 2. Voir quelques demandes avec toutes les colonnes
SELECT *
FROM requests
LIMIT 5;

-- 3. Compter les demandes par colonne possible
-- Par user_id
SELECT 
    'user_id' as colonne,
    COUNT(*) as total_demandes
FROM requests
WHERE user_id IS NOT NULL;

-- Par created_by
SELECT 
    'created_by' as colonne,
    COUNT(*) as total_demandes
FROM requests
WHERE created_by IS NOT NULL;

-- Par agent_id
SELECT 
    'agent_id' as colonne,
    COUNT(*) as total_demandes
FROM requests
WHERE agent_id IS NOT NULL;

-- Par traite_par
SELECT 
    'traite_par' as colonne,
    COUNT(*) as total_demandes
FROM requests
WHERE traite_par IS NOT NULL;

-- 4. Voir les demandes avec les emails des utilisateurs
SELECT 
    r.id,
    r.type_acte,
    r.statut,
    r.created_at,
    u_creator.email as demandeur_email,
    u_agent.email as agent_email
FROM requests r
LEFT JOIN users u_creator ON r.user_id = u_creator.id
LEFT JOIN users u_agent ON r.agent_id = u_agent.id
LIMIT 10;

-- 5. Compter les demandes par agent (toutes les colonnes possibles)
SELECT 
    u.email,
    u.nom,
    u.prenom,
    COUNT(DISTINCT CASE WHEN r.user_id = u.id THEN r.id END) as demandes_creees,
    COUNT(DISTINCT CASE WHEN r.agent_id = u.id THEN r.id END) as demandes_agent_id,
    COUNT(DISTINCT CASE WHEN r.traite_par = u.id THEN r.id END) as demandes_traitees,
    COUNT(DISTINCT CASE WHEN r.created_by = u.id THEN r.id END) as demandes_created_by
FROM users u
LEFT JOIN requests r ON (
    r.user_id = u.id OR 
    r.agent_id = u.id OR 
    r.traite_par = u.id OR 
    r.created_by = u.id
)
WHERE u.role = 'agent'
GROUP BY u.id, u.email, u.nom, u.prenom
ORDER BY u.email;

-- 6. Total des demandes dans la base
SELECT COUNT(*) as total_demandes FROM requests;

-- 7. Demandes par statut
SELECT statut, COUNT(*) as nombre
FROM requests
GROUP BY statut;
