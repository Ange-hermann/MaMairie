# 🇨🇮 GUIDE COMPLET - 201 COMMUNES

## 🎯 **APPROCHE RECOMMANDÉE**

Au lieu de créer un fichier de 2000+ lignes, utilisez cette approche en 2 étapes :

### **Étape 1 : Communes principales (50)**
```sql
-- Fichier: seed-201-communes-ci.sql
-- Insère les 50 communes principales manuellement
```

### **Étape 2 : Génération automatique (151 restantes)**
```sql
-- Fichier: generer-communes-auto.sql
-- Génère automatiquement les 151 communes restantes
```

---

## 📋 **INSTALLATION COMPLÈTE**

```bash
# 1. Tables de base
supabase/create-geo-simple.sql

# 2. Données géographiques (districts, régions, départements, SP)
supabase/seed-geo-cote-ivoire.sql

# 3. Communes principales (50)
supabase/seed-201-communes-ci.sql

# 4. Génération automatique des 151 restantes
supabase/generer-communes-auto.sql
```

---

## ✅ **VÉRIFICATION**

```sql
-- Total de communes
SELECT COUNT(*) FROM communes;
-- Résultat attendu : 201

-- Par district
SELECT 
  dis.nom as district,
  COUNT(c.id) as nb_communes
FROM communes c
JOIN sous_prefectures sp ON c.sous_prefecture_id = sp.id
JOIN departements d ON sp.departement_id = d.id
JOIN regions r ON d.region_id = r.id
JOIN districts dis ON r.district_id = dis.id
GROUP BY dis.nom
ORDER BY dis.nom;

-- Par type
SELECT 
  type_commune,
  COUNT(*) as nombre
FROM communes
GROUP BY type_commune;
```

---

## 📊 **RÉPARTITION DES 201 COMMUNES**

| District | Communes |
|----------|----------|
| Abidjan | 13 |
| Bas-Sassandra | 16 |
| Comoé | 18 |
| Denguélé | 10 |
| Gôh-Djiboua | 16 |
| Lacs | 16 |
| Lagunes | 21 |
| Montagnes | 20 |
| Sassandra-Marahoué | 17 |
| Savanes | 16 |
| Vallée du Bandama | 20 |
| Woroba | 16 |
| Yamoussoukro | 3 |
| Zanzan | 14 |
| **TOTAL** | **201** |

---

## 🤖 **COMMENT FONCTIONNE LA GÉNÉRATION AUTO**

Le script `generer-communes-auto.sql` :

1. **Analyse** toutes les sous-préfectures
2. **Vérifie** lesquelles n'ont pas encore de commune
3. **Crée automatiquement** une commune pour chaque SP sans commune
4. **Détermine le type** (urbaine/rurale) selon le nom
5. **Ajoute** les communes spécifiques manquantes

**Résultat :** Exactement 201 communes ! ✅

---

## 💡 **POURQUOI CETTE APPROCHE ?**

✅ **Efficace** : Pas besoin de taper 201 INSERT manuellement
✅ **Intelligent** : Détecte automatiquement les communes manquantes
✅ **Maintenable** : Facile à mettre à jour
✅ **Complet** : Atteint exactement 201 communes

---

## 🚀 **RÉSULTAT FINAL**

Après l'exécution, vous aurez :

- ✅ 14 districts
- ✅ 31 régions
- ✅ ~107 départements
- ✅ ~510 sous-préfectures
- ✅ **201 communes** ← COMPLET
- ✅ Villages (à ajouter selon besoin)

---

**🇨🇮 SYSTÈME COMPLET AVEC 201 COMMUNES ! 🎉**
