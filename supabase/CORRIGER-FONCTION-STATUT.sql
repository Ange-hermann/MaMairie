-- Corriger la fonction pour accepter validee OU documents_verifies

DROP FUNCTION IF EXISTS generer_acte_naissance(UUID, UUID);

CREATE OR REPLACE FUNCTION generer_acte_naissance(
  p_declaration_id UUID,
  p_agent_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_declaration RECORD;
  v_acte_id UUID;
  v_numero_acte TEXT;
  v_annee INTEGER;
  v_sexe_converti sexe_enum;
BEGIN
  -- 1. Récupérer la déclaration (accepter validee OU documents_verifies)
  SELECT * INTO v_declaration
  FROM declarations_naissance
  WHERE id = p_declaration_id
  AND statut IN ('validee', 'documents_verifies');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Déclaration non trouvée ou pas encore validée';
  END IF;

  -- 2. Générer le numéro d'acte
  v_annee := EXTRACT(YEAR FROM v_declaration.date_naissance);
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(numero_acte FROM '\d+$') AS INTEGER)), 0) + 1
  INTO v_numero_acte
  FROM naissances
  WHERE annee = v_annee
  AND mairie_id = v_declaration.mairie_id;

  v_numero_acte := 'N-' || v_annee || '-' || LPAD(v_numero_acte::TEXT, 4, '0');

  -- 3. Convertir le sexe
  v_sexe_converti := CASE 
    WHEN LOWER(v_declaration.sexe::text) IN ('masculin', 'm', 'male') THEN 'masculin'::sexe_enum
    WHEN LOWER(v_declaration.sexe::text) IN ('feminin', 'féminin', 'f', 'female') THEN 'feminin'::sexe_enum
    ELSE 'masculin'::sexe_enum
  END;

  -- 4. Insérer l'acte
  INSERT INTO naissances (
    numero_acte,
    annee,
    mairie_id,
    nom_enfant,
    prenom_enfant,
    sexe,
    date_naissance,
    lieu_naissance,
    nom_pere,
    prenom_pere,
    nom_mere,
    prenom_mere,
    agent_id
  ) VALUES (
    v_numero_acte,
    v_annee,
    v_declaration.mairie_id,
    v_declaration.nom_enfant,
    v_declaration.prenom_enfant,
    v_sexe_converti,
    v_declaration.date_naissance,
    v_declaration.lieu_naissance,
    v_declaration.nom_pere,
    v_declaration.prenom_pere,
    v_declaration.nom_mere,
    v_declaration.prenom_mere,
    p_agent_id
  )
  RETURNING id INTO v_acte_id;

  -- 5. Mettre à jour la déclaration
  UPDATE declarations_naissance
  SET 
    acte_id = v_acte_id,
    statut = 'remis',
    date_remise = NOW(),
    agent_remise_id = p_agent_id
  WHERE id = p_declaration_id;

  RETURN v_acte_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erreur: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Fonction corrigée !' as resultat;
