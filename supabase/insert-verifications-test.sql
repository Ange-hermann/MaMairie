-- ============================================
-- INSÉRER DES VÉRIFICATIONS DE TEST
-- Pour afficher les stats et l'historique
-- ============================================

-- Récupérer l'ID d'un utilisateur ministère et d'une mairie
DO $$
DECLARE
  v_user_id UUID;
  v_mairie_id UUID;
BEGIN
  -- Trouver un utilisateur ministère
  SELECT id INTO v_user_id FROM users WHERE role = 'ministere' LIMIT 1;
  
  -- Trouver une mairie
  SELECT id INTO v_mairie_id FROM mairies LIMIT 1;
  
  -- Si pas d'utilisateur ministère, utiliser le premier user
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM users LIMIT 1;
  END IF;

  -- Insérer des vérifications de test (colonnes minimales)
  INSERT INTO verifications_actes (
    numero_acte,
    type_acte,
    mairie_id,
    statut_verification,
    nombre_verifications,
    derniere_verification
  ) VALUES
  -- Actes valides
  ('1234567890', 'naissance', v_mairie_id, 'valide', 3, NOW() - INTERVAL '2 days'),
  ('1234567', 'naissance', v_mairie_id, 'valide', 2, NOW() - INTERVAL '1 day'),
  ('2353783', 'naissance', v_mairie_id, 'valide', 1, NOW()),
  
  -- Actes suspects
  ('2323245', 'naissance', v_mairie_id, 'suspect', 2, NOW() - INTERVAL '3 hours'),
  ('9999999', 'naissance', v_mairie_id, 'suspect', 1, NOW() - INTERVAL '5 hours'),
  
  -- Actes invalides
  ('0000000', 'naissance', v_mairie_id, 'invalide', 1, NOW() - INTERVAL '1 day'),
  ('1111111', 'naissance', v_mairie_id, 'invalide', 2, NOW() - INTERVAL '2 days');

  RAISE NOTICE 'Vérifications de test insérées avec succès !';
END $$;

-- Vérifier les résultats
SELECT 
  statut_verification,
  COUNT(*) as total
FROM verifications_actes
GROUP BY statut_verification;

-- Afficher l'historique
SELECT 
  numero_acte,
  type_acte,
  statut_verification,
  nombre_verifications,
  derniere_verification
FROM verifications_actes
ORDER BY derniere_verification DESC
LIMIT 10;
