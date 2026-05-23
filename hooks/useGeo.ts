import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type {
  District,
  Region,
  Departement,
  SousPrefecture,
  Commune,
  Village,
  VillageSearchResult
} from '@/types/geo'

// ========================================
// HOOK : DISTRICTS
// ========================================

export function useDistricts() {
  const supabase = createClientComponentClient()
  const [districts, setDistricts] = useState<District[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDistricts()
  }, [])

  const fetchDistricts = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('districts')
        .select('*')
        .order('nom')

      if (fetchError) throw fetchError

      setDistricts(data || [])
      setError(null)
    } catch (err: any) {
      console.error('Erreur districts:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { districts, loading, error, refetch: fetchDistricts }
}

// ========================================
// HOOK : RÉGIONS
// ========================================

export function useRegions(districtId?: string) {
  const supabase = createClientComponentClient()
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (districtId) {
      fetchRegions()
    } else {
      setRegions([])
    }
  }, [districtId])

  const fetchRegions = async () => {
    if (!districtId) return

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('regions')
        .select('*')
        .eq('district_id', districtId)
        .order('nom')

      if (fetchError) throw fetchError

      setRegions(data || [])
      setError(null)
    } catch (err: any) {
      console.error('Erreur régions:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { regions, loading, error, refetch: fetchRegions }
}

// ========================================
// HOOK : DÉPARTEMENTS
// ========================================

export function useDepartements(regionId?: string) {
  const supabase = createClientComponentClient()
  const [departements, setDepartements] = useState<Departement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (regionId) {
      fetchDepartements()
    } else {
      setDepartements([])
    }
  }, [regionId])

  const fetchDepartements = async () => {
    if (!regionId) return

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('departements')
        .select('*')
        .eq('region_id', regionId)
        .order('nom')

      if (fetchError) throw fetchError

      setDepartements(data || [])
      setError(null)
    } catch (err: any) {
      console.error('Erreur départements:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { departements, loading, error, refetch: fetchDepartements }
}

// ========================================
// HOOK : SOUS-PRÉFECTURES
// ========================================

export function useSousPrefectures(departementId?: string) {
  const supabase = createClientComponentClient()
  const [sousPrefectures, setSousPrefectures] = useState<SousPrefecture[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (departementId) {
      fetchSousPrefectures()
    } else {
      setSousPrefectures([])
    }
  }, [departementId])

  const fetchSousPrefectures = async () => {
    if (!departementId) return

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('sous_prefectures')
        .select('*')
        .eq('departement_id', departementId)
        .order('nom')

      if (fetchError) throw fetchError

      setSousPrefectures(data || [])
      setError(null)
    } catch (err: any) {
      console.error('Erreur sous-préfectures:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { sousPrefectures, loading, error, refetch: fetchSousPrefectures }
}

// ========================================
// HOOK : COMMUNES
// ========================================

export function useCommunes(sousPrefectureId?: string) {
  const supabase = createClientComponentClient()
  const [communes, setCommunes] = useState<Commune[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sousPrefectureId) {
      fetchCommunes()
    } else {
      setCommunes([])
    }
  }, [sousPrefectureId])

  const fetchCommunes = async () => {
    if (!sousPrefectureId) return

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('communes')
        .select('*')
        .eq('sous_prefecture_id', sousPrefectureId)
        .order('nom')

      if (fetchError) throw fetchError

      setCommunes(data || [])
      setError(null)
    } catch (err: any) {
      console.error('Erreur communes:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { communes, loading, error, refetch: fetchCommunes }
}

// ========================================
// HOOK : VILLAGES
// ========================================

export function useVillages(communeId?: string) {
  const supabase = createClientComponentClient()
  const [villages, setVillages] = useState<Village[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (communeId) {
      fetchVillages()
    } else {
      setVillages([])
    }
  }, [communeId])

  const fetchVillages = async () => {
    if (!communeId) return

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('villages')
        .select('*')
        .eq('commune_id', communeId)
        .order('nom')

      if (fetchError) throw fetchError

      setVillages(data || [])
      setError(null)
    } catch (err: any) {
      console.error('Erreur villages:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { villages, loading, error, refetch: fetchVillages }
}

// ========================================
// HOOK : RECHERCHE VILLAGES
// ========================================

export function useVillageSearch(query: string, debounceMs: number = 300) {
  const supabase = createClientComponentClient()
  const [results, setResults] = useState<VillageSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(() => {
      searchVillages()
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query])

  const searchVillages = async () => {
    if (!query || query.length < 2) return

    try {
      setLoading(true)
      
      // Recherche simple avec ILIKE
      const { data, error: fetchError } = await supabase
        .from('villages')
        .select(`
          id,
          nom,
          communes!inner(nom),
          sous_prefectures!inner(nom, departements!inner(regions!inner(nom)))
        `)
        .ilike('nom', `%${query}%`)
        .limit(20)

      if (fetchError) throw fetchError

      // Transformer les données
      const transformedResults = data?.map((v: any) => ({
        village_id: v.id,
        village_nom: v.nom,
        commune_nom: v.communes?.nom || '',
        sous_prefecture_nom: v.sous_prefectures?.nom || '',
        region_nom: v.sous_prefectures?.departements?.regions?.nom || '',
        similarity_score: 1
      })) || []

      setResults(transformedResults)
      setError(null)
    } catch (err: any) {
      console.error('Erreur recherche villages:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { results, loading, error }
}

// ========================================
// HOOK : HIÉRARCHIE COMPLÈTE D'UNE COMMUNE
// ========================================

export function useCommuneHierarchy(communeId?: string) {
  const supabase = createClientComponentClient()
  const [hierarchy, setHierarchy] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (communeId) {
      fetchHierarchy()
    } else {
      setHierarchy(null)
    }
  }, [communeId])

  const fetchHierarchy = async () => {
    if (!communeId) return

    try {
      setLoading(true)
      
      const { data, error: fetchError } = await supabase
        .from('v_communes_hierarchie')
        .select('*')
        .eq('commune_id', communeId)
        .single()

      if (fetchError) throw fetchError

      setHierarchy(data)
      setError(null)
    } catch (err: any) {
      console.error('Erreur hiérarchie commune:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { hierarchy, loading, error, refetch: fetchHierarchy }
}

// ========================================
// HOOK : TOUTES LES RÉGIONS (sans filtre)
// ========================================

export function useAllRegions() {
  const supabase = createClientComponentClient()
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllRegions()
  }, [])

  const fetchAllRegions = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('regions')
        .select('*, districts(*)')
        .order('nom')

      if (fetchError) throw fetchError

      setRegions(data || [])
      setError(null)
    } catch (err: any) {
      console.error('Erreur toutes régions:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { regions, loading, error, refetch: fetchAllRegions }
}

// ========================================
// HOOK : STATISTIQUES PAR NIVEAU GÉOGRAPHIQUE
// ========================================

export function useGeoStats(level: string, id?: string) {
  const supabase = createClientComponentClient()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchStats()
    }
  }, [level, id])

  const fetchStats = async () => {
    if (!id) return

    try {
      setLoading(true)
      
      // Logique pour récupérer les stats selon le niveau
      // À implémenter selon les besoins spécifiques
      
      setError(null)
    } catch (err: any) {
      console.error('Erreur stats géo:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { stats, loading, error, refetch: fetchStats }
}
