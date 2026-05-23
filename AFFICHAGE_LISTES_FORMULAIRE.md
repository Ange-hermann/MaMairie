# ✅ AFFICHAGE DES LISTES DANS LE FORMULAIRE

## 🔧 **PROBLÈME**

Les listes déroulantes du formulaire `/demande-extrait` n'affichent pas les communes et sous-préfectures ajoutées dans la base de données.

---

## ✅ **SOLUTION APPLIQUÉE**

### **1. Ajout de states**

```typescript
const [mairies, setMairies] = useState<any[]>([])
const [communes, setCommunes] = useState<any[]>([])         // NOUVEAU
const [sousPrefectures, setSousPrefectures] = useState<any[]>([])  // NOUVEAU
```

### **2. Chargement depuis la base de données**

```typescript
// Charger les communes
const { data: communesData } = await supabase
  .from('communes')
  .select('id, nom, sous_prefectures(nom)')
  .order('nom')

if (communesData) {
  setCommunes(communesData.map(c => ({
    value: c.id,
    label: `Commune de ${c.nom}`,
    type: 'commune'
  })))
}

// Charger les sous-préfectures
const { data: sousPrefData } = await supabase
  .from('sous_prefectures')
  .select('id, nom, departements(nom)')
  .order('nom')

if (sousPrefData) {
  setSousPrefectures(sousPrefData.map(sp => ({
    value: sp.id,
    label: `Sous-préfecture de ${sp.nom}`,
    type: 'sous_prefecture'
  })))
}
```

### **3. Utilisation dans les dropdowns**

```tsx
{/* Mode Mairie */}
{formData.selection_mode === 'mairie' && (
  <Select
    label="Sélectionnez votre mairie"
    options={mairies}  // Liste des mairies
    ...
  />
  <p>{mairies.length} mairie(s) disponible(s)</p>
)}

{/* Mode Sous-préfecture */}
{formData.selection_mode === 'sous_prefecture' && (
  <Select
    label="Sélectionnez votre sous-préfecture"
    options={sousPrefectures}  // Liste des SP
    ...
  />
  <p>{sousPrefectures.length} sous-préfecture(s) disponible(s)</p>
)}
```

---

## 🔍 **VÉRIFICATION**

### **Dans la console du navigateur (F12)**

Vous devriez voir :
```
Communes chargées: [{id: "...", nom: "Abobo", ...}, ...]
Sous-préfectures chargées: [{id: "...", nom: "Cocody", ...}, ...]
```

### **Dans le formulaire**

Vous devriez voir :
```
🏢 Mairie
[Sélectionnez votre mairie ▼]
15 mairie(s) disponible(s)

🏘️ Sous-préfecture
[Sélectionnez votre sous-préfecture ▼]
510 sous-préfecture(s) disponible(s)
```

---

## ⚠️ **SI LES LISTES SONT VIDES**

### **Vérifiez dans Supabase :**

```sql
-- Vérifier les communes
SELECT COUNT(*) FROM communes;
-- Devrait retourner > 0

-- Vérifier les sous-préfectures
SELECT COUNT(*) FROM sous_prefectures;
-- Devrait retourner > 0

-- Vérifier les mairies
SELECT COUNT(*) FROM mairies;
-- Devrait retourner > 0
```

### **Si les tables sont vides :**

Exécutez les scripts dans l'ordre :
```bash
1. supabase/create-geo-simple.sql
2. supabase/seed-geo-cote-ivoire.sql
3. supabase/nettoyer-et-inserer-sous-prefectures.sql
4. supabase/nettoyer-et-inserer-communes.sql
```

---

## 🎯 **RÉSULTAT ATTENDU**

Après les corrections, le formulaire affiche :

```
┌─────────────────────────────────────────────┐
│ 📍 Où se trouve votre acte ?                │
├─────────────────────────────────────────────┤
│ [🏢 Mairie] [🏘️ Sous-préf.] [🏡 Village]   │
│                                              │
│ Sélectionnez votre mairie :                 │
│ [Mairie d'Abobo - Abidjan ▼]                │
│ [Mairie de Cocody - Abidjan ▼]              │
│ [Mairie de Bouaké - Bouaké ▼]               │
│ ...                                          │
│ 15 mairie(s) disponible(s)                  │
└─────────────────────────────────────────────┘
```

Ou :

```
┌─────────────────────────────────────────────┐
│ 📍 Où se trouve votre acte ?                │
├─────────────────────────────────────────────┤
│ [🏢 Mairie] [🏘️ Sous-préf.] [🏡 Village]   │
│                                              │
│ Sélectionnez votre sous-préfecture :        │
│ [Sous-préfecture de Cocody ▼]               │
│ [Sous-préfecture d'Abobo ▼]                 │
│ [Sous-préfecture de Yopougon ▼]             │
│ ...                                          │
│ 510 sous-préfecture(s) disponible(s)        │
└─────────────────────────────────────────────┘
```

---

**✅ LES LISTES SONT MAINTENANT CHARGÉES DEPUIS LA BASE DE DONNÉES ! 🎉**
