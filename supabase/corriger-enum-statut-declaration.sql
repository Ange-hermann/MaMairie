-- Corriger l'enum statut_declaration_enum
-- Ajouter les valeurs manquantes : documents_verifies, remis

-- IMPORTANT : Exécuter ces commandes UNE PAR UNE dans Supabase SQL Editor
-- Ne pas tout sélectionner et exécuter en même temps !

-- 1. Ajouter 'documents_verifies'
ALTER TYPE statut_declaration_enum ADD VALUE IF NOT EXISTS 'documents_verifies';

-- 2. Ajouter 'remis' (exécuter séparément après la première)
ALTER TYPE statut_declaration_enum ADD VALUE IF NOT EXISTS 'remis';

-- 3. Vérification (exécuter après les 2 premières)
SELECT enum_range(NULL::statut_declaration_enum);

-- Le résultat devrait être :
-- {en_attente,en_traitement,validee,rejetee,documents_verifies,remis}
