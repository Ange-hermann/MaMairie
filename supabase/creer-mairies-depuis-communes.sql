-- ========================================
-- CRÉER UNE MAIRIE POUR CHAQUE COMMUNE
-- 201 communes = 201 mairies
-- ========================================

-- ÉTAPE 1 : Supprimer les mairies existantes (optionnel)
-- DELETE FROM mairies;

-- ÉTAPE 2 : Créer une mairie pour chaque commune
-- Version simplifiée avec seulement les colonnes de base
INSERT INTO mairies (
  nom_mairie,
  commune_id,
  ville
)
SELECT 
  'Mairie de ' || c.nom,                    -- nom_mairie
  c.id,                                      -- commune_id
  c.nom                                      -- ville
FROM communes c
WHERE NOT EXISTS (
  SELECT 1 FROM mairies m WHERE m.commune_id = c.id
)
ON CONFLICT (nom_mairie) DO NOTHING;

-- ÉTAPE 3 : Créer des sous-préfectures administratives pour les SP sans commune
-- Version simplifiée
INSERT INTO mairies (
  nom_mairie,
  ville
)
SELECT 
  'Sous-préfecture de ' || sp.nom,           -- nom_mairie
  sp.nom                                     -- ville
FROM sous_prefectures sp
WHERE NOT EXISTS (
  SELECT 1 FROM communes c WHERE c.sous_prefecture_id = sp.id
)
AND NOT EXISTS (
  SELECT 1 FROM mairies m WHERE m.nom_mairie = 'Sous-préfecture de ' || sp.nom
)
ON CONFLICT (nom_mairie) DO NOTHING;

-- ========================================
-- VÉRIFICATION
-- ========================================

SELECT 
  'Total mairies créées' as info,
  COUNT(*) as nombre
FROM mairies;

SELECT 
  'Communes sans mairie' as info,
  COUNT(*) as nombre
FROM communes c
WHERE NOT EXISTS (
  SELECT 1 FROM mairies m WHERE m.commune_id = c.id
);

-- Afficher quelques exemples
SELECT 
  nom_mairie,
  ville
FROM mairies
ORDER BY nom_mairie
LIMIT 20;

-- Par district
SELECT 
  dis.nom as district,
  COUNT(m.id) as nb_mairies
FROM mairies m
LEFT JOIN communes c ON m.commune_id = c.id
LEFT JOIN sous_prefectures sp ON COALESCE(c.sous_prefecture_id, m.sous_prefecture_id) = sp.id
LEFT JOIN departements d ON sp.departement_id = d.id
LEFT JOIN regions r ON d.region_id = r.id
LEFT JOIN districts dis ON r.district_id = dis.id
GROUP BY dis.nom
ORDER BY dis.nom;
