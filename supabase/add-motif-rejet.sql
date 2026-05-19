-- ============================================
-- AJOUTER LA COLONNE motif_rejet À LA TABLE requests
-- ============================================

-- Vérifier si la colonne existe déjà
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'requests' 
AND column_name = 'motif_rejet';

-- Ajouter la colonne si elle n'existe pas
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS motif_rejet TEXT;

-- Ajouter aussi la date de rejet
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS date_rejet TIMESTAMP;

-- Vérifier
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'requests' 
AND column_name IN ('motif_rejet', 'date_rejet');
