# 🚀 GUIDE FINAL D'INSTALLATION

## 🎯 **INSTALLATION LA PLUS SIMPLE**

### **Étape unique : Insérer les mairies**

```bash
# Exécutez ce fichier dans Supabase SQL Editor
supabase/inserer-toutes-mairies-ci.sql
```

**C'est tout ! 🎉**

---

## ✅ **CE QUE ÇA FAIT**

1. ✅ Nettoie les mairies existantes (`TRUNCATE TABLE mairies CASCADE`)
2. ✅ Insère ~100 mairies de Côte d'Ivoire
3. ✅ Affiche la liste complète

---

## 📊 **VÉRIFICATION**

```sql
-- Compter les mairies
SELECT COUNT(*) FROM mairies;
-- Résultat attendu : ~100

-- Voir les mairies
SELECT nom_mairie, ville FROM mairies ORDER BY nom_mairie LIMIT 10;
```

**Résultat attendu :**
```
Mairie d'Abobo | Abobo
Mairie d'Abengourou | Abengourou
Mairie d'Adjamé | Adjamé
Mairie de Bouaké | Bouaké
Mairie de Cocody | Cocody
...
```

---

## 🎯 **RÉSULTAT DANS LE FORMULAIRE**

Ouvrez `/demande-extrait` et vous verrez :

```
┌─────────────────────────────────────────┐
│ 📍 Où se trouve votre acte ?            │
├─────────────────────────────────────────┤
│ [🏢 Mairie] [🏘️ Sous-préf.] [🏡 Village]│
│                                          │
│ Sélectionnez votre mairie :             │
│ [Mairie d'Abobo - Abobo ▼]              │
│ [Mairie de Bouaké - Bouaké ▼]           │
│ [Mairie de Cocody - Cocody ▼]           │
│ [Mairie de Daloa - Daloa ▼]             │
│ [Mairie de Korhogo - Korhogo ▼]         │
│ ... (~100 mairies)                      │
│                                          │
│ 100 mairie(s) disponible(s) ✅          │
└─────────────────────────────────────────┘
```

---

## 📝 **MAIRIES INCLUSES**

### **District Abidjan (13)**
Abobo, Adjamé, Attécoubé, Cocody, Koumassi, Marcory, Plateau, Port-Bouët, Treichville, Yopougon, Songon, Bingerville, Anyama

### **Grandes villes**
Bouaké, Yamoussoukro, Daloa, Korhogo, Man, San-Pédro, Gagnoa, Abengourou, Bondoukou, Ferkessédougou, Divo, Odienné, Séguéla, Soubré, etc.

**Total : ~100 mairies**

---

## 🔧 **EN CAS D'ERREUR**

### **Erreur : "table mairies does not exist"**

Créez d'abord la table :
```sql
CREATE TABLE mairies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_mairie TEXT UNIQUE NOT NULL,
  ville TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Erreur : "TRUNCATE requires DROP privilege"**

Utilisez DELETE à la place :
```sql
-- Remplacez TRUNCATE par DELETE
DELETE FROM mairies;
```

---

## 🎉 **RÉSUMÉ**

✅ **1 fichier** : `inserer-toutes-mairies-ci.sql`
✅ **1 commande** : Exécuter dans Supabase
✅ **~100 mairies** : Toutes les grandes villes de CI
✅ **Formulaire prêt** : Sélection directe des mairies

---

**🇨🇮 INSTALLATION TERMINÉE ! TESTEZ LE FORMULAIRE ! 🎉**
