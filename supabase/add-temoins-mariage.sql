-- ========================================
-- AJOUT DES TÉMOINS DANS LES ACTES DE MARIAGE
-- ========================================

-- Ajouter les colonnes pour le Témoin 1
ALTER TABLE public.mariages
ADD COLUMN IF NOT EXISTS temoin1_nom TEXT,
ADD COLUMN IF NOT EXISTS temoin1_prenom TEXT,
ADD COLUMN IF NOT EXISTS temoin1_numero_cni TEXT,
ADD COLUMN IF NOT EXISTS temoin1_nationalite TEXT,
ADD COLUMN IF NOT EXISTS temoin1_profession TEXT,
ADD COLUMN IF NOT EXISTS temoin1_adresse TEXT;

-- Ajouter les colonnes pour le Témoin 2
ALTER TABLE public.mariages
ADD COLUMN IF NOT EXISTS temoin2_nom TEXT,
ADD COLUMN IF NOT EXISTS temoin2_prenom TEXT,
ADD COLUMN IF NOT EXISTS temoin2_numero_cni TEXT,
ADD COLUMN IF NOT EXISTS temoin2_nationalite TEXT,
ADD COLUMN IF NOT EXISTS temoin2_profession TEXT,
ADD COLUMN IF NOT EXISTS temoin2_adresse TEXT;

-- Ajouter des commentaires pour la documentation
COMMENT ON COLUMN public.mariages.temoin1_nom IS 'Nom du premier témoin du mariage';
COMMENT ON COLUMN public.mariages.temoin1_prenom IS 'Prénom du premier témoin du mariage';
COMMENT ON COLUMN public.mariages.temoin1_numero_cni IS 'Numéro de CNI du premier témoin';
COMMENT ON COLUMN public.mariages.temoin1_nationalite IS 'Nationalité du premier témoin';
COMMENT ON COLUMN public.mariages.temoin1_profession IS 'Profession du premier témoin';
COMMENT ON COLUMN public.mariages.temoin1_adresse IS 'Adresse du premier témoin (optionnel)';

COMMENT ON COLUMN public.mariages.temoin2_nom IS 'Nom du deuxième témoin du mariage';
COMMENT ON COLUMN public.mariages.temoin2_prenom IS 'Prénom du deuxième témoin du mariage';
COMMENT ON COLUMN public.mariages.temoin2_numero_cni IS 'Numéro de CNI du deuxième témoin';
COMMENT ON COLUMN public.mariages.temoin2_nationalite IS 'Nationalité du deuxième témoin';
COMMENT ON COLUMN public.mariages.temoin2_profession IS 'Profession du deuxième témoin';
COMMENT ON COLUMN public.mariages.temoin2_adresse IS 'Adresse du deuxième témoin (optionnel)';

-- Créer des index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_mariages_temoin1_cni ON public.mariages(temoin1_numero_cni);
CREATE INDEX IF NOT EXISTS idx_mariages_temoin2_cni ON public.mariages(temoin2_numero_cni);

-- Vérifier que les colonnes ont été ajoutées
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'mariages'
AND column_name LIKE 'temoin%'
ORDER BY column_name;

-- ========================================
-- MISE À JOUR DES ACTES EXISTANTS (OPTIONNEL)
-- ========================================
-- Si vous voulez mettre des valeurs par défaut pour les anciens actes :

-- UPDATE public.mariages
-- SET 
--   temoin1_nationalite = 'Ivoirienne',
--   temoin2_nationalite = 'Ivoirienne'
-- WHERE temoin1_nationalite IS NULL;

-- ========================================
-- VÉRIFICATION FINALE
-- ========================================

-- Compter les actes avec témoins
SELECT 
    COUNT(*) as total_actes,
    COUNT(temoin1_nom) as actes_avec_temoin1,
    COUNT(temoin2_nom) as actes_avec_temoin2
FROM public.mariages;
