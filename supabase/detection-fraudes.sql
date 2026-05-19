-- ============================================
-- DÉTECTION AUTOMATIQUE DE FRAUDES
-- ============================================

-- 1. FONCTION : Détecter les doublons de naissances
CREATE OR REPLACE FUNCTION detect_doublons_naissances()
RETURNS void AS $$
BEGIN
  -- Détecter les naissances en double (même nom, prénom, date, lieu)
  INSERT INTO alertes_ministere (
    type,
    severite,
    titre,
    description,
    mairie_id,
    statut,
    date_detection
  )
  SELECT DISTINCT
    'doublon',
    'critique',
    'Doublon de naissance détecté',
    'Naissance en double : ' || n1.nom_enfant || ' ' || n1.prenom_enfant || 
    ' né(e) le ' || n1.date_naissance::text || 
    ' (Actes N° ' || n1.numero_acte || ' et ' || n2.numero_acte || ')',
    n1.mairie_id,
    'nouvelle',
    NOW()
  FROM naissances n1
  INNER JOIN naissances n2 ON 
    n1.nom_enfant = n2.nom_enfant AND
    n1.prenom_enfant = n2.prenom_enfant AND
    n1.date_naissance = n2.date_naissance AND
    n1.lieu_naissance = n2.lieu_naissance AND
    n1.id < n2.id -- Éviter les doublons d'alertes
  WHERE NOT EXISTS (
    -- Ne pas créer d'alerte si elle existe déjà
    SELECT 1 FROM alertes_ministere
    WHERE type = 'doublon'
    AND description LIKE '%' || n1.numero_acte || '%'
    AND description LIKE '%' || n2.numero_acte || '%'
  );
END;
$$ LANGUAGE plpgsql;

-- 2. FONCTION : Détecter les doublons de mariages
CREATE OR REPLACE FUNCTION detect_doublons_mariages()
RETURNS void AS $$
BEGIN
  INSERT INTO alertes_ministere (
    type,
    severite,
    titre,
    description,
    mairie_id,
    statut,
    date_detection
  )
  SELECT DISTINCT
    'doublon',
    'critique',
    'Doublon de mariage détecté',
    'Mariage en double : ' || m1.nom_epoux || ' & ' || m1.nom_epouse || 
    ' le ' || m1.date_mariage::text ||
    ' (Actes N° ' || m1.numero_acte || ' et ' || m2.numero_acte || ')',
    m1.mairie_id,
    'nouvelle',
    NOW()
  FROM mariages m1
  INNER JOIN mariages m2 ON 
    m1.nom_epoux = m2.nom_epoux AND
    m1.nom_epouse = m2.nom_epouse AND
    m1.date_mariage = m2.date_mariage AND
    m1.id < m2.id
  WHERE NOT EXISTS (
    SELECT 1 FROM alertes_ministere
    WHERE type = 'doublon'
    AND description LIKE '%' || m1.numero_acte || '%'
    AND description LIKE '%' || m2.numero_acte || '%'
  );
END;
$$ LANGUAGE plpgsql;

-- 3. FONCTION : Détecter les dates incohérentes
CREATE OR REPLACE FUNCTION detect_dates_incoherentes()
RETURNS void AS $$
BEGIN
  -- Naissances dans le futur
  INSERT INTO alertes_ministere (
    type,
    severite,
    titre,
    description,
    mairie_id,
    statut,
    date_detection
  )
  SELECT
    'date_incoherente',
    'critique',
    'Date de naissance dans le futur',
    'Acte N° ' || numero_acte || ' : ' || nom_enfant || ' ' || prenom_enfant || 
    ' avec date de naissance ' || date_naissance::text,
    mairie_id,
    'nouvelle',
    NOW()
  FROM naissances
  WHERE date_naissance > CURRENT_DATE
  AND NOT EXISTS (
    SELECT 1 FROM alertes_ministere
    WHERE type = 'date_incoherente'
    AND description LIKE '%' || numero_acte || '%'
  );

  -- Personnes de plus de 120 ans
  INSERT INTO alertes_ministere (
    type,
    severite,
    titre,
    description,
    mairie_id,
    statut,
    date_detection
  )
  SELECT
    'date_incoherente',
    'moyenne',
    'Âge supérieur à 120 ans',
    'Acte N° ' || numero_acte || ' : ' || nom_enfant || ' ' || prenom_enfant || 
    ' né(e) le ' || date_naissance::text || ' (âge > 120 ans)',
    mairie_id,
    'nouvelle',
    NOW()
  FROM naissances
  WHERE date_naissance < (CURRENT_DATE - INTERVAL '120 years')
  AND NOT EXISTS (
    SELECT 1 FROM alertes_ministere
    WHERE type = 'date_incoherente'
    AND description LIKE '%' || numero_acte || '%'
  );
END;
$$ LANGUAGE plpgsql;

-- 4. FONCTION : Détecter les numéros d'acte suspects
CREATE OR REPLACE FUNCTION detect_numeros_suspects()
RETURNS void AS $$
BEGIN
  -- Numéros d'acte en double
  INSERT INTO alertes_ministere (
    type,
    severite,
    titre,
    description,
    mairie_id,
    statut,
    date_detection
  )
  SELECT DISTINCT
    'numero_suspect',
    'critique',
    'Numéro d''acte en double',
    'Le numéro ' || n1.numero_acte || ' est utilisé plusieurs fois (IDs: ' || 
    n1.id::text || ', ' || n2.id::text || ')',
    n1.mairie_id,
    'nouvelle',
    NOW()
  FROM naissances n1
  INNER JOIN naissances n2 ON 
    n1.numero_acte = n2.numero_acte AND
    n1.id < n2.id
  WHERE NOT EXISTS (
    SELECT 1 FROM alertes_ministere
    WHERE type = 'numero_suspect'
    AND description LIKE '%' || n1.numero_acte || '%'
  );
END;
$$ LANGUAGE plpgsql;

-- 5. FONCTION : Détecter les volumes anormaux
CREATE OR REPLACE FUNCTION detect_volumes_anormaux()
RETURNS void AS $$
DECLARE
  avg_naissances NUMERIC;
  mairie RECORD;
BEGIN
  -- Calculer la moyenne nationale de naissances par mairie par mois
  SELECT AVG(count) INTO avg_naissances
  FROM (
    SELECT COUNT(*) as count
    FROM naissances
    WHERE created_at >= (CURRENT_DATE - INTERVAL '30 days')
    GROUP BY mairie_id
  ) subquery;

  -- Détecter les mairies avec un volume anormal (> 3x la moyenne)
  FOR mairie IN
    SELECT 
      n.mairie_id,
      m.nom_mairie,
      COUNT(*) as count
    FROM naissances n
    JOIN mairies m ON m.id = n.mairie_id
    WHERE n.created_at >= (CURRENT_DATE - INTERVAL '30 days')
    GROUP BY n.mairie_id, m.nom_mairie
    HAVING COUNT(*) > (avg_naissances * 3)
  LOOP
    INSERT INTO alertes_ministere (
      type,
      severite,
      titre,
      description,
      mairie_id,
      statut,
      date_detection
    )
    SELECT
      'volume_anormal',
      'moyenne',
      'Volume anormal de naissances',
      'La mairie ' || mairie.nom_mairie || ' a enregistré ' || mairie.count || 
      ' naissances ce mois (moyenne nationale: ' || ROUND(avg_naissances, 0) || ')',
      mairie.mairie_id,
      'nouvelle',
      NOW()
    WHERE NOT EXISTS (
      SELECT 1 FROM alertes_ministere
      WHERE type = 'volume_anormal'
      AND mairie_id = mairie.mairie_id
      AND date_detection >= (CURRENT_DATE - INTERVAL '30 days')
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 6. FONCTION PRINCIPALE : Exécuter toutes les détections
CREATE OR REPLACE FUNCTION executer_detection_fraudes()
RETURNS void AS $$
BEGIN
  PERFORM detect_doublons_naissances();
  PERFORM detect_doublons_mariages();
  PERFORM detect_dates_incoherentes();
  PERFORM detect_numeros_suspects();
  PERFORM detect_volumes_anormaux();
END;
$$ LANGUAGE plpgsql;

-- 7. TRIGGER : Exécuter la détection après chaque insertion
CREATE OR REPLACE FUNCTION trigger_detection_fraudes()
RETURNS TRIGGER AS $$
BEGIN
  -- Exécuter la détection de manière asynchrone (ne pas bloquer l'insertion)
  PERFORM executer_detection_fraudes();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers sur les tables
DROP TRIGGER IF EXISTS after_insert_naissance_detection ON naissances;
CREATE TRIGGER after_insert_naissance_detection
  AFTER INSERT ON naissances
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_detection_fraudes();

DROP TRIGGER IF EXISTS after_insert_mariage_detection ON mariages;
CREATE TRIGGER after_insert_mariage_detection
  AFTER INSERT ON mariages
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_detection_fraudes();

-- 8. FONCTION MANUELLE : Lancer la détection manuellement
COMMENT ON FUNCTION executer_detection_fraudes() IS 
'Exécuter manuellement : SELECT executer_detection_fraudes();';

-- ============================================
-- STATISTIQUES DE FRAUDES
-- ============================================

CREATE OR REPLACE FUNCTION get_stats_fraudes()
RETURNS TABLE (
  total_alertes BIGINT,
  alertes_critiques BIGINT,
  alertes_moyennes BIGINT,
  alertes_faibles BIGINT,
  doublons BIGINT,
  dates_incoherentes BIGINT,
  numeros_suspects BIGINT,
  volumes_anormaux BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_alertes,
    COUNT(*) FILTER (WHERE severite = 'critique')::BIGINT as alertes_critiques,
    COUNT(*) FILTER (WHERE severite = 'moyenne')::BIGINT as alertes_moyennes,
    COUNT(*) FILTER (WHERE severite = 'faible')::BIGINT as alertes_faibles,
    COUNT(*) FILTER (WHERE type = 'doublon')::BIGINT as doublons,
    COUNT(*) FILTER (WHERE type = 'date_incoherente')::BIGINT as dates_incoherentes,
    COUNT(*) FILTER (WHERE type = 'numero_suspect')::BIGINT as numeros_suspects,
    COUNT(*) FILTER (WHERE type = 'volume_anormal')::BIGINT as volumes_anormaux
  FROM alertes_ministere
  WHERE statut = 'nouvelle';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- UTILISATION
-- ============================================

-- Exécuter la détection manuellement :
-- SELECT executer_detection_fraudes();

-- Voir les statistiques :
-- SELECT * FROM get_stats_fraudes();

-- Voir les alertes récentes :
-- SELECT * FROM alertes_ministere WHERE statut = 'nouvelle' ORDER BY date_detection DESC LIMIT 10;
