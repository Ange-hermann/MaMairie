-- ============================================
-- AJOUTER LES COLONNES PDF À LA TABLE requests
-- ============================================

-- Ajouter les colonnes pour stocker le PDF généré
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS pdf_name TEXT;

-- Vérifier
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'requests' 
AND column_name IN ('pdf_url', 'pdf_name');
