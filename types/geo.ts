// ========================================
// TYPES GÉOGRAPHIQUES CÔTE D'IVOIRE
// ========================================

export interface District {
  id: string
  nom: string
  code: string
  created_at: string
}

export interface Region {
  id: string
  nom: string
  code: string
  district_id: string
  created_at: string
  // Relations
  districts?: District
}

export interface Departement {
  id: string
  nom: string
  code: string
  region_id: string
  created_at: string
  // Relations
  regions?: Region
}

export interface SousPrefecture {
  id: string
  nom: string
  code: string
  departement_id: string
  chef_lieu?: string
  created_at: string
  // Relations
  departements?: Departement
}

export type TypeCommune = 'urbaine' | 'rurale'

export interface Commune {
  id: string
  nom: string
  code: string
  sous_prefecture_id: string
  type_commune: TypeCommune
  population?: number
  superficie_km2?: number
  created_at: string
  // Relations
  sous_prefectures?: SousPrefecture
}

export interface Village {
  id: string
  nom: string
  code: string
  commune_id: string
  sous_prefecture_id: string
  population?: number
  latitude?: number
  longitude?: number
  created_at: string
  // Relations
  communes?: Commune
  sous_prefectures?: SousPrefecture
}

// ========================================
// INTERFACE DE SÉLECTION GÉOGRAPHIQUE
// ========================================

export interface GeoSelection {
  district_id?: string
  district_nom?: string
  region_id?: string
  region_nom?: string
  departement_id?: string
  departement_nom?: string
  sous_prefecture_id?: string
  sous_prefecture_nom?: string
  commune_id?: string
  commune_nom?: string
  village_id?: string
  village_nom?: string
}

// ========================================
// VUES HIÉRARCHIQUES
// ========================================

export interface CommuneHierarchie {
  commune_id: string
  commune_nom: string
  commune_code: string
  type_commune: TypeCommune
  sous_prefecture_id: string
  sous_prefecture_nom: string
  departement_id: string
  departement_nom: string
  region_id: string
  region_nom: string
  district_id: string
  district_nom: string
}

export interface VillageHierarchie {
  village_id: string
  village_nom: string
  village_code: string
  village_population?: number
  commune_id: string
  commune_nom: string
  sous_prefecture_id: string
  sous_prefecture_nom: string
  departement_id: string
  departement_nom: string
  region_id: string
  region_nom: string
  district_id: string
  district_nom: string
}

// ========================================
// RÉSULTAT DE RECHERCHE
// ========================================

export interface VillageSearchResult {
  village_id: string
  village_nom: string
  commune_nom: string
  sous_prefecture_nom: string
  region_nom: string
  similarity_score: number
}

// ========================================
// PROPS COMPOSANTS
// ========================================

export interface GeoSelectorProps {
  onSelect: (selection: GeoSelection) => void
  required?: boolean
  showVillage?: boolean
  showDistrict?: boolean
  defaultValues?: Partial<GeoSelection>
  disabled?: boolean
  className?: string
}

export interface GeoBreadcrumbProps {
  selection: GeoSelection
  className?: string
}

export interface GeoStatsProps {
  level: 'district' | 'region' | 'departement' | 'sous_prefecture' | 'commune'
  id: string
}
