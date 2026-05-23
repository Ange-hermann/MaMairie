# ✅ CORRIGER AVIS MENTIONS

## 🔴 **ERREUR**

```
Could not find the 'conditions_acceptees' column of 'avis_mentions'
```

## ✅ **SOLUTION**

**Fichier :** `CORRIGER-TABLE-AVIS-MENTIONS.sql`

**Action :** Ajouter la colonne manquante

---

## 🚀 **EXÉCUTEZ CE SCRIPT**

### **1. Allez sur Supabase.com**
- SQL Editor

### **2. Copiez le script**
```sql
ALTER TABLE avis_mentions 
ADD COLUMN IF NOT EXISTS conditions_acceptees BOOLEAN DEFAULT false;

ALTER TABLE avis_mentions 
ADD COLUMN IF NOT EXISTS date_acceptation TIMESTAMP;
```

### **3. Cliquez "Run"**

### **4. Rechargez l'app**
```
Ctrl + F5
```

### **5. Testez**
```
Soumettez un avis de mention
```

---

## 📄 **FICHIER**

`supabase/CORRIGER-TABLE-AVIS-MENTIONS.sql`

---

**🚀 EXÉCUTEZ LE SCRIPT DANS SUPABASE ! ✅**
