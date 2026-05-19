-- ========================================
-- Ajouter la colonne numero_acte à la table requests
-- ========================================

-- Ajouter la colonne numero_acte (optionnel pour l'instant)
ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS numero_acte VARCHAR(50);

-- Créer un index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_requests_numero_acte 
ON public.requests(numero_acte);

-- Ajouter un commentaire
COMMENT ON COLUMN public.requests.numero_acte IS 'Numéro d''acte de l''ancien document (si disponible)';

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'requests'
AND column_name = 'numero_acte';
