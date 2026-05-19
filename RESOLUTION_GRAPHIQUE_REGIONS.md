# 🔧 Résolution : Graphique Performance par Région

## ❌ **PROBLÈME**
Le graphique affiche des données incorrectes :
- Bouaké : 180 demandes, 60 naissances
- Abidjan : 450 demandes, 120 naissances
- Ces chiffres semblent être des données de test

## 🔍 **DIAGNOSTIC**

### **Étape 1 : Vérifier les Vraies Données**

Exécutez ce SQL dans **Supabase SQL Editor** :

```sql
-- Voir les statistiques réelles par région
SELECT 
    m.region,
    COUNT(DISTINCT m.id) as mairies,
    COUNT(DISTINCT n.id) as naissances,
    COUNT(DISTINCT ma.id) as mariages,
    COUNT(DISTINCT d.id) as deces,
    COUNT(DISTINCT r.id) as demandes
FROM mairies m
LEFT JOIN naissances n ON n.mairie_id = m.id
LEFT JOIN mariages ma ON ma.mairie_id = m.id
LEFT JOIN deces d ON d.mairie_id = m.id
LEFT JOIN requests r ON r.mairie_id = m.id
WHERE m.region IS NOT NULL
GROUP BY m.region
ORDER BY (COUNT(DISTINCT n.id) + COUNT(DISTINCT r.id)) DESC;
```

**Résultat attendu :**
```
region        | mairies | naissances | mariages | deces | demandes
--------------|---------|------------|----------|-------|----------
Abidjan       | 8       | 5          | 2        | 1     | 12
Yamoussoukro  | 4       | 3          | 1        | 0     | 8
```

### **Étape 2 : Comparer avec le Graphique**

Si le SQL montre **5 naissances** pour Abidjan mais le graphique affiche **120**, alors :

**→ Il y a des données de test dans votre base !**

---

## 🛠️ **SOLUTIONS**

### **Solution 1 : Nettoyer les Données de Test**

Si vous avez des données de test, supprimez-les :

```sql
-- ATTENTION : Cela supprime TOUTES les données !
-- À n'exécuter que si vous voulez repartir de zéro

-- Supprimer les naissances de test
DELETE FROM naissances WHERE created_at < '2026-01-01';

-- Supprimer les demandes de test
DELETE FROM requests WHERE created_at < '2026-01-01';

-- Ou supprimer TOUT (DANGER !)
TRUNCATE naissances, mariages, deces, requests CASCADE;
```

### **Solution 2 : Vérifier la Colonne mairie_id**

Les données doivent avoir un `mairie_id` valide :

```sql
-- Vérifier les données sans mairie
SELECT 
    'Naissances sans mairie' as type,
    COUNT(*) as total
FROM naissances
WHERE mairie_id IS NULL

UNION ALL

SELECT 
    'Demandes sans mairie' as type,
    COUNT(*) as total
FROM requests
WHERE mairie_id IS NULL;
```

Si vous voyez des chiffres > 0, ajoutez les mairie_id :

```sql
-- Exemple : Assigner une mairie par défaut
UPDATE naissances 
SET mairie_id = (SELECT id FROM mairies LIMIT 1)
WHERE mairie_id IS NULL;
```

### **Solution 3 : Forcer le Rechargement**

1. **Dans l'app** : Cliquez sur "🔄 Recharger"
2. **Dans le navigateur** : Ctrl + Shift + R
3. **Vider le cache** : F12 → Network → Disable cache

---

## 📊 **VÉRIFICATION FINALE**

### **Test 1 : Console du Navigateur**

Ouvrez F12 et cherchez :
```
📊 Récupération des données par région...
✅ 15 mairies trouvées
✅ 3 régions uniques trouvées
📊 Traitement de Abidjan avec 8 mairies
✅ Abidjan: { region: 'Abidjan', naissances: 5, demandes: 12 }
```

**Les chiffres dans les logs doivent correspondre au SQL !**

### **Test 2 : Comparer SQL vs Graphique**

| Source | Abidjan Naissances | Abidjan Demandes |
|---|---|---|
| **SQL** | 5 | 12 |
| **Logs Console** | 5 | 12 |
| **Graphique** | 5 ✅ | 12 ✅ |

Si tout correspond → **C'EST BON !** ✅

Si ça ne correspond pas → **Problème de cache ou données de test**

---

## 🐛 **PROBLÈMES COURANTS**

### **Problème 1 : "180 demandes" alors que SQL montre "12"**

**Cause :** Données de test dans la base

**Solution :** 
```sql
-- Voir d'où viennent ces 180 demandes
SELECT * FROM requests 
WHERE mairie_id IN (
  SELECT id FROM mairies WHERE region = 'Bouaké'
)
LIMIT 10;

-- Si ce sont des données de test, supprimez-les
DELETE FROM requests WHERE id IN (...);
```

### **Problème 2 : Le graphique ne change pas après rechargement**

**Cause :** Cache du navigateur

**Solution :**
1. Ctrl + Shift + R
2. F12 → Application → Clear storage
3. Fermer et rouvrir le navigateur

### **Problème 3 : "Aucune région trouvée"**

**Cause :** Les mairies n'ont pas de région

**Solution :**
```sql
-- Ajouter des régions aux mairies
UPDATE mairies SET region = 'Abidjan' WHERE ville = 'Abidjan';
UPDATE mairies SET region = 'Bouaké' WHERE ville = 'Bouaké';
```

---

## ✅ **CHECKLIST**

- [ ] Exécuter `verifier-donnees-regions.sql` dans Supabase
- [ ] Comparer les résultats SQL avec le graphique
- [ ] Vérifier les logs dans la console (F12)
- [ ] Cliquer sur "🔄 Recharger" dans l'app
- [ ] Vider le cache du navigateur (Ctrl+Shift+R)
- [ ] Vérifier que toutes les mairies ont une région
- [ ] Vérifier que toutes les naissances/demandes ont un mairie_id
- [ ] Supprimer les données de test si nécessaire

---

## 📞 **PROCHAINES ÉTAPES**

1. **Exécutez** `verifier-donnees-regions.sql`
2. **Partagez** les résultats (screenshot ou texte)
3. **Je vous dirai** exactement quoi faire ensuite

---

**💡 La clé est de comparer SQL vs Logs vs Graphique !**

**Si les 3 correspondent, c'est que les données sont correctes (même si elles semblent élevées).**

**Si elles ne correspondent pas, il y a un problème de cache ou de données de test.**
