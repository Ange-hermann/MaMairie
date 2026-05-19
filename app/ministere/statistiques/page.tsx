'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { 
  BarChart3, 
  TrendingUp,
  Baby,
  Heart,
  Cross,
  FileText,
  Users,
  Building2,
  Download,
  Calendar
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

export default function StatistiquesNationalesPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [periode, setPeriode] = useState('annee')
  
  const [stats, setStats] = useState({
    naissances: {
      total: 0,
      moisActuel: 0,
      evolution: 0,
    },
    mariages: {
      total: 0,
      moisActuel: 0,
      evolution: 0,
    },
    deces: {
      total: 0,
      moisActuel: 0,
      evolution: 0,
    },
    demandes: {
      total: 0,
      en_attente: 0,
      validees: 0,
      rejetees: 0,
    },
    mairies: {
      total: 0,
      actives: 0,
    },
    agents: {
      total: 0,
      actifs: 0,
    },
  })

  const [evolutionData, setEvolutionData] = useState<any[]>([])
  const [repartitionRegions, setRepartitionRegions] = useState<any[]>([])
  const [repartitionDemandes, setRepartitionDemandes] = useState<any[]>([])
  const [performanceMairies, setPerformanceMairies] = useState<any[]>([])
  const [populationParMairie, setPopulationParMairie] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [periode])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile && profile.role !== 'ministere') {
        router.push('/dashboard-citoyen')
        return
      }

      setUserData(profile)
      await fetchStatistiques()
      await fetchStatistiquesAPI()

    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistiquesAPI = async () => {
    try {
      const response = await fetch('/api/statistiques-nationales')
      const result = await response.json()
      
      if (result.success && result.data) {
        // Mettre à jour uniquement la population par mairie
        setPopulationParMairie(result.data.population_par_mairie || [])
      }
    } catch (error) {
      console.error('Erreur API:', error)
    }
  }

  const fetchStatistiques = async () => {
    try {
      // Statistiques Naissances
      const { data: naissances } = await supabase
        .from('naissances')
        .select('created_at')

      const { data: naissancesMois } = await supabase
        .from('naissances')
        .select('created_at')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

      // Statistiques Mariages
      const { data: mariages } = await supabase
        .from('mariages')
        .select('created_at')

      const { data: mariagesMois } = await supabase
        .from('mariages')
        .select('created_at')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

      // Statistiques Décès
      const { data: deces } = await supabase
        .from('deces')
        .select('created_at')

      const { data: decesMois } = await supabase
        .from('deces')
        .select('created_at')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

      // Statistiques Demandes
      const { data: demandes } = await supabase
        .from('requests')
        .select('statut')

      // Statistiques Mairies
      const { data: mairies } = await supabase
        .from('mairies')
        .select('statut')

      // Statistiques Agents
      const { data: agents } = await supabase
        .from('users')
        .select('role, statut')
        .eq('role', 'agent')

      // Calculer les stats
      const statsData = {
        naissances: {
          total: naissances?.length || 0,
          moisActuel: naissancesMois?.length || 0,
          evolution: 0, // À calculer
        },
        mariages: {
          total: mariages?.length || 0,
          moisActuel: mariagesMois?.length || 0,
          evolution: 0,
        },
        deces: {
          total: deces?.length || 0,
          moisActuel: decesMois?.length || 0,
          evolution: 0,
        },
        demandes: {
          total: demandes?.length || 0,
          en_attente: demandes?.filter(d => d.statut === 'en_attente').length || 0,
          validees: demandes?.filter(d => d.statut === 'validee').length || 0,
          rejetees: demandes?.filter(d => d.statut === 'rejetee').length || 0,
        },
        mairies: {
          total: mairies?.length || 0,
          actives: mairies?.filter(m => m.statut === 'active').length || 0,
        },
        agents: {
          total: agents?.length || 0,
          actifs: agents?.filter(a => a.statut !== 'bloque').length || 0,
        },
      }

      setStats(statsData)

      // Évolution sur 12 mois
      await fetchEvolution()

      // Répartition par région
      await fetchRepartitionRegions()

      // Répartition des demandes
      const repartitionDemandesData = [
        { name: 'En attente', value: statsData.demandes.en_attente, color: '#f97316' },
        { name: 'Validées', value: statsData.demandes.validees, color: '#22c55e' },
        { name: 'Rejetées', value: statsData.demandes.rejetees, color: '#ef4444' },
      ]
      setRepartitionDemandes(repartitionDemandesData)

      // Performance des mairies
      await fetchPerformanceMairies()

    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const fetchEvolution = async () => {
    const months = []
    const now = new Date()

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

      const { data: naissances } = await supabase
        .from('naissances')
        .select('id')
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString())

      const { data: mariages } = await supabase
        .from('mariages')
        .select('id')
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString())

      const { data: deces } = await supabase
        .from('deces')
        .select('id')
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString())

      const { data: demandes } = await supabase
        .from('requests')
        .select('id')
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString())

      months.push({
        mois: date.toLocaleDateString('fr-FR', { month: 'short' }),
        naissances: naissances?.length || 0,
        mariages: mariages?.length || 0,
        deces: deces?.length || 0,
        demandes: demandes?.length || 0,
      })
    }

    setEvolutionData(months)
  }

  const fetchRepartitionRegions = async () => {
    console.log('📊 Récupération des données par région...')
    
    // Récupérer toutes les mairies avec leurs régions
    const { data: mairies, error: mairiesError } = await supabase
      .from('mairies')
      .select('id, region')

    if (mairiesError) {
      console.error('❌ Erreur mairies:', mairiesError)
      return
    }

    if (!mairies || mairies.length === 0) {
      console.warn('⚠️ Aucune mairie trouvée')
      return
    }

    console.log(`✅ ${mairies.length} mairies trouvées`)

    // Grouper les mairies par région
    const regionMap = new Map<string, string[]>()
    mairies.forEach(mairie => {
      if (mairie.region) {
        if (!regionMap.has(mairie.region)) {
          regionMap.set(mairie.region, [])
        }
        regionMap.get(mairie.region)!.push(mairie.id)
      }
    })

    console.log(`✅ ${regionMap.size} régions uniques trouvées`)

    // Calculer les stats pour chaque région
    const regionsData = await Promise.all(
      Array.from(regionMap.entries()).map(async ([regionNom, mairieIds]) => {
        console.log(`📊 Traitement de ${regionNom} avec ${mairieIds.length} mairies`)

        // Compter les naissances
        const { count: naissancesCount, error: naissancesError } = await supabase
          .from('naissances')
          .select('*', { count: 'exact', head: true })
          .in('mairie_id', mairieIds)

        if (naissancesError) {
          console.error(`❌ Erreur naissances ${regionNom}:`, naissancesError)
        }

        // Compter les mariages
        const { count: mariagesCount } = await supabase
          .from('mariages')
          .select('*', { count: 'exact', head: true })
          .in('mairie_id', mairieIds)

        // Compter les décès
        const { count: decesCount } = await supabase
          .from('deces')
          .select('*', { count: 'exact', head: true })
          .in('mairie_id', mairieIds)

        // Compter les demandes
        const { count: demandesCount, error: demandesError } = await supabase
          .from('requests')
          .select('*', { count: 'exact', head: true })
          .in('mairie_id', mairieIds)

        if (demandesError) {
          console.error(`❌ Erreur demandes ${regionNom}:`, demandesError)
        }

        const stats = {
          region: regionNom,
          naissances: naissancesCount || 0,
          mariages: mariagesCount || 0,
          deces: decesCount || 0,
          demandes: demandesCount || 0,
        }

        console.log(`✅ ${regionNom}:`, stats)

        return stats
      })
    )

    // Filtrer les régions avec au moins une donnée et trier par total
    const filteredData = regionsData
      .filter(r => r.naissances > 0 || r.demandes > 0)
      .sort((a, b) => (b.naissances + b.demandes) - (a.naissances + a.demandes))
    
    console.log('📊 Données finales par région:', filteredData)
    console.log('🔍 VÉRIFICATION - Abidjan devrait avoir 1 naissance et 5 demandes')
    console.log('🔍 Si vous voyez autre chose, c\'est un problème de cache !')
    
    // Forcer le re-render en ajoutant un timestamp
    const dataWithTimestamp = filteredData.map(d => ({
      ...d,
      _timestamp: Date.now()
    }))
    
    setRepartitionRegions(dataWithTimestamp)
  }

  const fetchPerformanceMairies = async () => {
    console.log('📊 Récupération Top 10 mairies...')
    
    const { data: mairies } = await supabase
      .from('mairies')
      .select('id, nom_mairie, ville, region')
      .order('nom_mairie')

    if (!mairies) {
      console.warn('⚠️ Aucune mairie trouvée')
      return
    }

    console.log(`✅ ${mairies.length} mairies trouvées`)

    const performance = await Promise.all(
      mairies.map(async (mairie) => {
        const { count: totalCount } = await supabase
          .from('requests')
          .select('*', { count: 'exact', head: true })
          .eq('mairie_id', mairie.id)

        const { count: valideesCount } = await supabase
          .from('requests')
          .select('*', { count: 'exact', head: true })
          .eq('mairie_id', mairie.id)
          .eq('statut', 'validee')

        const total = totalCount || 0
        const validees = valideesCount || 0
        const taux = total > 0 ? Math.round((validees / total) * 100) : 0

        return {
          mairie: `${mairie.nom_mairie} (${mairie.region || mairie.ville})`,
          total: total,
          validees: validees,
          taux: taux,
        }
      })
    )

    // Trier par total et prendre le top 10
    const top10 = performance
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    console.log('✅ Top 10 mairies:', top10)
    setPerformanceMairies(top10)
  }

  const exportData = () => {
    const data = {
      periode: periode,
      date_export: new Date().toISOString(),
      statistiques: stats,
      evolution: evolutionData,
      regions: repartitionRegions,
      demandes: repartitionDemandes,
      performance: performanceMairies,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `statistiques-nationales-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  const COLORS = ['#f97316', '#22c55e', '#ef4444', '#3b82f6', '#8b5cf6']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="ministere" />
      
      <div className="flex-1 w-full lg:w-auto">
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Ministère'}
          userRole="ministere"
          avatarUrl={userData?.avatar_url}
        />
        
        <main className="p-4 md:p-6">
          {/* En-tête */}
          <div className="mb-4 md:mb-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-gradient mb-2 flex items-center gap-2">
                  <BarChart3 className="text-primary-500" size={28} />
                  Statistiques Nationales
                </h1>
                <p className="text-xs md:text-base text-gray-600">
                  Vue d'ensemble de l'état civil
                </p>
              </div>
              
              <div className="flex gap-2 md:gap-3">
                <Select
                  label=""
                  value={periode}
                  onChange={(e) => setPeriode(e.target.value)}
                  options={[
                    { value: 'mois', label: 'Mois' },
                    { value: 'trimestre', label: 'Trimestre' },
                    { value: 'annee', label: 'Année' },
                    { value: 'tout', label: 'Tout' },
                  ]}
                  className="text-sm"
                />
                
                <Button onClick={exportData} variant="outline" size="sm" className="hidden md:flex">
                  <Download size={18} className="mr-2" />
                  Exporter
                </Button>
                <Button onClick={exportData} variant="outline" size="sm" className="md:hidden">
                  <Download size={18} />
                </Button>
              </div>
            </div>
          </div>

          {/* Statistiques Principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover-lift animate-fadeIn p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between mb-2 md:mb-3">
                <div className="flex-1">
                  <p className="text-xs md:text-sm opacity-90">Naissances</p>
                  <p className="text-2xl md:text-4xl font-bold mt-1 md:mt-2">{stats.naissances.total.toLocaleString()}</p>
                </div>
                <Baby className="w-8 h-8 md:w-12 md:h-12 opacity-20 hidden md:block" />
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden md:inline">{stats.naissances.moisActuel} ce mois</span>
                <span className="md:hidden">{stats.naissances.moisActuel}</span>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white hover-lift animate-fadeIn p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between mb-2 md:mb-3">
                <div className="flex-1">
                  <p className="text-xs md:text-sm opacity-90">Mariages</p>
                  <p className="text-2xl md:text-4xl font-bold mt-1 md:mt-2">{stats.mariages.total.toLocaleString()}</p>
                </div>
                <Heart className="w-8 h-8 md:w-12 md:h-12 opacity-20 hidden md:block" />
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden md:inline">{stats.mariages.moisActuel} ce mois</span>
                <span className="md:hidden">{stats.mariages.moisActuel}</span>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white hover-lift animate-fadeIn p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between mb-2 md:mb-3">
                <div className="flex-1">
                  <p className="text-xs md:text-sm opacity-90">Décès</p>
                  <p className="text-2xl md:text-4xl font-bold mt-1 md:mt-2">{stats.deces.total.toLocaleString()}</p>
                </div>
                <Cross className="w-8 h-8 md:w-12 md:h-12 opacity-20 hidden md:block" />
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden md:inline">{stats.deces.moisActuel} ce mois</span>
                <span className="md:hidden">{stats.deces.moisActuel}</span>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover-lift animate-fadeIn p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between mb-2 md:mb-3">
                <div className="flex-1">
                  <p className="text-xs md:text-sm opacity-90">Demandes</p>
                  <p className="text-2xl md:text-4xl font-bold mt-1 md:mt-2">{stats.demandes.total.toLocaleString()}</p>
                </div>
                <FileText className="w-8 h-8 md:w-12 md:h-12 opacity-20 hidden md:block" />
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm">
                <Calendar className="w-4 h-4" />
                <span className="hidden md:inline">{stats.demandes.en_attente} en attente</span>
                <span className="md:hidden">{stats.demandes.en_attente}</span>
              </div>
            </Card>
          </div>

          {/* Statistiques Secondaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-6">
            <Card className="border-l-4 border-orange-500 hover-lift animate-slideInLeft p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm md:text-base font-semibold text-gray-700">Mairies</h3>
                <Building2 className="text-orange-600" size={20} />
              </div>
              <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3">
                <p className="text-2xl md:text-3xl font-bold text-gray-800">{stats.mairies.total}</p>
                <p className="text-xs md:text-sm text-gray-600">dont {stats.mairies.actives} actives</p>
              </div>
            </Card>

            <Card className="border-l-4 border-blue-500 hover-lift animate-slideInRight p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm md:text-base font-semibold text-gray-700">Agents</h3>
                <Users className="text-blue-600" size={24} />
              </div>
              <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3">
                <p className="text-2xl md:text-3xl font-bold text-gray-800">{stats.agents.total}</p>
                <p className="text-xs md:text-sm text-gray-600">dont {stats.agents.actifs} actifs</p>
              </div>
            </Card>
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            {/* Évolution sur 12 mois */}
            <Card className="animate-scaleIn p-4">
              <h2 className="text-base md:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                <TrendingUp className="text-primary-500" size={20} />
                Évolution 12 Mois
              </h2>
              
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" tick={{fontSize: 10}} />
                  <YAxis tick={{fontSize: 10}} />
                  <Tooltip />
                  <Legend wrapperStyle={{fontSize: '12px'}} />
                  <Line type="monotone" dataKey="naissances" stroke="#22c55e" strokeWidth={2} name="Naissances" />
                  <Line type="monotone" dataKey="mariages" stroke="#ec4899" strokeWidth={2} name="Mariages" />
                  <Line type="monotone" dataKey="deces" stroke="#6b7280" strokeWidth={2} name="Décès" />
                  <Line type="monotone" dataKey="demandes" stroke="#3b82f6" strokeWidth={2} name="Demandes" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Répartition des Demandes */}
            <Card className="animate-scaleIn p-4">
              <h2 className="text-base md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                Répartition Demandes
              </h2>
              
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={repartitionDemandes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {repartitionDemandes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Répartition par Région */}
          <Card className="mb-4 md:mb-6 animate-fadeIn p-4">
            <h2 className="text-base md:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
              <BarChart3 className="text-primary-500" size={20} />
              Activité par Région
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={repartitionRegions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" tick={{fontSize: 10}} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{fontSize: 10}} />
                <Tooltip />
                <Legend wrapperStyle={{fontSize: '12px'}} />
                <Bar dataKey="naissances" fill="#22c55e" name="Naissances" />
                <Bar dataKey="demandes" fill="#3b82f6" name="Demandes" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Performance des Mairies */}
          <Card className="animate-fadeIn p-4">
            <h2 className="text-base md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
              Top 10 Mairies
            </h2>
            
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-2 md:p-3 text-xs md:text-sm font-semibold text-gray-700">Mairie</th>
                    <th className="text-center p-2 md:p-3 text-xs md:text-sm font-semibold text-gray-700">Total</th>
                    <th className="text-center p-2 md:p-3 text-xs md:text-sm font-semibold text-gray-700">Validées</th>
                    <th className="text-center p-2 md:p-3 text-xs md:text-sm font-semibold text-gray-700">Taux</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceMairies.map((mairie, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-2 md:p-3 text-xs md:text-sm font-medium">{mairie.mairie}</td>
                      <td className="p-2 md:p-3 text-xs md:text-sm text-center">{mairie.total}</td>
                      <td className="p-2 md:p-3 text-xs md:text-sm text-center">{mairie.validees}</td>
                      <td className="p-2 md:p-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          mairie.taux >= 80 ? 'bg-green-100 text-green-600' :
                          mairie.taux >= 60 ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {mairie.taux}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Population par Mairie */}
          <Card className="mt-4 md:mt-6 animate-fadeIn p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3 md:mb-4">
              <h2 className="text-base md:text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="text-primary-500" size={20} />
                Population Estimée
              </h2>
              <p className="text-xs md:text-sm text-gray-600">
                Basée sur naissances/décès
              </p>
            </div>
            
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-2 md:p-3 text-xs md:text-sm font-semibold text-gray-700">Mairie</th>
                    <th className="text-left p-2 md:p-3 text-xs md:text-sm font-semibold text-gray-700 hidden md:table-cell">Ville</th>
                    <th className="text-left p-2 md:p-3 text-xs md:text-sm font-semibold text-gray-700 hidden lg:table-cell">Région</th>
                    <th className="text-center p-2 md:p-3 text-xs md:text-sm font-semibold text-gray-700">Naiss.</th>
                    <th className="text-center p-2 md:p-3 text-xs md:text-sm font-semibold text-gray-700 hidden sm:table-cell">Mar.</th>
                    <th className="text-center p-2 md:p-3 text-xs md:text-sm font-semibold text-gray-700 hidden sm:table-cell">Déc.</th>
                    <th className="text-center p-2 md:p-3 text-xs md:text-sm font-semibold text-gray-700">Population</th>
                  </tr>
                </thead>
                <tbody>
                  {populationParMairie.slice(0, 20).map((mairie, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-2 md:p-3 text-xs md:text-sm font-medium">{mairie.nom_mairie}</td>
                      <td className="p-2 md:p-3 text-xs md:text-sm text-gray-600 hidden md:table-cell">{mairie.ville}</td>
                      <td className="p-2 md:p-3 text-xs md:text-sm text-gray-600 hidden lg:table-cell">{mairie.region}</td>
                      <td className="p-2 md:p-3 text-center">
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-600 rounded text-xs font-semibold">
                          {mairie.naissances}
                        </span>
                      </td>
                      <td className="p-2 md:p-3 text-center hidden sm:table-cell">
                        <span className="px-1.5 py-0.5 bg-pink-100 text-pink-600 rounded text-xs font-semibold">
                          {mairie.mariages}
                        </span>
                      </td>
                      <td className="p-2 md:p-3 text-center hidden sm:table-cell">
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-semibold">
                          {mairie.deces}
                        </span>
                      </td>
                      <td className="p-2 md:p-3 text-center">
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                          {mairie.population_estimee.toLocaleString('fr-FR')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {populationParMairie.length === 0 && (
                <div className="text-center py-8 md:py-12 text-gray-500">
                  <Users size={36} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Aucune donnée disponible</p>
                </div>
              )}
            </div>

            {/* Statistiques globales de population */}
            {populationParMairie.length > 0 && (
              <div className="mt-4 md:mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pt-4 border-t">
                <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
                  <p className="text-xs md:text-sm text-blue-600 font-semibold">Population Totale</p>
                  <p className="text-lg md:text-2xl font-bold text-blue-700 mt-1">
                    {populationParMairie.reduce((sum, m) => sum + m.population_estimee, 0).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div className="bg-green-50 p-3 md:p-4 rounded-lg">
                  <p className="text-xs md:text-sm text-green-600 font-semibold">Naissances</p>
                  <p className="text-lg md:text-2xl font-bold text-green-700 mt-1">
                    {populationParMairie.reduce((sum, m) => sum + m.naissances, 0).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div className="bg-pink-50 p-3 md:p-4 rounded-lg">
                  <p className="text-xs md:text-sm text-pink-600 font-semibold">Mariages</p>
                  <p className="text-lg md:text-2xl font-bold text-pink-700 mt-1">
                    {populationParMairie.reduce((sum, m) => sum + m.mariages, 0).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-600 font-semibold">Décès</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-700 mt-1">
                    {populationParMairie.reduce((sum, m) => sum + m.deces, 0).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  )
}
