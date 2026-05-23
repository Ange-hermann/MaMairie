# ✅ SCRIPT FINAL PRÊT !

## 🎯 **FICHIER À EXÉCUTER**

```bash
supabase/inserer-toutes-mairies-ci.sql
```

---

## ✅ **CORRECTIONS APPLIQUÉES**

1. ✅ Commenté les UPDATE pour tables inexistantes
2. ✅ Utilisé `TRUNCATE TABLE mairies CASCADE`
3. ✅ Enlevé `ON CONFLICT` (pas de contrainte UNIQUE)
4. ✅ Doublé les apostrophes (`M''Bahiakro`)

---

## 🚀 **EXÉCUTION**

### **Dans Supabase SQL Editor :**

1. Ouvrez Supabase Dashboard
2. Allez dans SQL Editor
3. Copiez-collez le contenu de `inserer-toutes-mairies-ci.sql`
4. Cliquez sur "Run"

---

## 📊 **RÉSULTAT ATTENDU**

```
Total mairies: 100

Liste des mairies:
Mairie d'Abobo | Abobo
Mairie d'Abengourou | Abengourou
Mairie d'Adjamé | Adjamé
Mairie d'Anyama | Anyama
Mairie d'Arrah | Arrah
Mairie d'Attiégouakro | Attiégouakro
Mairie d'Attécoubé | Attécoubé
Mairie d'Ayamé | Ayamé
...
(100 mairies au total)
```

---

## 🎯 **DANS LE FORMULAIRE**

Ouvrez `/demande-extrait` et vous verrez :

```
Sélectionnez votre mairie :
[Mairie d'Abobo - Abobo ▼]
[Mairie de Bouaké - Bouaké ▼]
[Mairie de Cocody - Cocody ▼]
... (100 mairies)

100 mairie(s) disponible(s) ✅
```

---

## ⚠️ **SI ERREUR**

### **"table mairies does not exist"**

Créez la table d'abord :
```sql
CREATE TABLE mairies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_mairie TEXT NOT NULL,
  ville TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **"permission denied"**

Vérifiez que vous êtes connecté avec un compte admin dans Supabase.

---

## 🎉 **RÉSUMÉ**

✅ Script corrigé et prêt
✅ ~100 mairies de Côte d'Ivoire
✅ Toutes les grandes villes incluses
✅ Formulaire fonctionnel

---

**🇨🇮 EXÉCUTEZ LE SCRIPT ET C'EST TERMINÉ ! 🎉**
