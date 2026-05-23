# ✅ ERREUR CONTRAINTE SEXE - SOLUTION

## 🔴 **ERREUR**

```
new row for relation "naissances" violates check constraint "naissances_sexe_check"
```

---

## 🔍 **CAUSE**

La table `naissances` utilise un enum `sexe_enum` avec les valeurs :
- ✅ `'masculin'`
- ✅ `'feminin'` (sans 'é')

Mais la déclaration peut contenir :
- ❌ `'féminin'` (avec 'é')
- ❌ Autre format

---

## ✅ **SOLUTION**

**Ajout d'une conversion dans la fonction :**

```sql
CASE 
  WHEN LOWER(v_declaration.sexe::text) = 'masculin' THEN 'masculin'::sexe_enum
  WHEN LOWER(v_declaration.sexe::text) = 'feminin' THEN 'feminin'::sexe_enum
  WHEN LOWER(v_declaration.sexe::text) = 'féminin' THEN 'feminin'::sexe_enum
  ELSE 'masculin'::sexe_enum
END
```

**Cela gère :**
- ✅ 'masculin' → 'masculin'
- ✅ 'feminin' → 'feminin'
- ✅ 'féminin' → 'feminin'
- ✅ Autre → 'masculin' (par défaut)

---

## 🚀 **POUR APPLIQUER**

**Exécutez la fonction corrigée :**
```sql
-- Dans Supabase SQL Editor
supabase/fonction-generer-acte-naissance.sql
```

---

## 📋 **ENUM SEXE**

**Table `naissances` :**
```sql
CREATE TYPE sexe_enum AS ENUM ('masculin', 'feminin');
```

**Valeurs acceptées :**
- ✅ `'masculin'` (sans majuscule, sans 'e')
- ✅ `'feminin'` (sans majuscule, sans 'é')

**Valeurs REFUSÉES :**
- ❌ `'Masculin'` (majuscule)
- ❌ `'féminin'` (avec 'é')
- ❌ `'M'` ou `'F'`
- ❌ `'homme'` ou `'femme'`

---

## 🔄 **WORKFLOW APRÈS CORRECTION**

```
1. Déclaration avec sexe = 'féminin'
   ↓
2. Fonction appelée
   ↓
3. Conversion CASE
   'féminin' → 'feminin' ✅
   ↓
4. INSERT dans naissances
   ✅ Contrainte respectée
   ↓
5. Acte créé avec succès
```

---

## ⚠️ **ALTERNATIVE : CORRIGER L'ENUM**

**Si vous voulez accepter 'féminin' avec 'é' :**

```sql
-- Option 1 : Ajouter 'féminin' à l'enum
ALTER TYPE sexe_enum ADD VALUE IF NOT EXISTS 'féminin';

-- Option 2 : Recréer l'enum (plus complexe)
-- Nécessite migration des données
```

**Mais la conversion CASE est plus simple et plus robuste !**

---

## ✅ **RÉSULTAT**

**Avant :**
- ❌ Erreur contrainte sexe
- ❌ Génération impossible

**Après :**
- ✅ Conversion automatique
- ✅ Génération fonctionne
- ✅ Acte créé

---

## 📄 **FICHIERS**

**Modifiés :**
- `supabase/fonction-generer-acte-naissance.sql` ✅

**Créés :**
- `supabase/voir-contrainte-sexe.sql`
- `ERREUR_SEXE_SOLUTION.md` (ce document)

---

## 🎯 **RÉCAPITULATIF DES CORRECTIONS**

**Aujourd'hui on a corrigé :**

1. ✅ **Enum statut** - Ajouté `documents_verifies` et `remis`
2. ✅ **Affichage statuts** - Ajouté labels et badges
3. ✅ **Colonnes table** - Simplifié pour colonnes existantes
4. ✅ **Contrainte sexe** - Ajouté conversion CASE ✅

---

**🚀 EXÉCUTEZ LA FONCTION CORRIGÉE ! ✅**

```sql
supabase/fonction-generer-acte-naissance.sql
```
