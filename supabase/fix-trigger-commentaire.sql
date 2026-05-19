-- ============================================
-- CORRIGER LE TRIGGER QUI CHERCHE 'commentaire'
-- ============================================

-- 1. Désactiver le trigger problématique
ALTER TABLE requests DISABLE TRIGGER IF EXISTS trigger_notify_agents_new_request;

-- 2. Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS trigger_notify_agents_new_request ON requests;

-- 3. Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS notify_agents_new_request();

-- 4. Recréer la fonction SANS référence à 'commentaire'
CREATE OR REPLACE FUNCTION notify_agents_new_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Notifier les agents de la nouvelle demande
  -- (sans utiliser le champ commentaire qui n'existe pas)
  
  INSERT INTO notifications (user_id, titre, message, type, lue)
  SELECT 
    u.id,
    'Nouvelle demande',
    'Une nouvelle demande d''extrait de ' || NEW.type_acte || ' a été soumise.',
    'nouvelle_demande',
    false
  FROM users u
  WHERE u.mairie_id = NEW.mairie_id 
  AND u.role = 'agent';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Recréer le trigger
CREATE TRIGGER trigger_notify_agents_new_request
AFTER INSERT ON requests
FOR EACH ROW
EXECUTE FUNCTION notify_agents_new_request();

-- Vérification
SELECT 'Trigger corrigé avec succès !' AS status;
