# 🎯 GUIDE COMPLET FINAL - GÉNÉRATION ACTE DE NAISSANCE

## ⚠️ **IMPORTANT : SUIVEZ CES ÉTAPES DANS L'ORDRE**

---

## 📋 **ÉTAPE 1 : CORRIGER L'ENUM STATUT**

### **Fichier 1 : `1-ajouter-documents-verifies.sql`**
```sql
ALTER TYPE statut_declaration_enum ADD VALUE IF NOT EXISTS 'documents_verifies';
```
**→ Exécuter dans Supabase SQL Editor**
**→ Attendre le succès ✅**

### **Fichier 2 : `2-ajouter-remis.sql`**
```sql
ALTER TYPE statut_declaration_enum ADD VALUE IF NOT EXISTS 'remis';
```
**→ Exécuter dans Supabase SQL Editor**
**→ Attendre le succès ✅**

### **Fichier 3 : `3-verifier-enum.sql`**
```sql
SELECT enum_range(NULL::statut_declaration_enum);
```
**→ Exécuter dans Supabase SQL Editor**
**→ Vérifier le résultat : `{en_attente,en_traitement,validee,rejetee,documents_verifies,remis}` ✅**

---

## 📋 **ÉTAPE 2 : CRÉER/METTRE À JOUR LA FONCTION**

### **Fichier : `fonction-generer-acte-naissance.sql`**

**Copiez TOUT le contenu du fichier et exécutez-le dans Supabase SQL Editor**

**Contenu complet :**

```sql
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
```

**→ Exécuter dans Supabase SQL Editor**
**→ Attendre le message : "Success. No rows returned" ✅**

---

## 📋 **ÉTAPE 3 : VÉRIFIER QUE TOUT EST OK**

### **Test 1 : Vérifier l'enum**
```sql
SELECT enum_range(NULL::statut_declaration_enum);
```
**Résultat attendu :** `{en_attente,en_traitement,validee,rejetee,documents_verifies,remis}`

### **Test 2 : Vérifier la fonction**
```sql
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'generer_acte_naissance';
```
**Résultat attendu :** 1 ligne avec le nom de la fonction

---

## 📋 **ÉTAPE 4 : TESTER DANS L'APPLICATION**

### **1. Rechargez la page**
```
Ctrl + F5 (Windows)
Cmd + Shift + R (Mac)
```

### **2. Testez le workflow**
```
1. Allez sur /agent/declarations
2. Cliquez sur "Traitement"
3. Cherchez une déclaration avec statut "Documents vérifiés"
4. Cliquez "Générer l'Acte + PDF"
5. ✅ Devrait fonctionner !
```

---

## ⚠️ **SI ÇA NE MARCHE TOUJOURS PAS**

### **Vérifiez les colonnes de la table naissances**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'naissances'
ORDER BY ordinal_position;
```

### **Si la colonne `sexe` n'existe pas, créez-la**
```sql
ALTER TABLE naissances 
ADD COLUMN IF NOT EXISTS sexe sexe_enum;
```

### **Si l'enum `sexe_enum` n'existe pas, créez-le**
```sql
CREATE TYPE sexe_enum AS ENUM ('masculin', 'feminin');
```

---

## 📊 **CHECKLIST FINALE**

- [ ] Étape 1 : Enum statut corrigé ✅
  - [ ] documents_verifies ajouté
  - [ ] remis ajouté
  - [ ] Vérification OK

- [ ] Étape 2 : Fonction créée ✅
  - [ ] Fonction exécutée sans erreur
  - [ ] Message "Success" reçu

- [ ] Étape 3 : Tests SQL OK ✅
  - [ ] Enum vérifié
  - [ ] Fonction existe

- [ ] Étape 4 : Test application ✅
  - [ ] Page rechargée
  - [ ] Génération testée
  - [ ] PDF téléchargé

---

## 🎉 **RÉSULTAT FINAL**

**Après toutes ces étapes :**
- ✅ Enum statut complet
- ✅ Fonction de génération fonctionnelle
- ✅ Conversion sexe automatique
- ✅ Colonnes simplifiées
- ✅ PDF généré et téléchargé
- ✅ Acte enregistré dans état civil

---

## 📄 **FICHIERS À EXÉCUTER DANS L'ORDRE**

1. `1-ajouter-documents-verifies.sql`
2. `2-ajouter-remis.sql`
3. `3-verifier-enum.sql`
4. `fonction-generer-acte-naissance.sql`

---

**🚀 SUIVEZ CES ÉTAPES UNE PAR UNE ET TOUT FONCTIONNERA ! ✅**
