-- ============================================
-- SUPPRIMER LES LOGS DE TEST
-- ============================================

-- 1. Supprimer les 4 logs de test créés manuellement
DELETE FROM audit_logs 
WHERE message IN (
  'Connexion réussie - Session créée',
  'Déclaration de naissance approuvée',
  'PDF d''extrait généré',
  'Avis de mention approuvé'
);

-- 2. Vérifier combien de logs restent
SELECT 
  COUNT(*) as total_logs_restants,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as logs_aujourdhui
FROM audit_logs;

-- 3. Afficher les logs restants (s'il y en a)
SELECT 
  created_at,
  action_type,
  user_nom,
  statut,
  message
FROM audit_logs
ORDER BY created_at DESC
LIMIT 10;

-- 4. Vérifier les statistiques
SELECT 
  (SELECT COUNT(*) FROM audit_logs WHERE created_at >= CURRENT_DATE) as actions_aujourdhui,
  (SELECT COUNT(*) FROM audit_logs WHERE statut = 'FAILED' AND created_at >= CURRENT_DATE) as tentatives_echouees,
  (SELECT COUNT(*) FROM audit_logs WHERE action_type LIKE 'FRAUDE_%' AND created_at >= NOW() - INTERVAL '24 hours') as alertes_fraude,
  (SELECT COUNT(*) FROM sessions_actives WHERE statut = 'active') as utilisateurs_connectes;
