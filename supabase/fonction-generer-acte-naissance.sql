-- Fonction pour générer un acte de naissance officiel
-- À partir d'une déclaration validée et documents vérifiés

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
BEGIN
  -- 1. Récupérer la déclaration
  SELECT * INTO v_declaration
  FROM declarations_naissance
  WHERE id = p_declaration_id
  AND documents_verifies = true
  AND statut = 'documents_verifies';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Déclaration non trouvée ou documents non vérifiés';
  END IF;

  -- 2. Générer le numéro d'acte
  v_annee := EXTRACT(YEAR FROM v_declaration.date_naissance);
  
  -- Obtenir le prochain numéro pour cette année et cette mairie
  SELECT COALESCE(MAX(CAST(SUBSTRING(numero_acte FROM '\d+$') AS INTEGER)), 0) + 1
  INTO v_numero_acte
  FROM naissances
  WHERE annee = v_annee
  AND mairie_id = v_declaration.mairie_id;

  -- Format: N-YYYY-NNNN (ex: N-2024-0001)
  v_numero_acte := 'N-' || v_annee || '-' || LPAD(v_numero_acte::TEXT, 4, '0');

  -- 3. Insérer l'acte de naissance dans la table naissances
  -- Utiliser uniquement les colonnes de base qui existent
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
    CASE 
      WHEN LOWER(v_declaration.sexe::text) = 'masculin' THEN 'masculin'::sexe_enum
      WHEN LOWER(v_declaration.sexe::text) = 'feminin' THEN 'feminin'::sexe_enum
      WHEN LOWER(v_declaration.sexe::text) = 'féminin' THEN 'feminin'::sexe_enum
      ELSE 'masculin'::sexe_enum
    END,
    v_declaration.date_naissance,
    v_declaration.lieu_naissance,
    v_declaration.nom_pere,
    v_declaration.prenom_pere,
    v_declaration.nom_mere,
    v_declaration.prenom_mere,
    p_agent_id
  )
  RETURNING id INTO v_acte_id;

  -- 4. Mettre à jour la déclaration avec l'ID de l'acte
  UPDATE declarations_naissance
  SET 
    acte_id = v_acte_id,
    statut = 'remis',
    date_remise = NOW(),
    agent_remise_id = p_agent_id
  WHERE id = p_declaration_id;

  -- 5. Retourner l'ID de l'acte créé
  RETURN v_acte_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erreur lors de la génération de l''acte: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaire
COMMENT ON FUNCTION generer_acte_naissance IS 'Génère un acte de naissance officiel à partir d''une déclaration validée';

-- Test (à décommenter pour tester)
-- SELECT generer_acte_naissance(
--   'uuid-de-la-declaration',
--   'uuid-de-l-agent'
-- );
