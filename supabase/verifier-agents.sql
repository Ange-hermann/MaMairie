-- Vérifier les agents dans la base
SELECT 
  id,
  email,
  nom,
  prenom,
  role,
  mairie_id,
  created_at
FROM users
WHERE role = 'agent'
ORDER BY created_at DESC;

-- Compter les agents
SELECT COUNT(*) as total_agents
FROM users
WHERE role = 'agent';

-- Voir tous les rôles
SELECT role, COUNT(*) as nombre
FROM users
GROUP BY role;
