# 🔴 ERREUR ENUM STATUT MENTION

## 🔴 **PROBLÈME**

```
Erreur : invalid input value for enum statut_mention_enum: "documents_verifies"
```

Le statut `documents_verifies` n'existe pas dans l'enum `statut_mention_enum`.

---

## 🔍 **DIAGNOSTIC**

**Exécutez ce script dans Supabase :**

`VERIFIER-ENUM-STATUT-MENTION.sql`

**Il va :**
1. Afficher les valeurs actuelles de l'enum
2. Ajouter `documents_verifies` si manquant
3. Vérifier à nouveau

---

## ✅ **SOLUTION**

### **Option 1 : Ajouter la valeur à l'enum (Recommandé)**

```sql
ALTER TYPE statut_mention_enum 
ADD VALUE IF NOT EXISTS 'documents_verifies';
```

### **Option 2 : Utiliser un statut existant**

Si l'enum a déjà un statut similaire (ex: `verifie`), on peut l'utiliser à la place.

---

## 📋 **STATUTS NÉCESSAIRES**

Pour le workflow complet, on a besoin de :
- `en_attente` ✅
- `en_traitement` ✅
- `documents_verifies` ❌ (à ajouter)
- `approuvee` ✅
- `rejetee` ✅

---

## 🚀 **ÉTAPES**

1. **Exécutez** `VERIFIER-ENUM-STATUT-MENTION.sql`
2. **Regardez** les valeurs actuelles
3. **Le script ajoute** automatiquement `documents_verifies`
4. **Rechargez** l'app (Ctrl+F5)
5. **Testez** à nouveau

---

**📄 FICHIERS :**
- `VERIFIER-ENUM-STATUT-MENTION.sql` ← **EXÉCUTEZ**
- `ERREUR_ENUM_STATUT_MENTION.md` ← Ce guide

---

**🔧 EXÉCUTEZ LE SCRIPT ET TESTEZ ! ✅**
