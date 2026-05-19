-- ========================================
-- Rendre les colonnes optionnelles dans la table requests
-- Car tous les champs ne sont pas nécessaires pour tous les types d'actes
-- ========================================

-- Rendre date_naissance optionnel (pas nécessaire pour mariage)
ALTER TABLE public.requests
ALTER COLUMN date_naissance DROP NOT NULL;

-- Rendre lieu_naissance optionnel (pas nécessaire pour mariage/décès)
ALTER TABLE public.requests
ALTER COLUMN lieu_naissance DROP NOT NULL;

-- Rendre nom_pere optionnel
ALTER TABLE public.requests
ALTER COLUMN nom_pere DROP NOT NULL;

-- Rendre nom_mere optionnel
ALTER TABLE public.requests
ALTER COLUMN nom_mere DROP NOT NULL;

-- Vérifier les contraintes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'requests'
AND column_name IN (
    'date_naissance',
    'lieu_naissance',
    'nom_pere',
    'nom_mere',
    'date_mariage',
    'date_deces'
)
ORDER BY column_name;
