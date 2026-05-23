'use client'

import { useState, useEffect } from 'react'
import { Select } from '@/components/ui/Select'
import { MapPin, Loader } from 'lucide-react'
import {
  useDistricts,
  useRegions,
  useDepartements,
  useSousPrefectures,
  useCommunes,
  useVillages
} from '@/hooks/useGeo'
import type { GeoSelection, GeoSelectorProps } from '@/types/geo'
import { formatGeoSelection, getGeoLevelIcon } from '@/lib/geoHelpers'

export function GeoSelector({
  onSelect,
  required = false,
  showVillage = false,
  showDistrict = true,
  defaultValues,
  disabled = false,
  className = ''
}: GeoSelectorProps) {
  const [selection, setSelection] = useState<GeoSelection>(defaultValues || {})

  // Hooks pour charger les données en cascade
  const { districts, loading: loadingDistricts } = useDistricts()
  const { regions, loading: loadingRegions } = useRegions(selection.district_id)
  const { departements, loading: loadingDepartements } = useDepartements(selection.region_id)
  const { sousPrefectures, loading: loadingSP } = useSousPrefectures(selection.departement_id)
  const { communes, loading: loadingCommunes } = useCommunes(selection.sous_prefecture_id)
  const { villages, loading: loadingVillages } = useVillages(selection.commune_id)

  // Mettre à jour la sélection parent
  useEffect(() => {
    onSelect(selection)
  }, [selection])

  // Gérer la sélection du district
  const handleDistrictChange = (districtId: string) => {
    const district = districts.find(d => d.id === districtId)
    setSelection({
      district_id: districtId,
      district_nom: district?.nom
    })
  }

  // Gérer la sélection de la région
  const handleRegionChange = (regionId: string) => {
    const region = regions.find(r => r.id === regionId)
    setSelection({
      ...selection,
      region_id: regionId,
      region_nom: region?.nom,
      departement_id: undefined,
      departement_nom: undefined,
      sous_prefecture_id: undefined,
      sous_prefecture_nom: undefined,
      commune_id: undefined,
      commune_nom: undefined,
      village_id: undefined,
      village_nom: undefined
    })
  }

  // Gérer la sélection du département
  const handleDepartementChange = (departementId: string) => {
    const departement = departements.find(d => d.id === departementId)
    setSelection({
      ...selection,
      departement_id: departementId,
      departement_nom: departement?.nom,
      sous_prefecture_id: undefined,
      sous_prefecture_nom: undefined,
      commune_id: undefined,
      commune_nom: undefined,
      village_id: undefined,
      village_nom: undefined
    })
  }

  // Gérer la sélection de la sous-préfecture
  const handleSousPrefectureChange = (sousPrefectureId: string) => {
    const sousPrefecture = sousPrefectures.find(sp => sp.id === sousPrefectureId)
    setSelection({
      ...selection,
      sous_prefecture_id: sousPrefectureId,
      sous_prefecture_nom: sousPrefecture?.nom,
      commune_id: undefined,
      commune_nom: undefined,
      village_id: undefined,
      village_nom: undefined
    })
  }

  // Gérer la sélection de la commune
  const handleCommuneChange = (communeId: string) => {
    const commune = communes.find(c => c.id === communeId)
    setSelection({
      ...selection,
      commune_id: communeId,
      commune_nom: commune?.nom,
      village_id: undefined,
      village_nom: undefined
    })
  }

  // Gérer la sélection du village
  const handleVillageChange = (villageId: string) => {
    const village = villages.find(v => v.id === villageId)
    setSelection({
      ...selection,
      village_id: villageId,
      village_nom: village?.nom
    })
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <MapPin size={16} className="text-orange-500" />
        <span className="font-medium">Localisation géographique</span>
        {required && <span className="text-red-500">*</span>}
      </div>

      {/* District (optionnel) */}
      {showDistrict && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {getGeoLevelIcon('district')} District {required && '*'}
          </label>
          <Select
            value={selection.district_id || ''}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={disabled || loadingDistricts}
            options={[
              { value: '', label: loadingDistricts ? 'Chargement...' : 'Sélectionner un district' },
              ...districts.map(d => ({ value: d.id, label: d.nom }))
            ]}
          />
        </div>
      )}

      {/* Région */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {getGeoLevelIcon('region')} Région {required && '*'}
        </label>
        <Select
          value={selection.region_id || ''}
          onChange={(e) => handleRegionChange(e.target.value)}
          disabled={disabled || (showDistrict && !selection.district_id) || loadingRegions}
          options={[
            { 
              value: '', 
              label: loadingRegions 
                ? 'Chargement...' 
                : (showDistrict && !selection.district_id)
                  ? 'Sélectionnez d\'abord un district'
                  : 'Sélectionner une région'
            },
            ...regions.map(r => ({ value: r.id, label: r.nom }))
          ]}
        />
        {loadingRegions && (
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <Loader size={12} className="animate-spin" />
            <span>Chargement des régions...</span>
          </div>
        )}
      </div>

      {/* Département */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {getGeoLevelIcon('departement')} Département {required && '*'}
        </label>
        <Select
          value={selection.departement_id || ''}
          onChange={(e) => handleDepartementChange(e.target.value)}
          disabled={disabled || !selection.region_id || loadingDepartements}
          options={[
            { 
              value: '', 
              label: loadingDepartements 
                ? 'Chargement...' 
                : !selection.region_id
                  ? 'Sélectionnez d\'abord une région'
                  : 'Sélectionner un département'
            },
            ...departements.map(d => ({ value: d.id, label: d.nom }))
          ]}
        />
        {loadingDepartements && (
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <Loader size={12} className="animate-spin" />
            <span>Chargement des départements...</span>
          </div>
        )}
      </div>

      {/* Sous-préfecture */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {getGeoLevelIcon('sous_prefecture')} Sous-préfecture {required && '*'}
        </label>
        <Select
          value={selection.sous_prefecture_id || ''}
          onChange={(e) => handleSousPrefectureChange(e.target.value)}
          disabled={disabled || !selection.departement_id || loadingSP}
          options={[
            { 
              value: '', 
              label: loadingSP 
                ? 'Chargement...' 
                : !selection.departement_id
                  ? 'Sélectionnez d\'abord un département'
                  : 'Sélectionner une sous-préfecture'
            },
            ...sousPrefectures.map(sp => ({ value: sp.id, label: sp.nom }))
          ]}
        />
        {loadingSP && (
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <Loader size={12} className="animate-spin" />
            <span>Chargement des sous-préfectures...</span>
          </div>
        )}
      </div>

      {/* Commune */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {getGeoLevelIcon('commune')} Commune {required && '*'}
        </label>
        <Select
          value={selection.commune_id || ''}
          onChange={(e) => handleCommuneChange(e.target.value)}
          disabled={disabled || !selection.sous_prefecture_id || loadingCommunes}
          options={[
            { 
              value: '', 
              label: loadingCommunes 
                ? 'Chargement...' 
                : !selection.sous_prefecture_id
                  ? 'Sélectionnez d\'abord une sous-préfecture'
                  : 'Sélectionner une commune'
            },
            ...communes.map(c => ({ 
              value: c.id, 
              label: `${c.nom} ${c.type_commune === 'urbaine' ? '🏙️' : '🌾'}`
            }))
          ]}
        />
        {loadingCommunes && (
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <Loader size={12} className="animate-spin" />
            <span>Chargement des communes...</span>
          </div>
        )}
      </div>

      {/* Village (optionnel) */}
      {showVillage && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {getGeoLevelIcon('village')} Village {required && '*'}
          </label>
          <Select
            value={selection.village_id || ''}
            onChange={(e) => handleVillageChange(e.target.value)}
            disabled={disabled || !selection.commune_id || loadingVillages}
            options={[
              { 
                value: '', 
                label: loadingVillages 
                  ? 'Chargement...' 
                  : !selection.commune_id
                    ? 'Sélectionnez d\'abord une commune'
                    : 'Sélectionner un village'
              },
              ...villages.map(v => ({ value: v.id, label: v.nom }))
            ]}
          />
          {loadingVillages && (
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <Loader size={12} className="animate-spin" />
              <span>Chargement des villages...</span>
            </div>
          )}
        </div>
      )}

      {/* Affichage de la sélection complète */}
      {selection.commune_id && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Localisation sélectionnée :</p>
          <p className="text-sm font-medium text-green-900">
            {formatGeoSelection(selection)}
          </p>
        </div>
      )}
    </div>
  )
}
