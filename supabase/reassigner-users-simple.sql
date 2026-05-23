-- ========================================
-- RÉASSIGNER LES UTILISATEURS - VERSION SIMPLE
-- Sans dépendre de la colonne ville
-- ========================================

-- ÉTAPE 1 : Voir les utilisateurs sans mairie
SELECT 
  'Utilisateurs sans mairie' as info,
  COUNT(*) as nombre
FROM users
WHERE mairie_id IS NULL;

-- ÉTAPE 2 : Voir tous les utilisateurs
SELECT 
  id,
  nom,
  prenom,
  email,
  role,
  mairie_id
FROM users
LIMIT 20;

-- ÉTAPE 3 : Si vous connaissez les emails ou noms, réassignez manuellement
-- Exemple : Assigner tous les utilisateurs de Cocody

-- UPDATE users 
-- SET mairie_id = (SELECT id FROM mairies WHERE nom_mairie = 'Mairie de Cocody')
-- WHERE email LIKE '%cocody%' OR email LIKE '%@cocody.%';

-- UPDATE users 
-- SET mairie_id = (SELECT id FROM mairies WHERE nom_mairie = 'Mairie d''Abobo')
-- WHERE email LIKE '%abobo%' OR email LIKE '%@abobo.%';

-- ÉTAPE 4 : Ou assigner tous à une mairie par défaut
-- UPDATE users 
-- SET mairie_id = (SELECT id FROM mairies WHERE nom_mairie = 'Mairie de Cocody' LIMIT 1)
-- WHERE mairie_id IS NULL AND role = 'agent';

-- ÉTAPE 5 : Vérification
SELECT 
  'Utilisateurs avec mairie' as info,
  COUNT(*) as nombre
FROM users
WHERE mairie_id IS NOT NULL;

SELECT 
  'Utilisateurs sans mairie' as info,
  COUNT(*) as nombre
FROM users
WHERE mairie_id IS NULL;

-- ÉTAPE 6 : Voir les utilisateurs par mairie
SELECT 
  m.nom_mairie,
  m.ville,
  COUNT(u.id) as nb_users
FROM mairies m
LEFT JOIN users u ON u.mairie_id = m.id
GROUP BY m.id, m.nom_mairie, m.ville
HAVING COUNT(u.id) > 0
ORDER BY COUNT(u.id) DESC;

-- ÉTAPE 7 : Voir les colonnes disponibles dans users
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
