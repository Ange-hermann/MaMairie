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

    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
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
    const { data: regions } = await supabase
      .from('regions')
      .select('nom')
      .limit(10)

    if (!regions) return

    const regionsData = await Promise.all(
      regions.map(async (region) => {
        const { data: mairies } = await supabase
          .from('mairies')
          .select('id')
          .eq('region', region.nom)

        const mairieIds = mairies?.map(m => m.id) || []

        const { data: naissances } = await supabase
          .from('naissances')
          .select('id')
          .in('mairie_id', mairieIds)

        const { data: demandes } = await supabase
          .from('requests')
          .select('id')
          .in('mairie_id', mairieIds)

        return {
          region: region.nom,
          naissances: naissances?.length || 0,
          demandes: demandes?.length || 0,
        }
      })
    )

    setRepartitionRegions(regionsData)
  }

  const fetchPerformanceMairies = async () => {
    const { data: mairies } = await supabase
      .from('mairies')
      .select('id, nom, ville')
      .limit(10)

    if (!mairies) return

    const performance = await Promise.all(
      mairies.map(async (mairie) => {
        const { data: demandes } = await supabase
          .from('requests')
          .select('statut')
          .eq('mairie_id', mairie.id)

        const total = demandes?.length || 0
        const validees = demandes?.filter(d => d.statut === 'validee').length || 0
        const taux = total > 0 ? Math.round((validees / total) * 100) : 0

        return {
          mairie: mairie.nom,
          total: total,
          validees: validees,
          taux: taux,
        }
      })
    )

    setPerformanceMairies(performance.sort((a, b) => b.total - a.total))
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
          <div className="mb-4 md:mb-6 flex items-center justify-between animate-fadeIn">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-2 flex items-center gap-3">
                <BarChart3 className="text-primary-500" size={36} />
                Statistiques Nationales
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Vue d'ensemble de l'état civil en Côte d'Ivoire
              </p>
            </div>
            
            <div className="flex gap-3">
              <Select
                label=""
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                options={[
                  { value: 'mois', label: 'Ce mois' },
                  { value: 'trimestre', label: 'Ce trimestre' },
                  { value: 'annee', label: 'Cette année' },
                  { value: 'tout', label: 'Tout' },
                ]}
              />
              
              <Button onClick={exportData} variant="outline">
                <Download size={20} className="mr-2" />
                Exporter
              </Button>
            </div>
          </div>

          {/* Statistiques Principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm opacity-90">Naissances</p>
                  <p className="text-4xl font-bold mt-2">{stats.naissances.total.toLocaleString()}</p>
                </div>
                <Baby size={48} className="opacity-20" />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp size={16} />
                <span>{stats.naissances.moisActuel} ce mois</span>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm opacity-90">Mariages</p>
                  <p className="text-4xl font-bold mt-2">{stats.mariages.total.toLocaleString()}</p>
                </div>
                <Heart size={48} className="opacity-20" />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp size={16} />
                <span>{stats.mariages.moisActuel} ce mois</span>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm opacity-90">Décès</p>
                  <p className="text-4xl font-bold mt-2">{stats.deces.total.toLocaleString()}</p>
                </div>
                <Cross size={48} className="opacity-20" />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp size={16} />
                <span>{stats.deces.moisActuel} ce mois</span>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm opacity-90">Demandes</p>
                  <p className="text-4xl font-bold mt-2">{stats.demandes.total.toLocaleString()}</p>
                </div>
                <FileText size={48} className="opacity-20" />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} />
                <span>{stats.demandes.en_attente} en attente</span>
              </div>
            </Card>
          </div>

          {/* Statistiques Secondaires */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mb-6">
            <Card className="border-l-4 border-orange-500 hover-lift animate-slideInLeft">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-700">Mairies</h3>
                <Building2 className="text-orange-600" size={24} />
              </div>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-bold text-gray-800">{stats.mairies.total}</p>
                <p className="text-sm text-gray-600">dont {stats.mairies.actives} actives</p>
              </div>
            </Card>

            <Card className="border-l-4 border-blue-500 hover-lift animate-slideInRight">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-700">Agents Municipaux</h3>
                <Users className="text-blue-600" size={24} />
              </div>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-bold text-gray-800">{stats.agents.total}</p>
                <p className="text-sm text-gray-600">dont {stats.agents.actifs} actifs</p>
              </div>
            </Card>
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mb-6">
            {/* Évolution sur 12 mois */}
            <Card className="animate-scaleIn">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="text-primary-500" />
                Évolution sur 12 Mois
              </h2>
              
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="naissances" stroke="#22c55e" strokeWidth={2} name="Naissances" />
                  <Line type="monotone" dataKey="mariages" stroke="#ec4899" strokeWidth={2} name="Mariages" />
                  <Line type="monotone" dataKey="deces" stroke="#6b7280" strokeWidth={2} name="Décès" />
                  <Line type="monotone" dataKey="demandes" stroke="#3b82f6" strokeWidth={2} name="Demandes" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Répartition des Demandes */}
            <Card className="animate-scaleIn">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Répartition des Demandes
              </h2>
              
              <ResponsiveContainer width="100%" height={300}>
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
          <Card className="mb-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="text-primary-500" />
              Activité par Région
            </h2>
            
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={repartitionRegions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="naissances" fill="#22c55e" name="Naissances" />
                <Bar dataKey="demandes" fill="#3b82f6" name="Demandes" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Performance des Mairies */}
          <Card className="animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Top 10 Mairies - Performance
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-700">Mairie</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Total Demandes</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Validées</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Taux de Validation</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceMairies.map((mairie, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-medium">{mairie.mairie}</td>
                      <td className="p-3 text-center">{mairie.total}</td>
                      <td className="p-3 text-center">{mairie.validees}</td>
                      <td className="p-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
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
        </main>
      </div>
    </div>
  )
}
