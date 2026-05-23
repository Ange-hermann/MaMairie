# ✅ CORRECTION - ERREUR FOREIGN KEY

## ❌ **ERREUR**

```
ERROR: 23503: update or delete on table "communes" violates foreign key constraint "mairies_commune_id_fkey" on table "mairies"
DETAIL: Key (id)=(d016869f-3866-45f4-939c-fa698696e586) is still referenced from table "mairies".
```

---

## 🔍 **CAUSE**

Certaines **mairies** ont un `commune_id` qui pointe vers des communes existantes. PostgreSQL empêche la suppression des communes tant qu'elles sont référencées.

---

## ✅ **SOLUTION APPLIQUÉE**

Le fichier `nettoyer-et-inserer-communes.sql` a été corrigé :

```sql
-- ÉTAPE 1 : Nettoyer les références dans les mairies
UPDATE mairies SET commune_id = NULL WHERE commune_id IS NOT NULL;
UPDATE mairies SET sous_prefecture_id = NULL WHERE sous_prefecture_id IS NOT NULL;

-- ÉTAPE 2 : Supprimer toutes les communes existantes
DELETE FROM communes;

-- ÉTAPE 3 : Insérer les nouvelles communes
-- ...
```

---

## 🔄 **ORDRE D'EXÉCUTION**

1. ✅ Mettre à NULL les `commune_id` dans `mairies`
2. ✅ Mettre à NULL les `sous_prefecture_id` dans `mairies`
3. ✅ Supprimer les communes
4. ✅ Insérer les nouvelles communes
5. ✅ Générer les communes restantes

---

## 🚀 **UTILISATION**

```bash
# Exécutez le fichier corrigé
supabase/nettoyer-et-inserer-communes.sql
```

**Résultat :**
- ✅ Références nettoyées
- ✅ Communes supprimées
- ✅ Nouvelles communes insérées
- ✅ ~200+ communes au total

---

## 📝 **NOTE IMPORTANTE**

Après l'insertion des communes, vous devrez **réassigner les mairies** aux communes :

```sql
-- Exemple : Assigner la mairie d'Abobo à la commune d'Abobo
UPDATE mairies 
SET commune_id = (SELECT id FROM communes WHERE nom = 'Abobo')
WHERE nom_mairie LIKE '%Abobo%';

-- Exemple : Assigner la mairie de Cocody à la commune de Cocody
UPDATE mairies 
SET commune_id = (SELECT id FROM communes WHERE nom = 'Cocody')
WHERE nom_mairie LIKE '%Cocody%';
```

Ou utilisez le script `update-mairies-geo.sql` qui le fait automatiquement.

---

## ✅ **VÉRIFICATION**

```sql
-- Vérifier les communes
SELECT COUNT(*) FROM communes;

-- Vérifier les mairies sans commune
SELECT COUNT(*) FROM mairies WHERE commune_id IS NULL;
```

---

**🔧 ERREUR CORRIGÉE ! LE SCRIPT EST MAINTENANT PRÊT ! ✅**
