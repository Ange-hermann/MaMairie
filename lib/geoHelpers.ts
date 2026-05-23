import type { GeoSelection } from '@/types/geo'

/**
 * Formate une sélection géographique en texte lisible
 */
export function formatGeoSelection(selection: GeoSelection): string {
  const parts: string[] = []

  if (selection.village_nom) {
    parts.push(`Village de ${selection.village_nom}`)
  }

  if (selection.commune_nom) {
    parts.push(`Commune de ${selection.commune_nom}`)
  }

  if (selection.sous_prefecture_nom) {
    parts.push(`Sous-préfecture de ${selection.sous_prefecture_nom}`)
  }

  if (selection.departement_nom) {
    parts.push(`Département de ${selection.departement_nom}`)
  }

  if (selection.region_nom) {
    parts.push(`Région ${selection.region_nom}`)
  }

  if (selection.district_nom) {
    parts.push(`District ${selection.district_nom}`)
  }

  return parts.join(', ')
}

/**
 * Formate une sélection géographique en texte court
 */
export function formatGeoSelectionShort(selection: GeoSelection): string {
  if (selection.village_nom && selection.commune_nom) {
    return `${selection.village_nom}, ${selection.commune_nom}`
  }

  if (selection.commune_nom && selection.sous_prefecture_nom) {
    return `${selection.commune_nom}, ${selection.sous_prefecture_nom}`
  }

  if (selection.commune_nom) {
    return selection.commune_nom
  }

  if (selection.sous_prefecture_nom) {
    return selection.sous_prefecture_nom
  }

  if (selection.departement_nom) {
    return selection.departement_nom
  }

  if (selection.region_nom) {
    return selection.region_nom
  }

  return 'Non spécifié'
}

/**
 * Génère un breadcrumb géographique
 */
export function generateGeoBreadcrumb(selection: GeoSelection): Array<{ label: string; level: string }> {
  const breadcrumb: Array<{ label: string; level: string }> = []

  if (selection.district_nom) {
    breadcrumb.push({ label: selection.district_nom, level: 'district' })
  }

  if (selection.region_nom) {
    breadcrumb.push({ label: selection.region_nom, level: 'region' })
  }

  if (selection.departement_nom) {
    breadcrumb.push({ label: selection.departement_nom, level: 'departement' })
  }

  if (selection.sous_prefecture_nom) {
    breadcrumb.push({ label: selection.sous_prefecture_nom, level: 'sous_prefecture' })
  }

  if (selection.commune_nom) {
    breadcrumb.push({ label: selection.commune_nom, level: 'commune' })
  }

  if (selection.village_nom) {
    breadcrumb.push({ label: selection.village_nom, level: 'village' })
  }

  return breadcrumb
}

/**
 * Vérifie si une sélection géographique est complète
 */
export function isGeoSelectionComplete(
  selection: GeoSelection,
  requireVillage: boolean = false
): boolean {
  const hasCommune = !!selection.commune_id
  const hasVillage = !!selection.village_id

  if (requireVillage) {
    return hasCommune && hasVillage
  }

  return hasCommune
}

/**
 * Obtient le niveau géographique le plus profond sélectionné
 */
export function getDeepestGeoLevel(selection: GeoSelection): string {
  if (selection.village_id) return 'village'
  if (selection.commune_id) return 'commune'
  if (selection.sous_prefecture_id) return 'sous_prefecture'
  if (selection.departement_id) return 'departement'
  if (selection.region_id) return 'region'
  if (selection.district_id) return 'district'
  return 'none'
}

/**
 * Réinitialise les niveaux inférieurs d'une sélection
 */
export function resetLowerLevels(
  selection: GeoSelection,
  fromLevel: 'district' | 'region' | 'departement' | 'sous_prefecture' | 'commune'
): GeoSelection {
  const newSelection = { ...selection }

  const levels = ['district', 'region', 'departement', 'sous_prefecture', 'commune', 'village']
  const fromIndex = levels.indexOf(fromLevel)

  for (let i = fromIndex + 1; i < levels.length; i++) {
    const level = levels[i]
    delete newSelection[`${level}_id` as keyof GeoSelection]
    delete newSelection[`${level}_nom` as keyof GeoSelection]
  }

  return newSelection
}

/**
 * Obtient l'icône pour un niveau géographique
 */
export function getGeoLevelIcon(level: string): string {
  const icons: Record<string, string> = {
    district: '🏛️',
    region: '🗺️',
    departement: '📍',
    sous_prefecture: '🏘️',
    commune: '🏙️',
    village: '🏡'
  }

  return icons[level] || '📌'
}

/**
 * Obtient le label pour un niveau géographique
 */
export function getGeoLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    district: 'District',
    region: 'Région',
    departement: 'Département',
    sous_prefecture: 'Sous-préfecture',
    commune: 'Commune',
    village: 'Village'
  }

  return labels[level] || level
}

/**
 * Valide un code géographique
 */
export function validateGeoCode(code: string, level: string): boolean {
  const patterns: Record<string, RegExp> = {
    district: /^DIS-[A-Z]{3}$/,
    region: /^REG-[A-Z]{3}$/,
    departement: /^DEP-[A-Z]{3}$/,
    sous_prefecture: /^SP-[A-Z]{3}$/,
    commune: /^COM-[A-Z]{3}-\d{3}$/,
    village: /^VIL-[A-Z]{3}-\d{3}$/
  }

  const pattern = patterns[level]
  return pattern ? pattern.test(code) : false
}

/**
 * Calcule la distance entre deux coordonnées GPS (en km)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Trouve la mairie la plus proche d'un village
 */
export function findNearestMairie(
  villageLat: number,
  villageLon: number,
  mairies: Array<{ id: string; nom: string; latitude?: number; longitude?: number }>
): { id: string; nom: string; distance: number } | null {
  let nearest: { id: string; nom: string; distance: number } | null = null
  let minDistance = Infinity

  for (const mairie of mairies) {
    if (mairie.latitude && mairie.longitude) {
      const distance = calculateDistance(
        villageLat,
        villageLon,
        mairie.latitude,
        mairie.longitude
      )

      if (distance < minDistance) {
        minDistance = distance
        nearest = {
          id: mairie.id,
          nom: mairie.nom,
          distance
        }
      }
    }
  }

  return nearest
}

/**
 * Formate une population avec séparateurs de milliers
 */
export function formatPopulation(population?: number): string {
  if (!population) return 'Non renseigné'
  return population.toLocaleString('fr-FR') + ' habitants'
}

/**
 * Formate une superficie
 */
export function formatSuperficie(superficie?: number): string {
  if (!superficie) return 'Non renseigné'
  return superficie.toLocaleString('fr-FR') + ' km²'
}

/**
 * Obtient la couleur pour un type de commune
 */
export function getCommuneTypeColor(type: 'urbaine' | 'rurale'): string {
  return type === 'urbaine' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
}

/**
 * Obtient le label pour un type de commune
 */
export function getCommuneTypeLabel(type: 'urbaine' | 'rurale'): string {
  return type === 'urbaine' ? 'Urbaine' : 'Rurale'
}
