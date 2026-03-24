-- ============================================
-- SYSTÈME DE NOTIFICATIONS
-- ============================================
-- Table notifications + Triggers automatiques
-- ============================================

-- 1. Créer la table notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'demande_recue', 'statut_change', 'demande_validee', etc.
  titre VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  lue BOOLEAN DEFAULT false,
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  data JSONB, -- Données supplémentaires
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Index pour performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_lue ON public.notifications(lue);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 3. Désactiver RLS (pour simplifier)
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- ============================================
-- FONCTION : Créer une notification
-- ============================================
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR,
  p_titre VARCHAR,
  p_message TEXT,
  p_request_id UUID DEFAULT NULL,
  p_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, titre, message, request_id, data)
  VALUES (p_user_id, p_type, p_titre, p_message, p_request_id, p_data)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER : Nouvelle demande → Notifier les agents
-- ============================================
CREATE OR REPLACE FUNCTION notify_agents_new_request()
RETURNS TRIGGER AS $$
DECLARE
  v_agent RECORD;
  v_citoyen RECORD;
BEGIN
  -- Récupérer les infos du citoyen
  SELECT nom, prenom INTO v_citoyen
  FROM public.users
  WHERE id = NEW.user_id;
  
  -- Notifier tous les agents de la mairie concernée
  FOR v_agent IN 
    SELECT id FROM public.users 
    WHERE role IN ('agent', 'admin') 
    AND mairie_id = NEW.mairie_id
  LOOP
    PERFORM create_notification(
      v_agent.id,
      'demande_recue',
      '📥 Nouvelle demande reçue',
      format('Demande de %s %s pour un %s', 
        v_citoyen.prenom, 
        v_citoyen.nom,
        CASE NEW.type_acte
          WHEN 'naissance' THEN 'extrait de naissance'
          WHEN 'mariage' THEN 'extrait de mariage'
          WHEN 'deces' THEN 'extrait de décès'
          ELSE NEW.type_acte
        END
      ),
      NEW.id,
      jsonb_build_object(
        'type_acte', NEW.type_acte,
        'citoyen_nom', v_citoyen.nom,
        'citoyen_prenom', v_citoyen.prenom
      )
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_notify_agents_new_request ON public.requests;
CREATE TRIGGER trigger_notify_agents_new_request
  AFTER INSERT ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_agents_new_request();

-- ============================================
-- TRIGGER : Changement de statut → Notifier le citoyen
-- ============================================
CREATE OR REPLACE FUNCTION notify_citizen_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_message TEXT;
  v_titre TEXT;
  v_type VARCHAR;
BEGIN
  -- Vérifier si le statut a changé
  IF OLD.statut IS DISTINCT FROM NEW.statut THEN
    
    -- Définir le message selon le nouveau statut
    CASE NEW.statut
      WHEN 'en_traitement' THEN
        v_type := 'statut_change';
        v_titre := '⏳ Demande en cours de traitement';
        v_message := 'Votre demande est en cours de traitement par nos services.';
      
      WHEN 'validee' THEN
        v_type := 'demande_validee';
        v_titre := '✅ Demande validée';
        v_message := 'Votre demande a été validée ! Vous pouvez télécharger votre document.';
      
      WHEN 'prete' THEN
        v_type := 'demande_prete';
        v_titre := '🎉 Document prêt';
        v_message := 'Votre document est prêt ! Vous pouvez le télécharger dès maintenant.';
      
      WHEN 'rejetee' THEN
        v_type := 'demande_rejetee';
        v_titre := '❌ Demande rejetée';
        v_message := format('Votre demande a été rejetée. Raison : %s', 
          COALESCE(NEW.commentaire, 'Non spécifiée'));
      
      ELSE
        v_type := 'statut_change';
        v_titre := '📢 Mise à jour de votre demande';
        v_message := format('Le statut de votre demande a changé : %s', NEW.statut);
    END CASE;
    
    -- Créer la notification pour le citoyen
    PERFORM create_notification(
      NEW.user_id,
      v_type,
      v_titre,
      v_message,
      NEW.id,
      jsonb_build_object(
        'ancien_statut', OLD.statut,
        'nouveau_statut', NEW.statut,
        'type_acte', NEW.type_acte
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_notify_citizen_status_change ON public.requests;
CREATE TRIGGER trigger_notify_citizen_status_change
  AFTER UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_citizen_status_change();

-- ============================================
-- FONCTION : Marquer une notification comme lue
-- ============================================
CREATE OR REPLACE FUNCTION mark_notification_as_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.notifications
  SET lue = true
  WHERE id = p_notification_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FONCTION : Marquer toutes les notifications comme lues
-- ============================================
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.notifications
  SET lue = true
  WHERE user_id = p_user_id AND lue = false;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FONCTION : Supprimer les anciennes notifications
-- ============================================
CREATE OR REPLACE FUNCTION delete_old_notifications(p_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.notifications
  WHERE created_at < NOW() - (p_days || ' days')::INTERVAL
  AND lue = true;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Voir la structure de la table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- Voir les triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table IN ('requests', 'notifications');

-- ============================================
-- DONNÉES DE TEST (Optionnel)
-- ============================================

-- Créer une notification de test
/*
SELECT create_notification(
  (SELECT id FROM public.users WHERE role = 'citoyen' LIMIT 1),
  'test',
  '🔔 Notification de test',
  'Ceci est une notification de test du système.',
  NULL,
  '{"test": true}'::jsonb
);
*/

-- ============================================
-- NOTES
-- ============================================
-- Notifications automatiques :
-- 1. Nouvelle demande → Tous les agents de la mairie sont notifiés
-- 2. Changement de statut → Le citoyen est notifié
-- 
-- Types de notifications :
-- - demande_recue : Agent reçoit une nouvelle demande
-- - statut_change : Changement de statut général
-- - demande_validee : Demande validée
-- - demande_prete : Document prêt
-- - demande_rejetee : Demande rejetée
-- ============================================
