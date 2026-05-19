import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Vérifier le rôle (optionnel - peut être public)
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    // Récupérer les statistiques nationales
    const stats = await getStatistiquesNationales(supabase)

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Erreur API:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

async function getStatistiquesNationales(supabase: any) {
  // 1. Statistiques globales
  const [
    naissances,
    mariages,
    deces,
    demandes,
    mairies,
    agents
  ] = await Promise.all([
    supabase.from('naissances').select('id', { count: 'exact', head: true }),
    supabase.from('mariages').select('id', { count: 'exact', head: true }),
    supabase.from('deces').select('id', { count: 'exact', head: true }),
    supabase.from('requests').select('id, statut', { count: 'exact' }),
    supabase.from('mairies').select('id, statut', { count: 'exact' }),
    supabase.from('users').select('id').eq('role', 'agent')
  ])

  // 2. Population par mairie
  const { data: populationParMairie } = await supabase
    .from('naissances')
    .select(`
      mairie_id,
      mairies (
        id,
        nom_mairie,
        ville,
        region
      )
    `)

  // Grouper par mairie
  const populationMap = new Map()
  populationParMairie?.forEach((item: any) => {
    if (item.mairies) {
      const key = item.mairie_id
      if (!populationMap.has(key)) {
        populationMap.set(key, {
          mairie_id: item.mairie_id,
          nom_mairie: item.mairies.nom_mairie,
          ville: item.mairies.ville,
          region: item.mairies.region,
          naissances: 0,
          mariages: 0,
          deces: 0,
          population_estimee: 0
        })
      }
      const current = populationMap.get(key)
      current.naissances++
    }
  })

  // Ajouter mariages et décès
  const { data: mariagesParMairie } = await supabase
    .from('mariages')
    .select('mairie_id')

  mariagesParMairie?.forEach((item: any) => {
    if (populationMap.has(item.mairie_id)) {
      populationMap.get(item.mairie_id).mariages++
    }
  })

  const { data: decesParMairie } = await supabase
    .from('deces')
    .select('mairie_id')

  decesParMairie?.forEach((item: any) => {
    if (populationMap.has(item.mairie_id)) {
      populationMap.get(item.mairie_id).deces++
    }
  })

  // Estimer la population (naissances * 50 - décès * 10)
  const populationData = Array.from(populationMap.values()).map(item => ({
    ...item,
    population_estimee: Math.max(0, (item.naissances * 50) - (item.deces * 10))
  }))

  // 3. Répartition par région
  const { data: mairiesRegions } = await supabase
    .from('mairies')
    .select('id, region')

  // Grouper les mairies par région
  const regionMap = new Map<string, string[]>()
  mairiesRegions?.forEach((mairie: any) => {
    if (mairie.region) {
      if (!regionMap.has(mairie.region)) {
        regionMap.set(mairie.region, [])
      }
      regionMap.get(mairie.region)!.push(mairie.id)
    }
  })

  // Calculer les stats pour chaque région
  const repartitionRegions = await Promise.all(
    Array.from(regionMap.entries()).map(async ([regionNom, mairieIds]) => {
      const [naissancesCount, mariagesCount, decesCount, demandesCount] = await Promise.all([
        supabase.from('naissances').select('*', { count: 'exact', head: true }).in('mairie_id', mairieIds),
        supabase.from('mariages').select('*', { count: 'exact', head: true }).in('mairie_id', mairieIds),
        supabase.from('deces').select('*', { count: 'exact', head: true }).in('mairie_id', mairieIds),
        supabase.from('requests').select('*', { count: 'exact', head: true }).in('mairie_id', mairieIds)
      ])

      return {
        region: regionNom,
        naissances: naissancesCount.count || 0,
        mariages: mariagesCount.count || 0,
        deces: decesCount.count || 0,
        demandes: demandesCount.count || 0
      }
    })
  )

  // 4. Évolution mensuelle (SIMPLIFIÉE pour performance)
  // Générer des données vides pour l'instant (à optimiser plus tard)
  const evolutionData = []
  const now = new Date()
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    evolutionData.push({
      mois: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
      naissances: 0,
      mariages: 0,
      deces: 0
    })
  }
  
  // TODO: Optimiser avec une seule requête groupée par mois

  // Retourner toutes les statistiques
  return {
    globales: {
      naissances: {
        total: naissances.count || 0
      },
      mariages: {
        total: mariages.count || 0
      },
      deces: {
        total: deces.count || 0
      },
      demandes: {
        total: demandes.data?.length || 0,
        en_attente: demandes.data?.filter((d: any) => d.statut === 'en_attente').length || 0,
        validees: demandes.data?.filter((d: any) => d.statut === 'validee').length || 0,
        rejetees: demandes.data?.filter((d: any) => d.statut === 'rejetee').length || 0
      },
      mairies: {
        total: mairies.count || 0,
        actives: mairies.data?.filter((m: any) => m.statut === 'active').length || 0
      },
      agents: {
        total: agents.data?.length || 0
      }
    },
    population_par_mairie: populationData.sort((a, b) => b.population_estimee - a.population_estimee),
    repartition_regions: repartitionRegions,
    evolution_mensuelle: evolutionData
  }
}

// API POST pour filtrer par période
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const { periode, date_debut, date_fin } = body

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer les statistiques filtrées
    // TODO: Implémenter le filtrage par période

    return NextResponse.json({
      success: true,
      message: 'Filtrage par période à implémenter',
      params: { periode, date_debut, date_fin }
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
