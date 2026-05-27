-- ============================================
-- SCRIPT DE VÉRIFICATION ET CORRECTION DE L'AUDIT
-- ============================================

-- 1. Vérifier si les tables existent
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as nb_colonnes
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('audit_logs', 'sessions_actives', 'ip_bloquees')
ORDER BY table_name;

-- 2. Compter les logs existants
SELECT 
  COUNT(*) as total_logs,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as logs_aujourdhui,
  COUNT(*) FILTER (WHERE statut = 'FAILED') as logs_failed,
  COUNT(*) FILTER (WHERE action_type LIKE 'FRAUDE_%') as logs_fraude,
  COUNT(*) FILTER (WHERE action_type LIKE 'AUTH_%') as logs_auth
FROM audit_logs;

-- 3. Voir les derniers logs
SELECT 
  created_at,
  action_type,
  user_nom,
  user_email,
  user_role,
  statut,
  message,
  ip_address
FROM audit_logs
ORDER BY created_at DESC
LIMIT 10;

-- 4. Vérifier les sessions actives
SELECT 
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE statut = 'active') as sessions_actives,
  COUNT(*) FILTER (WHERE statut = 'expired') as sessions_expirees
FROM sessions_actives;

-- 5. Voir les sessions actives
SELECT 
  user_email,
  user_role,
  started_at,
  last_activity,
  statut
FROM sessions_actives
ORDER BY last_activity DESC
LIMIT 10;

-- 6. CORRECTION : Créer une session active manuellement pour l'utilisateur connecté
-- Remplacez 'votre-email@example.com' par votre email

-- D'abord, supprimer l'ancienne session si elle existe
DELETE FROM sessions_actives
WHERE user_email = 'angeherboua@gmail.com';

-- Ensuite, créer la nouvelle session
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
  'Manual Entry',
  NOW(),
  NOW(),
  'active'
FROM users
WHERE email = 'angeherboua@gmail.com';

-- 7. CORRECTION : Créer un log de test
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
  'AUTH_LOGIN_SUCCESS',
  id,
  email,
  role,
  COALESCE(prenom || ' ' || nom, 'Utilisateur Test'),
  '127.0.0.1',
  'SUCCESS',
  'Test de connexion - Session créée manuellement',
  NOW()
FROM users
WHERE email = 'angeherboua@gmail.com'
LIMIT 1;

-- 8. Vérifier le résultat
SELECT 
  'Logs aujourd''hui' as type,
  COUNT(*) as nombre
FROM audit_logs
WHERE created_at >= CURRENT_DATE

UNION ALL

SELECT 
  'Sessions actives' as type,
  COUNT(*) as nombre
FROM sessions_actives
WHERE statut = 'active';

-- 9. Voir les statistiques finales
SELECT 
  (SELECT COUNT(*) FROM audit_logs WHERE created_at >= CURRENT_DATE) as actions_aujourdhui,
  (SELECT COUNT(*) FROM audit_logs WHERE statut = 'FAILED' AND created_at >= CURRENT_DATE) as tentatives_echouees,
  (SELECT COUNT(*) FROM audit_logs WHERE action_type LIKE 'FRAUDE_%' AND created_at >= NOW() - INTERVAL '24 hours') as alertes_fraude,
  (SELECT COUNT(*) FROM sessions_actives WHERE statut = 'active') as utilisateurs_connectes;
