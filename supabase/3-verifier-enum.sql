-- FICHIER 3 : Vérifier les valeurs
-- Exécuter ce fichier EN TROISIÈME (après les fichiers 1 et 2)

SELECT enum_range(NULL::statut_declaration_enum);

-- Le résultat devrait être :
-- {en_attente,en_traitement,validee,rejetee,documents_verifies,remis}
