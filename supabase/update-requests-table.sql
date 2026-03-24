-- Script pour mettre à jour la table requests
-- Ajouter les colonnes manquantes et corriger la structure

-- 1. Ajouter la colonne user_id si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'requests' AND column_name = 'user_id') THEN
        ALTER TABLE public.requests ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Copier citizen_id vers user_id si nécessaire
UPDATE public.requests
SET user_id = citizen_id
WHERE user_id IS NULL AND citizen_id IS NOT NULL;

-- 3. Ajouter la colonne type_acte si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'requests' AND column_name = 'type_acte') THEN
        ALTER TABLE public.requests ADD COLUMN type_acte VARCHAR(50) DEFAULT 'naissance';
    END IF;
END $$;

-- 4. Ajouter la colonne document_url si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'requests' AND column_name = 'document_url') THEN
        ALTER TABLE public.requests ADD COLUMN document_url TEXT;
    END IF;
END $$;

-- 5. Ajouter la colonne document_name si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'requests' AND column_name = 'document_name') THEN
        ALTER TABLE public.requests ADD COLUMN document_name VARCHAR(255);
    END IF;
END $$;

-- 6. Modifier le type de la colonne statut pour accepter plus de valeurs
ALTER TABLE public.requests 
ALTER COLUMN statut TYPE VARCHAR(50);

-- 7. Mettre à jour les valeurs de statut existantes
UPDATE public.requests
SET statut = 'en_attente'
WHERE statut = 'en_cours' OR statut IS NULL;

-- 8. Créer un index sur user_id
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON public.requests(user_id);

-- 9. Vérifier la structure finale
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'requests'
ORDER BY ordinal_position;

-- 10. Afficher un message de succès
SELECT 'Table requests mise à jour avec succès!' AS message;
