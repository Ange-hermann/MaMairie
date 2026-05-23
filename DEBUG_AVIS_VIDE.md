# 🔍 DEBUG AVIS VIDE

## 🔴 **PROBLÈME**

La page affiche :
- Total: 1
- En attente: 0
- En traitement: 0
- Validées: 0
- Liste vide

**Cela signifie qu'il y a 1 avis dans la base, mais il n'apparaît pas dans les filtres.**

---

## 🔍 **DIAGNOSTIC**

**Exécutez ce script dans Supabase :**

`DEBUG-AVIS-RAPIDE.sql`

**Il va montrer :**
1. Combien d'avis existent
2. Leur statut exact
3. Leur mairie_id
4. Les mairies des agents

---

## 💡 **CAUSES POSSIBLES**

### **1. Statut incorrect**
L'avis a peut-être un statut qui n'est pas géré :
- `en_attente` ✅
- `en_traitement` ✅
- `approuvee` ✅
- `rejetee` ✅
- Autre statut ❌

### **2. Mairie différente**
L'avis est pour une mairie, l'agent est dans une autre.

### **3. Statut NULL**
Le statut est NULL au lieu d'avoir une valeur.

---

## ✅ **SOLUTION SELON LE DIAGNOSTIC**

### **Si statut incorrect :**
```sql
UPDATE avis_mentions 
SET statut = 'en_attente' 
WHERE statut IS NULL OR statut NOT IN ('en_attente', 'en_traitement', 'approuvee', 'rejetee');
```

### **Si mairie différente :**
```sql
-- Voir quelle mairie
SELECT mairie_id FROM avis_mentions;
SELECT mairie_id FROM users WHERE role = 'agent';

-- Corriger si besoin
UPDATE avis_mentions 
SET mairie_id = 'ID-MAIRIE-AGENT'
WHERE id = 'ID-AVIS';
```

---

## 🚀 **ÉTAPES**

1. **Exécutez** `DEBUG-AVIS-RAPIDE.sql`
2. **Regardez** les résultats
3. **Corrigez** selon le problème trouvé
4. **Rechargez** la page (Ctrl+F5)

---

**🔍 EXÉCUTEZ LE DIAGNOSTIC MAINTENANT ! ✅**
