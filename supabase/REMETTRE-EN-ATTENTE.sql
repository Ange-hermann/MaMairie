-- Remettre l'avis en statut en_attente

UPDATE avis_mentions 
SET statut = 'en_attente',
    agent_id = NULL,
    date_traitement = NULL
WHERE code_suivi = 'MEN-2026-BIN-00001';

-- Vérifier
SELECT 
  code_suivi,
  statut,
  agent_id,
  date_traitement
FROM avis_mentions
WHERE code_suivi = 'MEN-2026-BIN-00001';
