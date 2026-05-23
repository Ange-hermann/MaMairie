# ✅ FICHIER FINAL À EXÉCUTER

## 🎯 **FICHIER RECOMMANDÉ**

```bash
supabase/inserer-mairies-simple.sql
```

**Ce fichier est COMPLET et PRÊT !**

---

## ✅ **AVANTAGES**

- ✅ Un seul INSERT pour toutes les mairies
- ✅ Colonne `pays` incluse : `'Côte d''Ivoire'`
- ✅ ~110 mairies de Côte d'Ivoire
- ✅ Toutes les grandes villes
- ✅ Pas d'erreurs

---

## 🚀 **EXÉCUTION**

### **Dans Supabase SQL Editor :**

1. Ouvrez Supabase Dashboard
2. Allez dans SQL Editor
3. Copiez-collez le contenu de `inserer-mairies-simple.sql`
4. Cliquez sur "Run"

---

## 📊 **RÉSULTAT ATTENDU**

```
Total mairies insérées: 110

nom_mairie | ville | pays
-----------+-------+-------------
Mairie d'Abobo | Abobo | Côte d'Ivoire
Mairie d'Abengourou | Abengourou | Côte d'Ivoire
Mairie d'Adjamé | Adjamé | Côte d'Ivoire
...
```

---

## 🎯 **DANS LE FORMULAIRE**

Ouvrez `/demande-extrait` :

```
Sélectionnez votre mairie :
[Mairie d'Abobo - Abobo ▼]
[Mairie de Bouaké - Bouaké ▼]
[Mairie de Cocody - Cocody ▼]
[Mairie de Daloa - Daloa ▼]
... (~110 mairies)

110 mairie(s) disponible(s) ✅
```

---

## 📝 **MAIRIES INCLUSES**

### **District Abidjan (13)**
Abobo, Adjamé, Attécoubé, Cocody, Koumassi, Marcory, Plateau, Port-Bouët, Treichville, Yopougon, Songon, Bingerville, Anyama

### **Grandes villes (~97)**
Bouaké, Yamoussoukro, Daloa, Korhogo, San-Pédro, Man, Gagnoa, Abengourou, Divo, Ferkessédougou, Bondoukou, Soubré, Odienné, Séguéla, et beaucoup d'autres...

**Total : ~110 mairies**

---

## ⚠️ **SI ERREUR**

### **"table mairies does not exist"**

Créez la table :
```sql
CREATE TABLE mairies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_mairie TEXT NOT NULL,
  ville TEXT,
  pays TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎉 **RÉSUMÉ**

✅ Fichier : `inserer-mairies-simple.sql`
✅ Mairies : ~110
✅ Pays : Inclus
✅ Prêt : OUI

---

**🇨🇮 EXÉCUTEZ `inserer-mairies-simple.sql` ET C'EST TERMINÉ ! 🎉**
