-- Debug rapide avis de mention

-- 1. Compter tous les avis
SELECT COUNT(*) as total_avis FROM avis_mentions;

-- 2. Voir tous les avis avec leur statut
SELECT 
  id,
  code_suivi,
  mairie_id,
  statut,
  created_at
FROM avis_mentions
ORDER BY created_at DESC;

-- 3. Compter par statut
SELECT 
  statut,
  COUNT(*) as nombre
FROM avis_mentions
GROUP BY statut;

-- 4. Voir les mairies des agents
SELECT 
  id,
  email,
  nom,
  prenom,
  mairie_id,
  role
FROM users
WHERE role = 'agent'
ORDER BY created_at DESC
LIMIT 5;
