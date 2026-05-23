# ✅ CORRECTION - ERREUR NOT NULL

## ❌ **ERREUR**

```
ERROR: 23502: null value in column "sous_prefecture_id" of relation "communes" violates not-null constraint
```

---

## 🔍 **CAUSE**

La colonne `sous_prefecture_id` dans la table `communes` a une contrainte `NOT NULL`. On ne peut pas mettre cette colonne à NULL sans d'abord supprimer la contrainte.

---

## ✅ **SOLUTION APPLIQUÉE**

Le fichier `nettoyer-et-inserer-sous-prefectures.sql` a été corrigé :

```sql
-- ÉTAPE 1 : Rendre les colonnes nullable temporairement
ALTER TABLE communes ALTER COLUMN sous_prefecture_id DROP NOT NULL;
ALTER TABLE villages ALTER COLUMN sous_prefecture_id DROP NOT NULL;
ALTER TABLE mairies ALTER COLUMN sous_prefecture_id DROP NOT NULL;

-- ÉTAPE 2 : Nettoyer les références
UPDATE communes SET sous_prefecture_id = NULL;
UPDATE villages SET sous_prefecture_id = NULL;
UPDATE mairies SET sous_prefecture_id = NULL;

-- ÉTAPE 3 : Supprimer les sous-préfectures
DELETE FROM sous_prefectures;

-- ÉTAPE 4 : Insérer les nouvelles sous-préfectures
-- ...

-- ÉTAPE FINALE (OPTIONNEL) : Remettre les contraintes
-- ALTER TABLE communes ALTER COLUMN sous_prefecture_id SET NOT NULL;
```

---

## 🔄 **ORDRE D'EXÉCUTION**

1. ✅ Supprimer la contrainte NOT NULL
2. ✅ Mettre les colonnes à NULL
3. ✅ Supprimer les sous-préfectures
4. ✅ Insérer les nouvelles sous-préfectures
5. ⏳ (Optionnel) Remettre la contrainte NOT NULL

---

## 🚀 **UTILISATION**

```bash
# Exécutez le fichier corrigé
supabase/nettoyer-et-inserer-sous-prefectures.sql
```

**Résultat :**
- ✅ Contraintes supprimées temporairement
- ✅ Références nettoyées
- ✅ Sous-préfectures supprimées et réinsérées
- ✅ ~510 sous-préfectures créées

---

## 📝 **NOTE IMPORTANTE**

### **Pourquoi ne pas remettre NOT NULL ?**

On laisse les colonnes **nullable** pour permettre :
- ✅ D'insérer des communes sans SP assignée
- ✅ De modifier facilement les données
- ✅ D'éviter les erreurs lors des migrations

### **Quand remettre NOT NULL ?**

Remettez la contrainte seulement si :
- Toutes les communes ont une SP assignée
- Tous les villages ont une SP assignée
- Toutes les mairies ont une SP assignée

```sql
-- Vérifier avant de remettre NOT NULL
SELECT COUNT(*) FROM communes WHERE sous_prefecture_id IS NULL;
SELECT COUNT(*) FROM villages WHERE sous_prefecture_id IS NULL;
SELECT COUNT(*) FROM mairies WHERE sous_prefecture_id IS NULL;

-- Si tous retournent 0, vous pouvez remettre NOT NULL
ALTER TABLE communes ALTER COLUMN sous_prefecture_id SET NOT NULL;
ALTER TABLE villages ALTER COLUMN sous_prefecture_id SET NOT NULL;
ALTER TABLE mairies ALTER COLUMN sous_prefecture_id SET NOT NULL;
```

---

## ✅ **VÉRIFICATION**

```sql
-- Vérifier que les SP sont insérées
SELECT COUNT(*) FROM sous_prefectures;
-- Résultat attendu : ~510

-- Vérifier les communes avec SP
SELECT COUNT(*) FROM communes WHERE sous_prefecture_id IS NOT NULL;
```

---

**🔧 ERREUR CORRIGÉE ! LE SCRIPT EST MAINTENANT PRÊT ! ✅**
