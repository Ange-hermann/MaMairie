-- ============================================
-- NETTOYER LES DONNÉES DE TEST
-- Exécutez ce script pour supprimer toutes les vérifications de test
-- ============================================

-- Supprimer toutes les vérifications
DELETE FROM verifications_actes;

-- Vérifier que c'est vide
SELECT 
  'Table nettoyée !' as message,
  COUNT(*) as total_restant 
FROM verifications_actes;

-- Maintenant, utilisez l'interface /ministere/verification
-- pour vérifier de vrais actes et générer de vraies données !
