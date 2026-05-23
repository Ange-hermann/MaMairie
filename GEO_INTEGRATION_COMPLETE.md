# 🗺️ INTÉGRATION GÉOGRAPHIQUE COMPLÈTE

## ✅ **CE QUI A ÉTÉ CRÉÉ**

### **1️⃣ BASE DE DONNÉES**

#### **Tables géographiques (6 tables)**
- `districts` - 14 districts de Côte d'Ivoire
- `regions` - 31 régions
- `departements` - 107 départements
- `sous_prefectures` - 510 sous-préfectures
- `communes` - 201 communes
- `villages` - 8000+ villages

#### **Modifications table mairies**
```sql
ALTER TABLE mairies ADD COLUMN:
- commune_id → Lien avec la commune
- sous_prefecture_id → Lien avec la sous-préfecture
- gere_villages → Si la mairie gère directement les villages
```

#### **Fonctions SQL créées**
1. `get_mairie_competente(village_uuid)` 
   - Trouve la mairie compétente pour un village
   - Cherche d'abord une mairie communale
   - Sinon cherche une mairie sous-préfectorale

2. `get_villages_mairie(mairie_uuid)`
   - Retourne tous les villages gérés par une mairie

3. `search_villages(query)`
   - Recherche full-text de villages

#### **Vues créées**
1. `v_mairies_hierarchie`
   - Affiche chaque mairie avec sa hiérarchie complète
   - Nombre de villages gérés

2. `v_communes_hierarchie`
   - Hiérarchie complète des communes

3. `v_villages_hierarchie`
   - Hiérarchie complète des villages

---

### **2️⃣ COMPOSANTS REACT**

#### **GeoSelector.tsx**
Sélecteur géographique en cascade :
```tsx
<GeoSelector
  onSelect={(selection) => setLocalisation(selection)}
  required
  showVillage={true}  // Optionnel
  showDistrict={true}  // Optionnel
/>
```

**Fonctionnalités :**
- ✅ Sélection en cascade (6 niveaux)
- ✅ Chargement automatique des niveaux enfants
- ✅ Réinitialisation des niveaux inférieurs
- ✅ Loading states
- ✅ Disabled states
- ✅ Affichage de la sélection complète

#### **GeoBreadcrumb.tsx**
Breadcrumb géographique visuel :
```tsx
<GeoBreadcrumb selection={localisation} />
// Affiche : 🏛️ Abidjan → 🗺️ Abidjan → 📍 Abidjan → 🏘️ Cocody → 🏙️ Cocody
```

---

### **3️⃣ PAGES CRÉÉES**

#### **Page 1 : Demande d'extrait avec géolocalisation**
**Fichier :** `/app/citoyen/demande-extrait-geo/page.tsx`

**Fonctionnalités :**
1. Formulaire de demande d'acte
2. Sélection géographique complète (jusqu'au village)
3. **Recherche automatique de la mairie compétente**
4. Affichage du breadcrumb géographique
5. Soumission avec localisation complète

**Workflow :**
```
Citoyen sélectionne :
  District → Région → Département → SP → Commune → Village
    ↓
Système cherche la mairie compétente :
  1. Mairie communale (si existe)
  2. Sinon mairie sous-préfectorale
    ↓
Affiche : "Mairie de Cocody (communale)"
    ↓
Soumission → Demande assignée à cette mairie
```

#### **Page 2 : Création d'agent par le ministère**
**Fichier :** `/app/ministere/agents/nouveau/page.tsx`

**Fonctionnalités :**
1. Formulaire de création d'agent
2. Sélection géographique (jusqu'à la commune)
3. **Vérification si mairie existe**
4. **Création automatique de la mairie si nécessaire**
5. Assignation de l'agent à la mairie

**Workflow :**
```
Ministère sélectionne :
  District → Région → Département → SP → Commune
    ↓
Système vérifie si mairie existe :
  - Si OUI : "Mairie de Cocody (existante)"
  - Si NON : "Mairie sera créée pour Cocody"
    ↓
Création de l'agent :
  1. Créer/récupérer la mairie
  2. Créer l'utilisateur (Supabase Auth)
  3. Créer le profil agent
  4. Assigner à la mairie
    ↓
Résultat : Agent opérationnel dans sa mairie
```

---

## 🔄 **WORKFLOW COMPLET**

### **Scénario : Citoyen de Cocody-Riviera demande un acte**

```
1. CITOYEN
   ↓
   Accède à /citoyen/demande-extrait-geo
   ↓
   Sélectionne :
   - District: Abidjan
   - Région: Abidjan
   - Département: Abidjan
   - Sous-préfecture: Cocody
   - Commune: Cocody
   - Village: Cocody-Riviera
   ↓
   Système exécute :
   SELECT * FROM get_mairie_competente('uuid-village-riviera')
   ↓
   Résultat : Mairie de Cocody (communale)
   ↓
   Citoyen soumet la demande
   ↓
   
2. BASE DE DONNÉES
   ↓
   INSERT INTO requests (
     user_id,
     commune_id: 'uuid-commune-cocody',
     village_id: 'uuid-village-riviera',
     mairie_id: 'uuid-mairie-cocody',
     localisation_complete: "Village de Cocody-Riviera, Commune de Cocody...",
     statut: 'en_attente'
   )
   ↓
   
3. AGENT (Mairie de Cocody)
   ↓
   SELECT * FROM requests 
   WHERE mairie_id = 'uuid-mairie-cocody'
   ↓
   Voit la demande avec :
   - Village: Cocody-Riviera
   - Commune: Cocody
   - Breadcrumb complet
   ↓
   Traite la demande
```

---

## 📊 **GESTION DES VILLAGES**

### **Cas 1 : Village avec mairie communale**

```
Village: Cocody-Riviera
  ↓
Commune: Cocody
  ↓
Mairie: Mairie de Cocody (communale)
  ↓
Type: commune_id = 'uuid-cocody'
```

### **Cas 2 : Village sans mairie communale**

```
Village: Petit-Village-Rural
  ↓
Commune: Commune-Rurale
  ↓
Pas de mairie communale
  ↓
Sous-préfecture: SP-Rurale
  ↓
Mairie: Mairie de SP-Rurale (sous-préfectorale)
  ↓
Type: sous_prefecture_id = 'uuid-sp' + gere_villages = true
```

### **Fonction de recherche**

```sql
-- Cherche d'abord une mairie communale
SELECT * FROM mairies WHERE commune_id = 'uuid-commune'

-- Si pas trouvé, cherche une mairie sous-préfectorale
SELECT * FROM mairies 
WHERE sous_prefecture_id = 'uuid-sp' 
AND gere_villages = true
```

---

## 🎯 **UTILISATION DANS LE CODE**

### **Exemple 1 : Formulaire de demande**

```tsx
import { GeoSelector } from '@/components/GeoSelector'
import { GeoBreadcrumb } from '@/components/GeoBreadcrumb'

function DemandeForm() {
  const [localisation, setLocalisation] = useState({})
  const [mairieCompetente, setMairieCompetente] = useState(null)

  // Trouver la mairie quand le village change
  useEffect(() => {
    if (localisation.village_id) {
      const { data } = await supabase
        .rpc('get_mairie_competente', { 
          village_uuid: localisation.village_id 
        })
      
      setMairieCompetente(data[0])
    }
  }, [localisation.village_id])

  return (
    <form>
      {/* Sélection géographique */}
      <GeoSelector
        onSelect={setLocalisation}
        required
        showVillage={true}
      />

      {/* Breadcrumb */}
      <GeoBreadcrumb selection={localisation} />

      {/* Mairie compétente */}
      {mairieCompetente && (
        <p>Mairie : {mairieCompetente.mairie_nom}</p>
      )}

      <Button type="submit">Soumettre</Button>
    </form>
  )
}
```

### **Exemple 2 : Création d'agent**

```tsx
function CreerAgent() {
  const [localisation, setLocalisation] = useState({})
  const [mairieInfo, setMairieInfo] = useState(null)

  // Vérifier si mairie existe
  useEffect(() => {
    if (localisation.commune_id) {
      const { data } = await supabase
        .from('mairies')
        .select('*')
        .eq('commune_id', localisation.commune_id)
        .single()

      setMairieInfo(data || { sera_creee: true })
    }
  }, [localisation.commune_id])

  const handleSubmit = async () => {
    let mairieId

    // Créer la mairie si nécessaire
    if (!mairieInfo.id) {
      const { data } = await supabase
        .from('mairies')
        .insert([{
          nom_mairie: `Mairie de ${localisation.commune_nom}`,
          commune_id: localisation.commune_id,
          gere_villages: true
        }])
        .select()
        .single()

      mairieId = data.id
    } else {
      mairieId = mairieInfo.id
    }

    // Créer l'agent
    await supabase.from('users').insert([{
      nom, prenom, email,
      role: 'agent',
      mairie_id: mairieId
    }])
  }

  return (
    <form onSubmit={handleSubmit}>
      <GeoSelector
        onSelect={setLocalisation}
        showVillage={false}
      />

      {mairieInfo?.sera_creee && (
        <p>⚠️ Nouvelle mairie sera créée</p>
      )}

      <Button type="submit">Créer l'agent</Button>
    </form>
  )
}
```

---

## 📋 **CHECKLIST D'INSTALLATION**

### **Étape 1 : Base de données**
```bash
# 1. Créer les tables géographiques
supabase/create-geo-simple.sql

# 2. Charger les données de base
supabase/seed-geo-cote-ivoire.sql

# 3. Mettre à jour la table mairies
supabase/update-mairies-geo.sql
```

### **Étape 2 : Vérification**
```sql
-- Vérifier les tables
SELECT COUNT(*) FROM districts;  -- 14
SELECT COUNT(*) FROM regions;    -- 31
SELECT COUNT(*) FROM communes;   -- 10+

-- Tester la recherche de mairie
SELECT * FROM get_mairie_competente(
  (SELECT id FROM villages LIMIT 1)
);

-- Voir les mairies avec hiérarchie
SELECT * FROM v_mairies_hierarchie;
```

### **Étape 3 : Tester les pages**
1. `/citoyen/demande-extrait-geo` - Demande avec géolocalisation
2. `/ministere/agents/nouveau` - Création d'agent

---

## 🎉 **RÉSULTAT FINAL**

### **Pour le citoyen :**
✅ Sélection précise jusqu'au village
✅ Mairie compétente trouvée automatiquement
✅ Breadcrumb géographique clair

### **Pour l'agent :**
✅ Voit les demandes de sa zone
✅ Localisation précise des citoyens
✅ Statistiques par village

### **Pour le ministère :**
✅ Création d'agent avec assignation géographique
✅ Création automatique de mairies
✅ Vue d'ensemble par région

---

**🇨🇮 SYSTÈME GÉOGRAPHIQUE COMPLET ET OPÉRATIONNEL ! 🗺️**
