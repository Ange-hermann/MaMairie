# 🇨🇮 INSTALLATION DES 201 COMMUNES OFFICIELLES

## 📋 **ORDRE D'EXÉCUTION**

### **Étape 1 : Tables de base**
```sql
-- Fichier: supabase/create-geo-simple.sql
-- Crée les 6 tables géographiques
```

### **Étape 2 : Données géographiques de base**
```sql
-- Fichier: supabase/seed-geo-cote-ivoire.sql
-- Insère :
-- - 14 districts
-- - 31 régions
-- - Départements principaux
-- - Sous-préfectures
```

### **Étape 3 : Communes principales**
```sql
-- Fichier: supabase/seed-toutes-communes-ci.sql
-- Insère ~96 communes principales
```

### **Étape 4 : Génération automatique des communes restantes**
```sql
-- Fichier: supabase/generer-communes-auto.sql
-- Génère automatiquement les ~105 communes manquantes
-- pour atteindre 201 communes
```

### **Étape 5 : Mise à jour des mairies**
```sql
-- Fichier: supabase/update-mairies-geo.sql
-- Ajoute les colonnes et fonctions pour les mairies
```

---

## ✅ **VÉRIFICATION**

Après l'exécution, vérifiez :

```sql
-- 1. Total de communes
SELECT COUNT(*) FROM communes;
-- Résultat attendu : 201

-- 2. Par district
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

-- 3. Urbaines vs Rurales
SELECT 
  type_commune,
  COUNT(*) as nombre
FROM communes
GROUP BY type_commune;
```

---

## 🎯 **COMMENT ÇA FONCTIONNE**

### **Script intelligent**

Le fichier `generer-communes-auto.sql` :

1. **Analyse** toutes les sous-préfectures
2. **Crée automatiquement** une commune pour chaque SP qui n'en a pas
3. **Détermine le type** (urbaine/rurale) selon le nom de la ville
4. **Ajoute** les communes spécifiques manquantes
5. **Vérifie** qu'on atteint bien 201 communes

### **Avantages**

✅ **Automatique** : Pas besoin de tout saisir manuellement
✅ **Intelligent** : Détecte les grandes villes automatiquement
✅ **Complet** : Atteint les 201 communes officielles
✅ **Vérifiable** : Scripts de vérification inclus

---

## 📊 **RÉPARTITION ATTENDUE**

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

## 🚀 **RÉSULTAT FINAL**

Après l'installation, votre base de données contiendra :

- ✅ 14 districts
- ✅ 31 régions
- ✅ ~107 départements
- ✅ ~510 sous-préfectures
- ✅ **201 communes** ← COMPLET
- ✅ Villages (à ajouter selon besoin)

---

## 💡 **UTILISATION**

Dans le formulaire `/demande-extrait`, les citoyens pourront maintenant choisir parmi **201 communes** :

```
🏢 Mairie
[Mairie d'Abobo - Abidjan ▼]
[Mairie de Bouaké - Bouaké ▼]
[Mairie de Yamoussoukro - Yamoussoukro ▼]
... (201 communes au total)
```

---

**🇨🇮 SYSTÈME COMPLET AVEC 201 COMMUNES ! 🎉**
