-- Diagnostic complet : Pourquoi l'agent ne voit pas les avis ?

-- 1. Voir les avis créés avec les infos de mairie
SELECT 
  a.id,
  a.code_suivi,
  a.type_mention,
  a.statut,
  a.mairie_id,
  m.nom_mairie,
  m.ville,
  a.created_at
FROM avis_mentions a
LEFT JOIN mairies m ON a.mairie_id = m.id
ORDER BY a.created_at DESC
LIMIT 5;

-- 2. Voir les agents avec leur mairie
SELECT 
  u.id,
  u.email,
  u.nom,
  u.prenom,
  u.role,
  u.mairie_id,
  m.nom_mairie
FROM users u
LEFT JOIN mairies m ON u.mairie_id = m.id
WHERE u.role = 'agent'
ORDER BY u.created_at DESC
LIMIT 5;

-- 3. Comparer : Avis vs Agent
SELECT 
  'AVIS' as type,
  COUNT(*) as nombre,
  mairie_id
FROM avis_mentions
GROUP BY mairie_id

UNION ALL

SELECT 
  'AGENTS' as type,
  COUNT(*) as nombre,
  mairie_id
FROM users
WHERE role = 'agent'
GROUP BY mairie_id;

-- 4. Vérifier si les mairie_id correspondent
SELECT 
  'Problème détecté !' as alerte,
  'Les avis sont pour la mairie ' || a.mairie_id as avis_mairie,
  'Mais l''agent est dans la mairie ' || u.mairie_id as agent_mairie
FROM avis_mentions a
CROSS JOIN users u
WHERE u.role = 'agent'
AND a.mairie_id != u.mairie_id
LIMIT 1;
