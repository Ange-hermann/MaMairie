# 🗺️ INSTALLATION DISPATCHING GÉOGRAPHIQUE

## 📋 **ÉTAPES D'INSTALLATION**

### **ÉTAPE 1 : Exécuter le script SQL simplifié**

Allez sur **Supabase** → **SQL Editor** et exécutez :

```sql
-- Fichier: supabase/create-geo-simple.sql
```

Ce script va créer :
- ✅ 6 tables (districts, regions, departements, sous_prefectures, communes, villages)
- ✅ Enum type_commune_enum
- ✅ Index pour performances
- ✅ RLS policies (lecture publique)
- ✅ 2 vues hiérarchiques
- ✅ Fonction de recherche villages

### **ÉTAPE 2 : Charger les données de base**

Exécutez ensuite :

```sql
-- Fichier: supabase/seed-geo-cote-ivoire.sql
```

Cela va insérer :
- ✅ 14 districts
- ✅ 31 régions
- ✅ Départements principaux
- ✅ Sous-préfectures d'Abidjan
- ✅ Communes urbaines
- ✅ Villages exemples

### **ÉTAPE 3 : Vérifier l'installation**

```sql
-- Compter les données
SELECT 
  'Districts' as table_name, COUNT(*) as count FROM districts
UNION ALL
SELECT 'Régions', COUNT(*) FROM regions
UNION ALL
SELECT 'Départements', COUNT(*) FROM departements
UNION ALL
SELECT 'Sous-préfectures', COUNT(*) FROM sous_prefectures
UNION ALL
SELECT 'Communes', COUNT(*) FROM communes
UNION ALL
SELECT 'Villages', COUNT(*) FROM villages;
```

Résultat attendu :
```
Districts         | 14
Régions           | 31
Départements      | 20+
Sous-préfectures  | 10+
Communes          | 10+
Villages          | 9+
```

---

## ✅ **VÉRIFICATION**

### **Test 1 : Hiérarchie complète**

```sql
SELECT * FROM v_communes_hierarchie WHERE commune_nom LIKE '%Abobo%';
```

Devrait afficher : District → Région → Département → SP → Commune

### **Test 2 : Recherche village**

```sql
SELECT * FROM search_villages('Cocody');
```

Devrait retourner les villages de Cocody

---

## 🚀 **UTILISATION DANS LE CODE**

### **Exemple 1 : Sélecteur géographique**

```tsx
import { GeoSelector } from '@/components/GeoSelector'

function MonFormulaire() {
  const [selection, setSelection] = useState({})

  return (
    <GeoSelector
      onSelect={setSelection}
      required
      showVillage={false}
    />
  )
}
```

### **Exemple 2 : Breadcrumb**

```tsx
import { GeoBreadcrumb } from '@/components/GeoBreadcrumb'

function MaPage() {
  return (
    <GeoBreadcrumb selection={selection} />
  )
}
```

### **Exemple 3 : Hooks**

```tsx
import { useRegions, useCommunes } from '@/hooks/useGeo'

function MonComposant() {
  const { regions, loading } = useRegions(districtId)
  const { communes } = useCommunes(sousPrefectureId)
  
  // ...
}
```

---

## 🔧 **DÉPANNAGE**

### **Erreur : "operator class gin_trgm_ops does not exist"**

✅ **Solution** : Utilisez `create-geo-simple.sql` au lieu de `create-geo-hierarchy.sql`

### **Erreur : "relation does not exist"**

✅ **Solution** : Vérifiez que vous avez exécuté le script de création avant le seed

### **Erreur : "foreign key constraint"**

✅ **Solution** : Exécutez les scripts dans l'ordre :
1. `create-geo-simple.sql`
2. `seed-geo-cote-ivoire.sql`

---

## 📊 **STRUCTURE HIÉRARCHIQUE**

```
District (14)
  └─ Région (31)
      └─ Département (107)
          └─ Sous-préfecture (510)
              └─ Commune (201)
                  └─ Village (8000+)
```

---

## 🎯 **PROCHAINES ÉTAPES**

1. ✅ Intégrer GeoSelector dans les formulaires
2. ✅ Créer la page de recherche géographique
3. ✅ Ajouter les filtres dans le dashboard ministère
4. ✅ Afficher la localisation dans le dashboard agent

---

**🇨🇮 DISPATCHING GÉOGRAPHIQUE PRÊT ! 🗺️**
