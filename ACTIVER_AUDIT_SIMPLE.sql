-- ============================================
-- ACTIVATION SIMPLE DE L'AUDIT
-- Pour angeherboua@gmail.com
-- ============================================

-- 1. Supprimer les anciennes sessions
DELETE FROM sessions_actives WHERE user_email = 'angeherboua@gmail.com';

-- 2. Créer une session active
INSERT INTO sessions_actives (
  user_id,
  user_email,
  user_role,
  ip_address,
  user_agent,
  started_at,
  last_activity,
  statut
)
SELECT 
  id,
  email,
  role,
  '127.0.0.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
  NOW(),
  NOW(),
  'active'
FROM users
WHERE email = 'angeherboua@gmail.com';

-- 3. Créer un log de connexion
INSERT INTO audit_logs (
  action_type,
  user_id,
  user_email,
  user_role,
  user_nom,
  ip_address,
  user_agent,
  statut,
  message,
  created_at
)
SELECT 
  'AUTH_LOGIN_SUCCESS',
  id,
  email,
  role,
  COALESCE(prenom || ' ' || nom, 'Ange HERBOUA'),
  '127.0.0.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
  'SUCCESS',
  'Connexion réussie - Session créée',
  NOW()
FROM users
WHERE email = 'angeherboua@gmail.com';

-- 4. Créer quelques logs d'actions variées
INSERT INTO audit_logs (
  action_type,
  user_id,
  user_email,
  user_role,
  user_nom,
  ip_address,
  statut,
  message,
  created_at
)
SELECT 
  'AGENT_DEMANDE_APPROUVEE',
  id,
  email,
  role,
  COALESCE(prenom || ' ' || nom, 'Ange HERBOUA'),
  '192.168.1.100',
  'SUCCESS',
  'Déclaration de naissance approuvée',
  NOW() - INTERVAL '30 minutes'
FROM users
WHERE email = 'angeherboua@gmail.com'

UNION ALL

SELECT 
  'AGENT_PDF_GENERE',
  id,
  email,
  role,
  COALESCE(prenom || ' ' || nom, 'Ange HERBOUA'),
  '192.168.1.100',
  'SUCCESS',
  'PDF d''extrait généré',
  NOW() - INTERVAL '15 minutes'
FROM users
WHERE email = 'angeherboua@gmail.com'

UNION ALL

SELECT 
  'AGENT_MENTION_APPROUVEE',
  id,
  email,
  role,
  COALESCE(prenom || ' ' || nom, 'Ange HERBOUA'),
  '192.168.1.100',
  'SUCCESS',
  'Avis de mention approuvé',
  NOW() - INTERVAL '5 minutes'
FROM users
WHERE email = 'angeherboua@gmail.com';

-- 5. Vérifier les résultats
SELECT 
  'Sessions actives' as type,
  COUNT(*) as nombre
FROM sessions_actives
WHERE statut = 'active'

UNION ALL

SELECT 
  'Logs aujourd''hui' as type,
  COUNT(*) as nombre
FROM audit_logs
WHERE created_at >= CURRENT_DATE;

-- 6. Afficher les statistiques finales
SELECT 
  (SELECT COUNT(*) FROM audit_logs WHERE created_at >= CURRENT_DATE) as actions_aujourdhui,
  (SELECT COUNT(*) FROM audit_logs WHERE statut = 'FAILED' AND created_at >= CURRENT_DATE) as tentatives_echouees,
  (SELECT COUNT(*) FROM audit_logs WHERE action_type LIKE 'FRAUDE_%' AND created_at >= NOW() - INTERVAL '24 hours') as alertes_fraude,
  (SELECT COUNT(*) FROM sessions_actives WHERE statut = 'active') as utilisateurs_connectes;

-- 7. Voir les derniers logs créés
SELECT 
  created_at,
  action_type,
  user_nom,
  statut,
  message
FROM audit_logs
ORDER BY created_at DESC
LIMIT 5;
