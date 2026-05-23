-- Supprimer la contrainte qui bloque
ALTER TABLE naissances DROP CONSTRAINT IF EXISTS naissances_sexe_check;

-- Vérifier
SELECT 'Contrainte supprimée !' as resultat;
