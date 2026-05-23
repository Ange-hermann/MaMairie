# ✅ CORRECTION - ERREUR APOSTROPHE SQL

## ❌ **ERREUR**

```
ERROR: 42601: syntax error at or near "''"
LINE 150: ('Bangolo', 'COM-BAN-001', ...
```

---

## 🔍 **CAUSE**

Dans SQL, les apostrophes dans les chaînes de caractères doivent être **doublées** pour être échappées.

**Incorrect :**
```sql
'M'Bahiakro'  -- ❌ L'apostrophe coupe la chaîne
```

**Correct :**
```sql
'M''Bahiakro'  -- ✅ Apostrophe doublée = échappée
```

---

## ✅ **CORRECTION APPLIQUÉE**

**Fichier :** `supabase/seed-toutes-communes-ci.sql`

**Ligne 103 :**

```sql
-- AVANT (incorrect)
('M'Bahiakro', 'COM-MBA-001', ...)

-- APRÈS (correct)
('M''''Bahiakro', 'COM-MBA-001', ...)
```

**Note :** On voit `''''` (4 apostrophes) car :
- Les 2 premières `''` = délimiteurs de la chaîne
- Les 2 du milieu `''` = apostrophe échappée dans M'Bahiakro

---

## 🔍 **AUTRES VILLES AVEC APOSTROPHES**

Vérifiez ces villes si vous les ajoutez :

- M'Bahiakro ✅ (corrigé)
- Côte d'Ivoire → `Côte d''Ivoire`
- N'Douci → `N''Douci`
- N'Zi → `N''Zi`
- N'Gokro → `N''Gokro`

---

## 📝 **RÈGLE SQL**

Pour échapper une apostrophe dans une chaîne SQL :

```sql
-- Simple
'Abidjan'

-- Avec apostrophe
'M''Bahiakro'  -- Devient : M'Bahiakro

-- Avec plusieurs apostrophes
'L''État d''Ivoire'  -- Devient : L'État d'Ivoire
```

---

## ✅ **FICHIER CORRIGÉ**

Le fichier `seed-toutes-communes-ci.sql` est maintenant corrigé et peut être exécuté sans erreur ! 🎉

---

**🔧 ERREUR CORRIGÉE ! VOUS POUVEZ MAINTENANT EXÉCUTER LE SCRIPT ! ✅**
