-- ========================================
-- RÉASSIGNER LES AGENTS À LEURS MAIRIES
-- Après avoir recréé les mairies
-- ========================================

-- ÉTAPE 1 : Voir les users sans mairie
SELECT 
  'Agents sans mairie' as info,
  COUNT(*) as nombre
FROM users
WHERE mairie_id IS NULL;

-- ÉTAPE 2 : Réassigner les users en fonction de la ville/nom de mairie
-- Si l'agent avait une mairie avant, on essaie de la retrouver par le nom

-- Exemple : Si un agent était à "Mairie de Cocody", on le réassigne à la nouvelle "Mairie de Cocody"
UPDATE users a
SET mairie_id = m.id
FROM mairies m
WHERE a.mairie_id IS NULL
AND (
  -- Correspondance par ville
  a.ville = m.ville
  OR
  -- Correspondance par nom de mairie (si stocké quelque part)
  a.nom_mairie = m.nom_mairie
);

-- ÉTAPE 3 : Pour les users qui ont une ville mais pas encore de mairie
-- On les assigne à la mairie de leur ville
UPDATE users a
SET mairie_id = (
  SELECT m.id 
  FROM mairies m 
  WHERE m.ville = a.ville 
  LIMIT 1
)
WHERE a.mairie_id IS NULL
AND a.ville IS NOT NULL;

-- ÉTAPE 4 : Vérification
SELECT 
  'Agents avec mairie' as info,
  COUNT(*) as nombre
FROM users
WHERE mairie_id IS NOT NULL;

SELECT 
  'Agents sans mairie' as info,
  COUNT(*) as nombre
FROM users
WHERE mairie_id IS NULL;

-- ÉTAPE 5 : Voir les users par mairie
SELECT 
  m.nom_mairie,
  m.ville,
  COUNT(a.id) as nb_users
FROM mairies m
LEFT JOIN users a ON a.mairie_id = m.id
GROUP BY m.id, m.nom_mairie, m.ville
HAVING COUNT(a.id) > 0
ORDER BY COUNT(a.id) DESC;

-- ÉTAPE 6 : Voir les users non assignés (pour debug)
SELECT 
  id,
  nom,
  prenom,
  email,
  ville,
  role
FROM users
WHERE mairie_id IS NULL
LIMIT 20;
