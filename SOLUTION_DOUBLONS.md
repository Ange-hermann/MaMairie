# ✅ SOLUTION - ERREUR DOUBLONS

## ❌ **ERREUR**

```
ERROR: 23505: duplicate key value violates unique constraint "communes_code_key"
DETAIL: Key (code)=(COM-ABO-001) already exists.
```

---

## 🔍 **CAUSE**

Vous avez déjà exécuté un script qui a inséré des communes. Le code `COM-ABO-001` existe déjà dans la base de données.

---

## ✅ **SOLUTION 1 : Nettoyer et réinsérer (RECOMMANDÉ)**

**Fichier :** `nettoyer-et-inserer-communes.sql`

Ce fichier :
1. ✅ **Supprime** toutes les communes existantes
2. ✅ **Insère** les 20+ communes principales
3. ✅ **Génère automatiquement** les communes restantes
4. ✅ **Utilise ON CONFLICT** pour éviter les doublons

```sql
-- Exécuter ce fichier unique
supabase/nettoyer-et-inserer-communes.sql
```

---

## ✅ **SOLUTION 2 : Supprimer manuellement**

Si vous voulez juste supprimer les communes existantes :

```sql
-- Supprimer toutes les communes
DELETE FROM communes;

-- Puis exécuter votre script
```

---

## ✅ **SOLUTION 3 : Ignorer les doublons**

Si vous voulez garder les communes existantes et ajouter seulement les nouvelles :

```sql
-- Ajouter ON CONFLICT DO NOTHING à chaque INSERT
INSERT INTO communes (...)
VALUES (...)
ON CONFLICT (code) DO NOTHING;
```

---

## 🚀 **INSTALLATION PROPRE**

Pour repartir de zéro avec toutes les communes :

```bash
# 1. Nettoyer et insérer toutes les communes
supabase/nettoyer-et-inserer-communes.sql
```

**Résultat :**
- ✅ Communes principales insérées
- ✅ Communes restantes générées automatiquement
- ✅ Pas de doublons
- ✅ Total : ~200+ communes

---

## 📊 **VÉRIFICATION**

```sql
SELECT COUNT(*) FROM communes;
-- Devrait retourner ~200+

SELECT * FROM communes ORDER BY nom LIMIT 10;
```

---

**🎉 FICHIER PRÊT À UTILISER ! EXÉCUTEZ `nettoyer-et-inserer-communes.sql` ! ✅**
