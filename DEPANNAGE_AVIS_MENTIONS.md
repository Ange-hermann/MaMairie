# 🔍 DÉPANNAGE AVIS MENTIONS

## 🔴 **PROBLÈME**

L'agent ne voit pas les avis de mention soumis par les citoyens

---

## ✅ **SOLUTIONS**

### **1. Vérifier que le script a été exécuté**

**Avez-vous exécuté :** `AVIS-MENTIONS-COMPLET.sql` ?

Si non → Exécutez-le dans Supabase SQL Editor

---

### **2. Vérifier les données**

**Exécutez ce script dans Supabase :**

`VERIFIER-AVIS-MENTIONS.sql`

**Ce script va montrer :**
- Tous les avis créés
- Le nombre d'avis par mairie
- Les colonnes de la table

---

### **3. Vérifier que l'agent et le citoyen sont dans la même mairie**

**L'agent voit UNIQUEMENT les avis de SA mairie !**

**Vérifiez :**
1. L'agent est dans quelle mairie ?
2. Le citoyen a soumis l'avis pour quelle mairie ?
3. Les `mairie_id` correspondent ?

---

### **4. Recharger la page**

```
Ctrl + F5
```

---

### **5. Vérifier les erreurs dans la console**

**Ouvrez la console du navigateur :**
```
F12 → Console
```

**Cherchez des erreurs rouges**

---

## 📋 **CHECKLIST**

- [ ] Script `AVIS-MENTIONS-COMPLET.sql` exécuté
- [ ] Colonnes ajoutées (vérifier avec `VERIFIER-AVIS-MENTIONS.sql`)
- [ ] Agent et citoyen dans la même mairie
- [ ] Page rechargée (Ctrl+F5)
- [ ] Pas d'erreurs dans la console

---

## 🎯 **SI ÇA NE MARCHE TOUJOURS PAS**

**Envoyez-moi :**
1. Le résultat de `VERIFIER-AVIS-MENTIONS.sql`
2. Une capture d'écran de la console (F12)
3. Le `mairie_id` de l'agent
4. Le `mairie_id` de l'avis soumis

---

**📄 FICHIERS :**
- `VERIFIER-AVIS-MENTIONS.sql` ← Exécutez pour diagnostiquer
- `DEPANNAGE_AVIS_MENTIONS.md` ← Ce guide

---

**🔍 EXÉCUTEZ LE SCRIPT DE VÉRIFICATION ! ✅**
