-- Vérifier les colonnes de la table mairies
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'mairies'
ORDER BY ordinal_position;

-- Alternative : Voir la structure complète
\d public.mairies
