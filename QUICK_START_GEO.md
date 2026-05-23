# 🚀 DÉMARRAGE RAPIDE - SYSTÈME GÉOGRAPHIQUE

## ⚡ **INSTALLATION EN 3 ÉTAPES**

### **ÉTAPE 1 : Créer les tables (2 minutes)**

Allez sur **Supabase** → **SQL Editor** et exécutez dans l'ordre :

```sql
-- 1. Tables géographiques
-- Fichier: supabase/create-geo-simple.sql
-- Copier-coller tout le contenu et exécuter
```

**Résultat attendu :** ✅ 6 tables créées

---

### **ÉTAPE 2 : Charger les données (1 minute)**

```sql
-- 2. Données de Côte d'Ivoire
-- Fichier: supabase/seed-geo-cote-ivoire.sql
-- Copier-coller tout le contenu et exécuter
```

**Résultat attendu :** 
- ✅ 14 districts
- ✅ 31 régions
- ✅ 20+ départements
- ✅ 10+ sous-préfectures
- ✅ 10+ communes
- ✅ 9+ villages

---

### **ÉTAPE 3 : Mettre à jour les mairies (1 minute)**

```sql
-- 3. Fonctions et colonnes mairies
-- Fichier: supabase/update-mairies-geo.sql
-- Copier-coller tout le contenu et exécuter
```

**Résultat attendu :** 
- ✅ 3 colonnes ajoutées à `mairies`
- ✅ 2 fonctions créées
- ✅ 1 vue créée

---

## ✅ **VÉRIFICATION**

Exécutez ce test :

```sql
-- Fichier: supabase/test-geo-functions.sql
-- Copier-coller et exécuter
```

**Résultat attendu :** Tous les tests passent ✅

---

## 🎯 **UTILISATION**

### **Dans un formulaire citoyen :**

```tsx
import { GeoSelector } from '@/components/GeoSelector'

<GeoSelector
  onSelect={(selection) => setLocalisation(selection)}
  required
  showVillage={true}
/>
```

### **Pour créer un agent :**

```tsx
// Page: /ministere/agents/nouveau
// Le formulaire est déjà créé !
// Il suffit de naviguer vers cette page
```

### **Pour faire une demande :**

```tsx
// Page: /citoyen/demande-extrait-geo
// Le formulaire est déjà créé !
// Il suffit de naviguer vers cette page
```

---

## 🔧 **DÉPANNAGE**

### **Erreur : "table does not exist"**

✅ **Solution :** Exécutez d'abord `create-geo-simple.sql`

### **Erreur : "foreign key constraint"**

✅ **Solution :** Exécutez les scripts dans l'ordre (1 → 2 → 3)

### **Erreur : "function does not exist"**

✅ **Solution :** Exécutez `update-mairies-geo.sql`

### **Pas de données**

✅ **Solution :** Exécutez `seed-geo-cote-ivoire.sql`

---

## 📊 **STRUCTURE**

```
District (14)
  └─ Région (31)
      └─ Département (107)
          └─ Sous-préfecture (510)
              └─ Commune (201)
                  └─ Village (8000+)
```

---

## 🎉 **C'EST TOUT !**

Votre système géographique est maintenant opérationnel ! 🇨🇮🗺️

**Pages disponibles :**
- `/citoyen/demande-extrait-geo` - Demande avec géolocalisation
- `/ministere/agents/nouveau` - Création d'agent

**Composants disponibles :**
- `<GeoSelector />` - Sélecteur en cascade
- `<GeoBreadcrumb />` - Breadcrumb géographique

**Fonctions SQL disponibles :**
- `get_mairie_competente(village_id)` - Trouve la mairie
- `get_villages_mairie(mairie_id)` - Liste les villages
- `search_villages(query)` - Recherche villages

---

**🚀 PRÊT À UTILISER !**
