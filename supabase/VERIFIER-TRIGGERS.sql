-- Vérifier s'il y a des triggers sur avis_mentions

SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'avis_mentions';

-- Vérifier les fonctions liées
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_name LIKE '%avis%mention%'
OR routine_name LIKE '%approuv%';
