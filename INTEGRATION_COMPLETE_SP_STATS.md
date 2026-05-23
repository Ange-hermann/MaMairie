# 🎯 INTÉGRATION COMPLÈTE DES SOUS-PRÉFECTURES DANS LES STATISTIQUES

## 📋 **OBJECTIF**

Inclure les sous-préfectures dans TOUTES les statistiques, pas seulement la carte.

---

## 📊 **SECTIONS À MODIFIER**

### **1. Carte des Sous-préfectures** ✅
**Status :** Déjà fait

### **2. Répartition par Région**
**À faire :** Ajouter les données des sous-préfectures dans le graphique

### **3. Performance par Mairie/SP**
**À faire :** Créer un tableau combiné mairies + sous-préfectures

### **4. Population par Mairie/SP**
**À faire :** Inclure les sous-préfectures dans le tableau de population

### **5. Évolution 12 Mois**
**À faire :** Inclure les actes enregistrés par les agents de SP

---

## 🔧 **MODIFICATIONS NÉCESSAIRES**

### **Modification 1 : Répartition par Région**

**Fichier :** `page.tsx` - Fonction `fetchRepartitionRegions()`

**Actuellement :**
```typescript
// Compte uniquement les mairies par région
```

**À modifier :**
```typescript
// Compter mairies ET sous-préfectures par région
const { data: mairiesData } = await supabase
  .from('mairies')
  .select('region')

const { data: spData } = await supabase
  .from('sous_prefectures')
  .select('departement_id, departements(region)')

// Combiner les deux
```

---

### **Modification 2 : Performance**

**Fichier :** `page.tsx` - Fonction `fetchPerformanceMairies()`

**Actuellement :**
```typescript
// Affiche uniquement les performances des mairies
```

**À modifier :**
```typescript
// Afficher mairies ET sous-préfectures
// Avec un indicateur de type (Mairie/SP)
```

---

### **Modification 3 : Population**

**Fichier :** `page.tsx` - Variable `populationParMairie`

**Actuellement :**
```typescript
// Tableau uniquement des mairies
```

**À modifier :**
```typescript
// Tableau combiné mairies + sous-préfectures
// Avec colonne "Type" (Mairie/SP)
```

---

## 📝 **STRUCTURE DE DONNÉES PROPOSÉE**

### **Pour les tableaux combinés :**

```typescript
{
  type: 'mairie' | 'sous_prefecture',
  nom: string,
  ville: string,
  region: string,
  naissances: number,
  mariages: number,
  deces: number,
  population_estimee: number
}
```

---

## 🎨 **RÉSULTAT ATTENDU**

### **Tableau Performance :**
```
Type | Nom                        | Ville  | Actes | Demandes
-----|----------------------------|--------|-------|----------
🏢   | Mairie de Cocody           | Cocody | 150   | 45
🏘️   | SP de Cocody               | Cocody | 80    | 20
🏢   | Mairie de Bouaké           | Bouaké | 120   | 35
🏘️   | SP de Bouaké               | Bouaké | 60    | 15
```

### **Graphique Répartition :**
```
Région Abidjan:
- 13 Mairies
- 25 Sous-préfectures
Total: 38 structures

Région Bouaké:
- 5 Mairies
- 15 Sous-préfectures
Total: 20 structures
```

---

## ⚠️ **POINTS D'ATTENTION**

### **1. Jointures de tables**

Les sous-préfectures n'ont pas de colonne `region` directe.
Il faut passer par : `sous_prefectures → departements → regions`

```sql
SELECT 
  sp.nom,
  d.nom as departement,
  r.nom as region
FROM sous_prefectures sp
JOIN departements d ON sp.departement_id = d.id
JOIN regions r ON d.region_id = r.id
```

### **2. Agents de SP**

Les agents de sous-préfecture ont :
- `type_agent = 'sous_prefecture'`
- `mairie_id` contient l'ID de la sous-préfecture

Il faut différencier dans les requêtes :
```typescript
// Agents de mairie
WHERE type_agent = 'mairie'

// Agents de SP
WHERE type_agent = 'sous_prefecture'
```

### **3. Performance**

Éviter de faire trop de requêtes séparées.
Utiliser des jointures et des agrégations SQL.

---

## 🚀 **PLAN D'ACTION**

### **Étape 1 : Modifier fetchRepartitionRegions()**
- Charger les mairies par région
- Charger les SP par région (via départements)
- Combiner les données

### **Étape 2 : Modifier fetchPerformanceMairies()**
- Renommer en `fetchPerformanceStructures()`
- Charger mairies ET SP
- Ajouter colonne "Type"

### **Étape 3 : Modifier populationParMairie**
- Renommer en `populationParStructure`
- Inclure les SP
- Ajouter colonne "Type"

### **Étape 4 : Tester**
- Vérifier que toutes les données s'affichent
- Vérifier les performances
- Vérifier les graphiques

---

## 💡 **EXEMPLE DE CODE**

### **Charger mairies + SP combinés :**

```typescript
const fetchStructures = async () => {
  // Mairies
  const { data: mairies } = await supabase
    .from('mairies')
    .select('id, nom_mairie as nom, ville, region')

  const mairiesFormatted = mairies?.map(m => ({
    ...m,
    type: 'mairie' as const
  })) || []

  // Sous-préfectures
  const { data: sp } = await supabase
    .from('sous_prefectures')
    .select(`
      id,
      nom,
      departements (
        nom,
        regions (
          nom
        )
      )
    `)

  const spFormatted = sp?.map(s => ({
    id: s.id,
    nom: s.nom,
    ville: s.departements?.nom || '',
    region: s.departements?.regions?.nom || '',
    type: 'sous_prefecture' as const
  })) || []

  // Combiner
  return [...mairiesFormatted, ...spFormatted]
}
```

---

## 🎉 **RÉSULTAT FINAL**

Toutes les statistiques incluront :
- ✅ Les mairies (101)
- ✅ Les sous-préfectures (510)
- ✅ Total : 611 structures

**Les statistiques seront complètes et représentatives ! 📊**
