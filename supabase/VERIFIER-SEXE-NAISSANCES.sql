-- Vérifier les valeurs du champ sexe dans la table naissances
SELECT 
  sexe,
  COUNT(*) as nombre
FROM naissances
GROUP BY sexe
ORDER BY nombre DESC;

-- Voir toutes les naissances avec leur sexe
SELECT 
  id,
  nom_enfant,
  prenom_enfant,
  sexe,
  numero_acte
FROM naissances
ORDER BY created_at DESC;
