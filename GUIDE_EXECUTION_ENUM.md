# 📋 GUIDE D'EXÉCUTION - CORRECTION ENUM

## ⚠️ **IMPORTANT**

**NE PAS** exécuter toutes les commandes en même temps !
Il faut les exécuter **UNE PAR UNE**.

---

## 🔢 **ÉTAPES À SUIVRE**

### **Étape 1 : Ajouter 'documents_verifies'**

**Sélectionnez UNIQUEMENT cette ligne :**
```sql
ALTER TYPE statut_declaration_enum ADD VALUE IF NOT EXISTS 'documents_verifies';
```

**Cliquez "Run"** ✅

**Attendez le message de succès**

---

### **Étape 2 : Ajouter 'remis'**

**Sélectionnez UNIQUEMENT cette ligne :**
```sql
ALTER TYPE statut_declaration_enum ADD VALUE IF NOT EXISTS 'remis';
```

**Cliquez "Run"** ✅

**Attendez le message de succès**

---

### **Étape 3 : Vérifier**

**Sélectionnez UNIQUEMENT cette ligne :**
```sql
SELECT enum_range(NULL::statut_declaration_enum);
```

**Cliquez "Run"** ✅

**Résultat attendu :**
```
{en_attente,en_traitement,validee,rejetee,documents_verifies,remis}
```

---

## 🎯 **POURQUOI UNE PAR UNE ?**

PostgreSQL exige que les nouvelles valeurs d'enum soient **committées** avant d'être utilisées.

**Si vous exécutez tout en même temps :**
```
❌ ERROR: 55P04: unsafe use of new value "documents_verifies"
```

**Si vous exécutez une par une :**
```
✅ Success
✅ Success
✅ {en_attente,en_traitement,validee,rejetee,documents_verifies,remis}
```

---

## 📸 **CAPTURE D'ÉCRAN DU PROCESSUS**

```
┌─────────────────────────────────────┐
│ Supabase SQL Editor                 │
├─────────────────────────────────────┤
│                                     │
│ 1. Sélectionner ligne 8 uniquement  │
│    ALTER TYPE statut_declaration... │
│                                     │
│    [Run] ← Cliquer                  │
│                                     │
│    ✅ Success                        │
│                                     │
├─────────────────────────────────────┤
│                                     │
│ 2. Sélectionner ligne 11 uniquement │
│    ALTER TYPE statut_declaration... │
│                                     │
│    [Run] ← Cliquer                  │
│                                     │
│    ✅ Success                        │
│                                     │
├─────────────────────────────────────┤
│                                     │
│ 3. Sélectionner ligne 14 uniquement │
│    SELECT enum_range...             │
│                                     │
│    [Run] ← Cliquer                  │
│                                     │
│    ✅ {en_attente,...,remis}        │
│                                     │
└─────────────────────────────────────┘
```

---

## ✅ **CHECKLIST**

- [ ] Étape 1 : ALTER TYPE ... 'documents_verifies' ✅
- [ ] Étape 2 : ALTER TYPE ... 'remis' ✅
- [ ] Étape 3 : SELECT enum_range ✅
- [ ] Résultat contient 6 valeurs ✅
- [ ] Retester l'application ✅

---

## 🔄 **APRÈS CORRECTION**

**Retestez l'application :**
```
1. Allez sur /agent/declarations
2. Validez une déclaration
3. Vérifiez les documents
4. ✅ Plus d'erreur !
```

---

## 🆘 **EN CAS DE PROBLÈME**

**Si l'erreur persiste :**

**Option 1 : Vérifier les valeurs existantes**
```sql
SELECT enum_range(NULL::statut_declaration_enum);
```

**Option 2 : Vérifier si la valeur existe déjà**
```sql
SELECT unnest(enum_range(NULL::statut_declaration_enum))::text;
```

**Option 3 : Forcer l'ajout (si IF NOT EXISTS ne marche pas)**
```sql
-- Seulement si la valeur n'existe vraiment pas
ALTER TYPE statut_declaration_enum ADD VALUE 'documents_verifies';
```

---

## 📄 **FICHIER**

`supabase/corriger-enum-statut-declaration.sql`

---

**🚀 EXÉCUTEZ UNE COMMANDE À LA FOIS ! ✅**

**1️⃣ → 2️⃣ → 3️⃣**
