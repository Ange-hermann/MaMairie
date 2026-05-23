# ❓ POURQUOI L'AGENT NE VOIT PAS LES AVIS ?

## 🎯 **DIAGNOSTIC RAPIDE**

### **Exécutez ce script dans Supabase :**

`DIAGNOSTIC-AVIS-AGENT.sql`

---

## 🔍 **CE QUE LE SCRIPT VA MONTRER**

### **1. Les avis créés**
```
code_suivi | mairie_id | nom_mairie
MEN-2026   | abc-123   | Mairie de Cocody
```

### **2. Les agents**
```
email              | mairie_id | nom_mairie
agent@mail.com     | xyz-789   | Mairie d'Abobo
```

### **3. Le problème**
```
⚠️ Les avis sont pour la mairie abc-123
⚠️ Mais l'agent est dans la mairie xyz-789
❌ ILS NE CORRESPONDENT PAS !
```

---

## ✅ **SOLUTIONS**

### **Solution 1 : Créer l'avis pour la bonne mairie**

**Quand le citoyen soumet l'avis :**
- Il doit choisir la mairie de l'agent
- Pas une autre mairie

### **Solution 2 : Changer la mairie de l'agent**

**Si l'agent doit voir tous les avis :**

```sql
-- Mettre l'agent dans la bonne mairie
UPDATE users 
SET mairie_id = 'ID-DE-LA-MAIRIE-DES-AVIS'
WHERE email = 'email-de-lagent@mail.com';
```

### **Solution 3 : Afficher tous les avis (pas recommandé)**

**Modifier la page agent pour voir TOUS les avis :**
- Supprimer le filtre `.eq('mairie_id', profile.mairie_id)`
- Mais ce n'est pas sécurisé !

---

## 📋 **ÉTAPES**

1. **Exécutez** `DIAGNOSTIC-AVIS-AGENT.sql` dans Supabase
2. **Regardez** les `mairie_id`
3. **Vérifiez** s'ils correspondent
4. **Corrigez** selon la solution appropriée

---

## 💡 **RAPPEL**

**L'agent voit UNIQUEMENT les avis de SA mairie !**

C'est normal et sécurisé. Chaque mairie gère ses propres avis.

---

**🔍 EXÉCUTEZ LE DIAGNOSTIC MAINTENANT ! ✅**
