# ❌ ERREUR ENUM - SOLUTION

## 🔴 **ERREUR**

```
Erreur : invalid input value for enum statut_declaration_enum: "documents_verifies"
```

---

## 🔍 **CAUSE**

L'enum `statut_declaration_enum` ne contient que :
- ✅ `en_attente`
- ✅ `en_traitement`
- ✅ `validee`
- ✅ `rejetee`

Mais le code essaie d'utiliser :
- ❌ `documents_verifies` (manquant)
- ❌ `remis` (manquant)

---

## ✅ **SOLUTION**

### **Exécuter ce script SQL :**

```sql
-- Dans Supabase SQL Editor
supabase/corriger-enum-statut-declaration.sql
```

**Contenu du script :**
```sql
ALTER TYPE statut_declaration_enum ADD VALUE IF NOT EXISTS 'documents_verifies';
ALTER TYPE statut_declaration_enum ADD VALUE IF NOT EXISTS 'remis';
```

---

## 🔄 **WORKFLOW COMPLET**

Après correction, les statuts seront :

```
1. en_attente          → Déclaration soumise
2. en_traitement       → Agent examine
3. validee             → Agent valide
4. documents_verifies  → Documents vérifiés ✅
5. remis               → Acte remis ✅
6. rejetee             → Déclaration rejetée
```

---

## 📋 **ÉTAPES**

**1. Exécuter le script SQL** ⏳
```sql
-- Copier-coller dans Supabase SQL Editor
ALTER TYPE statut_declaration_enum ADD VALUE IF NOT EXISTS 'documents_verifies';
ALTER TYPE statut_declaration_enum ADD VALUE IF NOT EXISTS 'remis';
```

**2. Vérifier** ✅
```sql
SELECT enum_range(NULL::statut_declaration_enum);
```

**Résultat attendu :**
```
{en_attente,en_traitement,validee,rejetee,documents_verifies,remis}
```

**3. Retester l'application** ✅
```
1. Allez sur /agent/declarations
2. Validez une déclaration
3. Vérifiez les documents
4. ✅ Plus d'erreur !
```

---

## 🎯 **POURQUOI CETTE ERREUR ?**

**Workflow initial (incomplet) :**
```
Déclaration → Validation → Rejet/Validation
```

**Workflow complet (avec documents) :**
```
Déclaration → Validation → Vérification Documents → Remise Acte
```

Les statuts `documents_verifies` et `remis` sont nécessaires pour le workflow complet !

---

## 📄 **FICHIERS CONCERNÉS**

**Script SQL :**
- `supabase/corriger-enum-statut-declaration.sql`

**Code utilisant ces statuts :**
- `app/agent/declarations/page.tsx`
- `components/VerificationDocumentsModal.tsx`
- `supabase/fonction-generer-acte-naissance.sql`

---

## ⚠️ **IMPORTANT**

**PostgreSQL ne permet PAS de supprimer des valeurs d'un enum.**

Si vous voulez réorganiser l'ordre, il faut :
1. Créer un nouvel enum
2. Migrer les données
3. Supprimer l'ancien enum

**Mais ajouter des valeurs est simple et sans risque !** ✅

---

## ✅ **RÉSULTAT**

Après exécution du script :
- ✅ Enum corrigé
- ✅ Workflow complet fonctionnel
- ✅ Vérification documents OK
- ✅ Génération acte OK

---

**📄 EXÉCUTEZ LE SCRIPT SQL MAINTENANT ! 🚀**

```sql
ALTER TYPE statut_declaration_enum ADD VALUE IF NOT EXISTS 'documents_verifies';
ALTER TYPE statut_declaration_enum ADD VALUE IF NOT EXISTS 'remis';
```
