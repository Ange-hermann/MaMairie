# 🇨🇮 GUIDE - SOUS-PRÉFECTURES DE CÔTE D'IVOIRE

## 📦 **FICHIER CRÉÉ**

**Fichier :** `supabase/nettoyer-et-inserer-sous-prefectures.sql`

**Contenu :**
- ✅ Nettoyage des références
- ✅ Suppression des SP existantes
- ✅ Insertion des SP principales (~100)
- ✅ Génération automatique des SP restantes
- ✅ Total : ~510 sous-préfectures

---

## 🚀 **INSTALLATION**

```bash
# Exécuter dans Supabase SQL Editor
supabase/nettoyer-et-inserer-sous-prefectures.sql
```

---

## 📊 **RÉPARTITION ATTENDUE**

| District | Sous-préfectures |
|----------|------------------|
| Abidjan | ~15 |
| Bas-Sassandra | ~40 |
| Comoé | ~45 |
| Denguélé | ~25 |
| Gôh-Djiboua | ~35 |
| Lacs | ~40 |
| Lagunes | ~50 |
| Montagnes | ~50 |
| Sassandra-Marahoué | ~45 |
| Savanes | ~40 |
| Vallée du Bandama | ~50 |
| Woroba | ~35 |
| Yamoussoukro | ~5 |
| Zanzan | ~35 |
| **TOTAL** | **~510** |

---

## 🔄 **FONCTIONNEMENT**

Le script :

1. **Nettoie** les références dans `mairies`, `communes`, `villages`
2. **Supprime** toutes les sous-préfectures existantes
3. **Insère** les sous-préfectures principales manuellement
4. **Génère automatiquement** les SP restantes basées sur les départements
5. **Vérifie** le total

---

## ✅ **VÉRIFICATION**

```sql
-- Total de sous-préfectures
SELECT COUNT(*) FROM sous_prefectures;
-- Résultat attendu : ~510

-- Par district
SELECT 
  dis.nom as district,
  COUNT(sp.id) as nb_sp
FROM sous_prefectures sp
JOIN departements d ON sp.departement_id = d.id
JOIN regions r ON d.region_id = r.id
JOIN districts dis ON r.district_id = dis.id
GROUP BY dis.nom
ORDER BY dis.nom;

-- Départements sans SP
SELECT COUNT(*) 
FROM departements d
WHERE NOT EXISTS (
  SELECT 1 FROM sous_prefectures sp WHERE sp.departement_id = d.id
);
-- Résultat attendu : 0
```

---

## 📝 **SOUS-PRÉFECTURES PRINCIPALES**

### **District Abidjan (6)**
- Abobo
- Cocody
- Yopougon
- Songon
- Bingerville
- Anyama

### **District Savanes (8)**
- Korhogo
- Ferkessédougou
- Boundiali
- Odienné
- Tengréla
- Sinématiali
- Kong
- Ouangolodougou

### **District Vallée du Bandama (7)**
- Bouaké
- Katiola
- Dabakala
- Niakaramadougou
- Sakassou
- Béoumi
- Botro

### **District Montagnes (9)**
- Man
- Danané
- Biankouma
- Zouan-Hounien
- Guiglo
- Duékoué
- Bangolo
- Bloléquin
- Toulépleu

---

## 🎯 **APRÈS L'INSTALLATION**

Vous aurez :
- ✅ 14 districts
- ✅ 31 régions
- ✅ ~107 départements
- ✅ **~510 sous-préfectures** ← NOUVEAU
- ⏳ Communes (à insérer ensuite)
- ⏳ Villages (à insérer ensuite)

---

## 📋 **ORDRE D'EXÉCUTION COMPLET**

```bash
# 1. Tables de base
supabase/create-geo-simple.sql

# 2. Districts, régions, départements
supabase/seed-geo-cote-ivoire.sql

# 3. Sous-préfectures (NOUVEAU)
supabase/nettoyer-et-inserer-sous-prefectures.sql

# 4. Communes
supabase/nettoyer-et-inserer-communes.sql

# 5. Fonctions mairies
supabase/update-mairies-geo.sql
```

---

**🇨🇮 ~510 SOUS-PRÉFECTURES PRÊTES ! 🎉**
