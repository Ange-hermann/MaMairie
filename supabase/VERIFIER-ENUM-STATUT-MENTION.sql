-- Vérifier l'enum statut_mention_enum

-- 1. Voir les valeurs de l'enum
SELECT 
  t.typname AS enum_name,
  e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%mention%'
ORDER BY t.typname, e.enumsortorder;

-- 2. Ajouter documents_verifies si manquant
ALTER TYPE statut_mention_enum ADD VALUE IF NOT EXISTS 'documents_verifies';

-- 3. Vérifier à nouveau
SELECT 
  t.typname AS enum_name,
  e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%mention%'
ORDER BY t.typname, e.enumsortorder;
