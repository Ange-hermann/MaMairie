-- ========================================
-- Ajouter les colonnes pour mariage et décès dans la table requests
-- ========================================

-- Colonnes pour les mariages
ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS date_mariage DATE;

ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS lieu_mariage VARCHAR(255);

ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS nom_conjoint VARCHAR(255);

ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS prenom_conjoint VARCHAR(255);

-- Colonnes pour les décès
ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS date_deces DATE;

ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS lieu_deces VARCHAR(255);

ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS cause_deces TEXT;

-- Ajouter des commentaires
COMMENT ON COLUMN public.requests.date_mariage IS 'Date du mariage (pour les demandes d''extrait de mariage)';
COMMENT ON COLUMN public.requests.lieu_mariage IS 'Lieu du mariage';
COMMENT ON COLUMN public.requests.nom_conjoint IS 'Nom du conjoint';
COMMENT ON COLUMN public.requests.prenom_conjoint IS 'Prénom du conjoint';
COMMENT ON COLUMN public.requests.date_deces IS 'Date du décès (pour les demandes d''extrait de décès)';
COMMENT ON COLUMN public.requests.lieu_deces IS 'Lieu du décès';
COMMENT ON COLUMN public.requests.cause_deces IS 'Cause du décès (optionnel)';

-- Vérifier que toutes les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'requests'
AND column_name IN (
  'date_mariage', 
  'lieu_mariage', 
  'nom_conjoint', 
  'prenom_conjoint',
  'date_deces',
  'lieu_deces',
  'cause_deces'
)
ORDER BY column_name;
