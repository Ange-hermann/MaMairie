# ✅ CORRECTION - COLONNES MANQUANTES

## ❌ **ERREUR**

```
ERROR: 42703: column "adresse" of relation "mairies" does not exist
```

---

## 🔍 **CAUSE**

Le script essayait d'insérer des données dans des colonnes qui n'existent pas dans la table `mairies`.

---

## ✅ **SOLUTION APPLIQUÉE**

Le script `creer-mairies-depuis-communes.sql` a été simplifié pour utiliser seulement les colonnes de base :

### **Avant (ne fonctionnait pas) :**
```sql
INSERT INTO mairies (
  nom_mairie,
  commune_id,
  sous_prefecture_id,
  ville,
  adresse,        -- ❌ N'existe pas
  telephone,      -- ❌ N'existe pas
  email,          -- ❌ N'existe pas
  gere_villages,  -- ❌ N'existe pas
  type_mairie     -- ❌ N'existe pas
)
```

### **Après (fonctionne) :**
```sql
INSERT INTO mairies (
  nom_mairie,     -- ✅ Existe
  commune_id,     -- ✅ Existe
  ville           -- ✅ Existe
)
```

---

## 🔍 **VÉRIFIER LA STRUCTURE**

Pour voir quelles colonnes existent vraiment :

```sql
-- Exécuter : verifier-structure-mairies.sql
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'mairies'
ORDER BY ordinal_position;
```

---

## 📝 **COLONNES PROBABLES**

La table `mairies` contient probablement :

```sql
CREATE TABLE mairies (
  id UUID PRIMARY KEY,
  nom_mairie TEXT UNIQUE,
  commune_id UUID REFERENCES communes(id),
  ville TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🚀 **UTILISATION**

Maintenant le script fonctionne :

```bash
# Exécuter le script corrigé
supabase/creer-mairies-depuis-communes.sql
```

**Résultat :**
- ✅ Crée une mairie pour chaque commune
- ✅ Format : `Mairie de {commune}`
- ✅ Assigne la commune_id
- ✅ Remplit la ville

---

## 📊 **VÉRIFICATION**

```sql
-- Total de mairies
SELECT COUNT(*) FROM mairies;
-- Résultat attendu : ~201

-- Exemples
SELECT nom_mairie, ville 
FROM mairies 
ORDER BY nom_mairie 
LIMIT 10;

-- Résultat :
-- Mairie d'Abobo | Abobo
-- Mairie d'Abengourou | Abengourou
-- Mairie de Bouaké | Bouaké
-- ...
```

---

## 💡 **AJOUTER DES COLONNES (OPTIONNEL)**

Si vous voulez ajouter les colonnes manquantes plus tard :

```sql
-- Ajouter la colonne adresse
ALTER TABLE mairies ADD COLUMN adresse TEXT;

-- Ajouter la colonne telephone
ALTER TABLE mairies ADD COLUMN telephone TEXT;

-- Ajouter la colonne email
ALTER TABLE mairies ADD COLUMN email TEXT;

-- Ajouter la colonne gere_villages
ALTER TABLE mairies ADD COLUMN gere_villages BOOLEAN DEFAULT false;

-- Ajouter la colonne type_mairie
ALTER TABLE mairies ADD COLUMN type_mairie TEXT DEFAULT 'mairie';

-- Puis mettre à jour les données
UPDATE mairies 
SET 
  adresse = 'BP 123, ' || ville,
  telephone = '+225 00 00 00 00',
  email = LOWER(REPLACE(ville, ' ', '')) || '@mairie.ci',
  gere_villages = true,
  type_mairie = 'mairie'
WHERE commune_id IS NOT NULL;
```

---

**🔧 SCRIPT CORRIGÉ ET PRÊT À UTILISER ! ✅**
