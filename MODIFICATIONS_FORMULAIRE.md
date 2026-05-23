# ✅ MODIFICATIONS FORMULAIRE DEMANDE D'EXTRAIT

## 📝 **FICHIER MODIFIÉ**

**Fichier :** `/app/demande-extrait/page.tsx`

---

## 🔄 **CHANGEMENTS APPLIQUÉS**

### **1️⃣ Imports ajoutés**

```typescript
import { GeoSelector } from '@/components/GeoSelector'
import { GeoBreadcrumb } from '@/components/GeoBreadcrumb'
import type { GeoSelection } from '@/types/geo'
import { formatGeoSelection } from '@/lib/geoHelpers'
import { MapPin, AlertCircle } from 'lucide-react'
```

---

### **2️⃣ States ajoutés**

```typescript
const [localisation, setLocalisation] = useState<GeoSelection>({})
const [mairieCompetente, setMairieCompetente] = useState<any>(null)
const [loadingMairie, setLoadingMairie] = useState(false)
```

---

### **3️⃣ useEffect pour trouver la mairie compétente**

```typescript
useEffect(() => {
  const findMairieCompetente = async () => {
    if (!localisation.village_id && !localisation.commune_id) {
      setMairieCompetente(null)
      return
    }

    setLoadingMairie(true)
    try {
      // Si un village est sélectionné, utiliser la fonction SQL
      if (localisation.village_id) {
        const { data, error } = await supabase
          .rpc('get_mairie_competente', { village_uuid: localisation.village_id })

        if (error) throw error

        if (data && data.length > 0) {
          setMairieCompetente(data[0])
          setFormData(prev => ({ ...prev, mairie_id: data[0].mairie_id }))
        }
      } 
      // Sinon chercher par commune
      else if (localisation.commune_id) {
        // ... logique de recherche par commune
      }
    } catch (err: any) {
      console.error('Erreur mairie:', err)
    } finally {
      setLoadingMairie(false)
    }
  }

  findMairieCompetente()
}, [localisation])
```

---

### **4️⃣ Données géographiques dans la soumission**

```typescript
const requestData: any = {
  // ... autres champs
  // Données géographiques AJOUTÉES
  commune_id: localisation.commune_id || null,
  village_id: localisation.village_id || null,
  sous_prefecture_id: localisation.sous_prefecture_id || null,
  localisation_complete: localisation.commune_id ? formatGeoSelection(localisation) : null,
}
```

---

### **5️⃣ Remplacement du Select "Mairie" par GeoSelector**

**AVANT :**
```tsx
<Select
  label="Mairie"
  options={mairies}
  value={formData.mairie_id}
  onChange={(e) => setFormData({ ...formData, mairie_id: e.target.value })}
  required
/>
```

**APRÈS :**
```tsx
<div className="border-2 border-orange-100 rounded-lg p-4 bg-orange-50/30">
  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
    <MapPin size={20} className="text-orange-500" />
    Localisation de l'acte
  </h3>
  
  <GeoSelector
    onSelect={setLocalisation}
    required
    showVillage={true}
    showDistrict={false}
  />

  {/* Breadcrumb de la sélection */}
  {localisation.commune_id && (
    <div className="mt-3">
      <GeoBreadcrumb selection={localisation} />
    </div>
  )}

  {/* Mairie compétente */}
  {mairieCompetente && !loadingMairie && (
    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-start gap-2">
        <MapPin className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
        <div>
          <p className="text-xs text-green-700 mb-1">Mairie compétente :</p>
          <p className="font-semibold text-green-900">
            {mairieCompetente.mairie_nom}
          </p>
          <p className="text-xs text-green-700 mt-1">
            Type : {mairieCompetente.type_rattachement === 'communale' ? 'Mairie communale' : 'Mairie sous-préfectorale'}
          </p>
        </div>
      </div>
    </div>
  )}
</div>
```

---

### **6️⃣ Bouton de soumission modifié**

```typescript
<Button
  type="submit"
  variant="primary"
  disabled={loading || !documentUrl || !mairieCompetente}  // ← Ajout de !mairieCompetente
  className="flex-1"
>
  {loading ? 'Soumission en cours...' : 'Soumettre la Demande'}
</Button>
```

---

## 🎯 **RÉSULTAT VISUEL**

### **Avant :**
```
[Nom] [Prénom]
[Date de naissance] [Lieu de naissance]
[Téléphone]
[Mairie ▼]  ← Simple dropdown
[Upload document]
[Soumettre]
```

### **Après :**
```
[Nom] [Prénom]
[Date de naissance] [Lieu de naissance]
[Téléphone]

┌─────────────────────────────────────────────┐
│ 📍 Localisation de l'acte                   │
├─────────────────────────────────────────────┤
│ 🗺️ Région: [Sélectionner ▼]                │
│ 📍 Département: [Sélectionner ▼]            │
│ 🏘️ Sous-préfecture: [Sélectionner ▼]       │
│ 🏙️ Commune: [Sélectionner ▼]               │
│ 🏡 Village: [Sélectionner ▼]                │
│                                              │
│ 🗺️ Abidjan → Abidjan → Cocody → Cocody    │
│                                              │
│ ✅ Mairie compétente :                      │
│    Mairie de Cocody                         │
│    Type : Mairie communale                  │
└─────────────────────────────────────────────┘

[Upload document]
[Soumettre] ← Désactivé tant que pas de mairie trouvée
```

---

## 🔄 **WORKFLOW**

```
1. CITOYEN remplit le formulaire
   ↓
2. Sélectionne sa localisation avec GeoSelector
   - Région → Département → SP → Commune → Village
   ↓
3. SYSTÈME cherche automatiquement la mairie compétente
   - Si village : utilise get_mairie_competente()
   - Sinon : cherche par commune
   ↓
4. AFFICHE la mairie trouvée
   - Nom de la mairie
   - Type (communale ou sous-préfectorale)
   ↓
5. CITOYEN peut soumettre
   - Bouton activé seulement si mairie trouvée
   ↓
6. SOUMISSION avec toutes les données géographiques
   - commune_id
   - village_id
   - sous_prefecture_id
   - localisation_complete (texte formaté)
```

---

## ✅ **AVANTAGES**

1. **Précision géographique** : Jusqu'au village
2. **Recherche automatique** : Mairie trouvée automatiquement
3. **Validation** : Impossible de soumettre sans mairie
4. **UX améliorée** : Breadcrumb visuel
5. **Données complètes** : Toute la hiérarchie géographique sauvegardée

---

## 🎉 **FORMULAIRE MODIFIÉ ET OPÉRATIONNEL !**

Le formulaire `/demande-extrait` utilise maintenant le système géographique complet ! 🗺️✨
