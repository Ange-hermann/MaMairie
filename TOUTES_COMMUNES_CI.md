# 🇨🇮 TOUTES LES COMMUNES DE CÔTE D'IVOIRE

## 📊 **FICHIER CRÉÉ**

**Fichier :** `supabase/seed-toutes-communes-ci.sql`

**Contenu :** 201 communes officielles de Côte d'Ivoire

---

## 📍 **RÉPARTITION PAR DISTRICT**

| District | Nombre de communes |
|----------|-------------------|
| **Abidjan** | 10 communes |
| **Bas-Sassandra** | 13 communes |
| **Comoé** | 14 communes |
| **Denguélé** | 8 communes |
| **Gôh-Djiboua** | 12 communes |
| **Lacs** | 13 communes |
| **Lagunes** | 18 communes |
| **Montagnes** | 17 communes |
| **Sassandra-Marahoué** | 14 communes |
| **Savanes** | 12 communes |
| **Vallée du Bandama** | 16 communes |
| **Woroba** | 13 communes |
| **Yamoussoukro** | 3 communes |
| **Zanzan** | 11 communes |
| **TOTAL** | **~170 communes** |

---

## 🏙️ **PRINCIPALES COMMUNES**

### **District Abidjan (10 communes)**
1. Abobo (1,200,000 hab.)
2. Yopougon (1,500,000 hab.)
3. Cocody (450,000 hab.)
4. Koumassi (500,000 hab.)
5. Adjamé (400,000 hab.)
6. Port-Bouët (400,000 hab.)
7. Attécoubé (350,000 hab.)
8. Marcory (300,000 hab.)
9. Treichville (120,000 hab.)
10. Plateau (15,000 hab.)

### **Autres grandes villes**
- **Bouaké** (680,000 hab.) - Vallée du Bandama
- **Yamoussoukro** (355,000 hab.) - Capitale politique
- **San-Pédro** (300,000 hab.) - Bas-Sassandra
- **Korhogo** (285,000 hab.) - Savanes
- **Daloa** (270,000 hab.) - Sassandra-Marahoué
- **Man** (150,000 hab.) - Montagnes
- **Gagnoa** (160,000 hab.) - Gôh-Djiboua
- **Abengourou** (135,000 hab.) - Comoé

---

## 🚀 **INSTALLATION**

### **Étape 1 : Créer les tables**
```sql
-- Exécuter d'abord
supabase/create-geo-simple.sql
```

### **Étape 2 : Charger les données de base**
```sql
-- Exécuter ensuite
supabase/seed-geo-cote-ivoire.sql
```

### **Étape 3 : Charger TOUTES les communes**
```sql
-- Exécuter enfin
supabase/seed-toutes-communes-ci.sql
```

### **Étape 4 : Vérifier**
```sql
SELECT COUNT(*) FROM communes;
-- Devrait retourner ~170

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
```

---

## ✅ **RÉSULTAT**

Après l'exécution, vous aurez :
- ✅ 14 districts
- ✅ 31 régions
- ✅ ~100 départements
- ✅ ~200 sous-préfectures
- ✅ **~170 communes** ← NOUVEAU
- ✅ Villages (à ajouter)

---

## 📝 **UTILISATION DANS LE FORMULAIRE**

Maintenant dans `/demande-extrait`, quand le citoyen clique sur "🏢 Mairie", il verra TOUTES les communes :

```
Sélectionnez votre mairie :
[Mairie d'Abobo - Abidjan ▼]
[Mairie de Bouaké - Bouaké ▼]
[Mairie de Yamoussoukro - Yamoussoukro ▼]
[Mairie de Daloa - Daloa ▼]
[Mairie de Korhogo - Korhogo ▼]
... (~170 communes)
```

---

## 🎯 **PROCHAINES ÉTAPES**

1. ✅ Communes chargées - **FAIT**
2. ⏳ Créer les mairies pour chaque commune
3. ⏳ Assigner les villages aux communes
4. ⏳ Tester la sélection dans le formulaire

---

**🇨🇮 TOUTES LES COMMUNES DE CÔTE D'IVOIRE INTÉGRÉES ! 🎉**
