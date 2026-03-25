-- Script pour supprimer le compte "Comptant" (Agent de test)

-- Étape 1 : Trouver l'ID du compte
DO $$
DECLARE
    user_id_to_delete UUID;
BEGIN
    -- Récupérer l'ID de l'utilisateur "Comptant"
    SELECT id INTO user_id_to_delete
    FROM users
    WHERE nom = 'Comptant' AND role = 'agent'
    LIMIT 1;

    IF user_id_to_delete IS NOT NULL THEN
        -- Supprimer les notifications
        DELETE FROM notifications WHERE user_id = user_id_to_delete;
        
        -- Supprimer les demandes (si c'était un citoyen)
        DELETE FROM requests WHERE user_id = user_id_to_delete;
        
        -- Supprimer de la table users
        DELETE FROM users WHERE id = user_id_to_delete;
        
        -- Supprimer de auth.users
        DELETE FROM auth.users WHERE id = user_id_to_delete;
        
        RAISE NOTICE 'Compte Comptant supprimé avec succès : %', user_id_to_delete;
    ELSE
        RAISE NOTICE 'Aucun compte Comptant trouvé';
    END IF;
END $$;
