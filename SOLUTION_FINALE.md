# ✅ SOLUTION FINALE - MAIRIES

## 🎯 **FICHIER FINAL À EXÉCUTER**

```bash
supabase/inserer-mairies-auto-code.sql
```

**Ce fichier génère automatiquement les codes des mairies !**

---

## ✅ **AVANTAGES**

- ✅ Génération automatique du `code_mairie`
- ✅ Format : `MAI-{3 premières lettres}-{numéro}`
- ✅ Exemples : `MAI-ABO-001`, `MAI-COC-002`, `MAI-BOU-003`
- ✅ Colonne `pays` : `'Côte d''Ivoire'`
- ✅ ~110 mairies

---

## 🚀 **COMMENT ÇA MARCHE**

Le script utilise `ROW_NUMBER()` pour générer automatiquement un code unique :

```sql
'MAI-' || UPPER(LEFT(REPLACE(ville, ' ', ''), 3)) || '-' || LPAD(ROW_NUMBER() OVER (ORDER BY nom)::TEXT, 3, '0')
```

**Exemples :**
- Abobo → `MAI-ABO-001`
- Cocody → `MAI-COC-002`
- Bouaké → `MAI-BOU-003`
- Yamoussoukro → `MAI-YAM-004`

---

## 📊 **RÉSULTAT ATTENDU**

```
Total mairies: 110

nom_mairie | ville | pays | code_mairie
-----------+-------+------+-------------
Mairie d'Abobo | Abobo | Côte d'Ivoire | MAI-ABO-001
Mairie de Cocody | Cocody | Côte d'Ivoire | MAI-COC-002
Mairie de Bouaké | Bouaké | Côte d'Ivoire | MAI-BOU-003
...
```

---

## 🎯 **DANS LE FORMULAIRE**

```
Sélectionnez votre mairie :
[Mairie d'Abobo - Abobo ▼]
[Mairie de Bouaké - Bouaké ▼]
[Mairie de Cocody - Cocody ▼]
... (~110 mairies)

110 mairie(s) disponible(s) ✅
```

---

## ⚠️ **SI ERREUR "table mairies does not exist"**

Créez la table :

```sql
CREATE TABLE mairies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_mairie TEXT NOT NULL,
  ville TEXT,
  pays TEXT NOT NULL,
  code_mairie TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎉 **RÉSUMÉ**

✅ Fichier : `inserer-mairies-auto-code.sql`
✅ Mairies : ~110
✅ Code : Généré automatiquement
✅ Pays : Inclus
✅ Prêt : OUI !

---

**🇨🇮 EXÉCUTEZ `inserer-mairies-auto-code.sql` ET TOUT EST TERMINÉ ! 🎉**
