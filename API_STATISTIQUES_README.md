# 📊 API Statistiques Nationales - Documentation

## ✅ **API Créée**

### **Endpoint**
```
GET /api/statistiques-nationales
POST /api/statistiques-nationales
```

---

## 🚀 **Utilisation**

### **1. GET - Récupérer toutes les statistiques**

```javascript
const response = await fetch('/api/statistiques-nationales')
const result = await response.json()

console.log(result.data)
```

### **Réponse**
```json
{
  "success": true,
  "data": {
    "globales": {
      "naissances": { "total": 1250 },
      "mariages": { "total": 450 },
      "deces": { "total": 320 },
      "demandes": {
        "total": 890,
        "en_attente": 120,
        "validees": 650,
        "rejetees": 120
      },
      "mairies": {
        "total": 45,
        "actives": 42
      },
      "agents": {
        "total": 180
      }
    },
    "population_par_mairie": [
      {
        "mairie_id": "uuid",
        "nom_mairie": "Mairie de Cocody",
        "ville": "Abidjan",
        "region": "Lagunes",
        "naissances": 350,
        "mariages": 120,
        "deces": 45,
        "population_estimee": 17050
      },
      ...
    ],
    "repartition_regions": [...],
    "evolution_mensuelle": [...]
  },
  "timestamp": "2024-05-19T04:37:00.000Z"
}
```

---

## 📊 **Données Disponibles**

### **1. Statistiques Globales**
- Total naissances, mariages, décès
- Demandes (total, en attente, validées, rejetées)
- Mairies (total, actives)
- Agents (total)

### **2. Population par Mairie** ✅ NOUVEAU
- Nom de la mairie
- Ville et région
- Nombre de naissances
- Nombre de mariages
- Nombre de décès
- **Population estimée** (naissances × 50 - décès × 10)

### **3. Répartition par Région**
- Activité par région
- Naissances, mariages, décès par région

### **4. Évolution Mensuelle**
- 12 derniers mois
- Naissances, mariages, décès par mois

---

## 🔐 **Authentification**

L'API nécessite une authentification Supabase :

```javascript
// Automatique si l'utilisateur est connecté
const response = await fetch('/api/statistiques-nationales', {
  headers: {
    'Content-Type': 'application/json'
  }
})
```

---

## 📱 **Intégration dans la Page**

### **Page Statistiques Nationales**
`/ministere/statistiques`

**Nouvelles fonctionnalités :**
1. ✅ Population estimée par mairie
2. ✅ Top 20 mairies par population
3. ✅ Statistiques globales de population
4. ✅ Naissances, mariages, décès par mairie
5. ✅ API REST pour accès externe

---

## 🧪 **Tests**

### **Test 1 : Appel API**
```bash
# Dans le navigateur (console)
fetch('/api/statistiques-nationales')
  .then(r => r.json())
  .then(console.log)
```

### **Test 2 : Page Statistiques**
1. Aller sur `/ministere/statistiques`
2. Scroller vers le bas
3. Voir la section "Population Estimée par Mairie"
4. ✅ Tableau avec 20 mairies

---

## 📈 **Formule de Population**

```
Population Estimée = (Naissances × 50) - (Décès × 10)
```

**Explication :**
- Chaque naissance représente ~50 personnes (famille élargie)
- Chaque décès réduit de ~10 personnes
- Estimation approximative pour visualisation

---

## 🔧 **Personnalisation**

### **Modifier la formule de population**

Dans `app/api/statistiques-nationales/route.ts` :

```typescript
population_estimee: Math.max(0, (item.naissances * 50) - (item.deces * 10))
```

Changez les multiplicateurs selon vos besoins.

### **Ajouter des filtres**

```typescript
// POST /api/statistiques-nationales
{
  "periode": "mois",
  "date_debut": "2024-01-01",
  "date_fin": "2024-12-31"
}
```

---

## 📊 **Utilisation Externe**

### **Exemple : Dashboard externe**

```javascript
// Dans une autre application
const API_URL = 'https://mamaireci.netlify.app/api/statistiques-nationales'

async function getStats() {
  const response = await fetch(API_URL, {
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN'
    }
  })
  
  const data = await response.json()
  return data
}
```

---

## ✅ **Résumé**

| Fonctionnalité | Statut |
|---|---|
| API GET Statistiques | ✅ Opérationnel |
| Population par Mairie | ✅ Opérationnel |
| Interface UI | ✅ Opérationnel |
| Authentification | ✅ Opérationnel |
| Données en temps réel | ✅ Opérationnel |

---

## 🎯 **Prochaines Améliorations**

- [ ] Filtrage par période (POST)
- [ ] Export CSV/Excel
- [ ] Graphiques de population
- [ ] Prédictions démographiques
- [ ] Comparaison entre mairies
- [ ] API publique (sans auth)

---

**✅ L'API Statistiques Nationales est opérationnelle ! 🎉**
