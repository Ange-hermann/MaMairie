'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { 
  Building2, 
  Users, 
  FileText, 
  TrendingUp,
  Baby,
  Heart,
  Cross,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  BarChart3
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

export default function DashboardMinisterePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [stats, setStats] = useState({
    mairies: {
      total: 0,
      actives: 0,
      inactives: 0,
    },
    agents: {
      total: 0,
    },
    etatCivil: {
      naissances: 0,
      mariages: 0,
      deces: 0,
    },
    demandes: {
      total: 0,
      en_attente: 0,
      traitees: 0,
    },
    alertes: {
      total: 0,
      critiques: 0,
    },
  })

  const [mairiesData, setMairiesData] = useState<any[]>([])
  const [alertes, setAlertes] = useState<any[]>([])
  const [performanceRegions, setPerformanceRegions] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

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
      // Statistiques mairies
      const { data: mairies } = await supabase
        .from('mairies')
        .select('*')

      const mairiesStats = {
        total: mairies?.length || 0,
        actives: mairies?.filter(m => m.statut === 'active').length || 0,
        inactives: mairies?.filter(m => m.statut !== 'active').length || 0,
      }

      // Statistiques agents
      const { data: agents } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'agent')

      // Statistiques état civil (national)
      const { data: naissances } = await supabase
        .from('naissances')
        .select('id')

      const { data: mariages } = await supabase
        .from('mariages')
        .select('id')

      const { data: deces } = await supabase
        .from('deces')
        .select('id')

      // Statistiques demandes
      const { data: demandes } = await supabase
        .from('requests')
        .select('statut')

      const demandesStats = {
        total: demandes?.length || 0,
        en_attente: demandes?.filter(d => d.statut === 'en_attente').length || 0,
        traitees: demandes?.filter(d => d.statut === 'validee' || d.statut === 'prete').length || 0,
      }

      // Alertes
      const { data: alertesData } = await supabase
        .from('alertes_ministere')
        .select('*')
        .eq('statut', 'nouvelle')
        .order('date_detection', { ascending: false })
        .limit(5)

      const alertesStats = {
        total: alertesData?.length || 0,
        critiques: alertesData?.filter(a => a.severite === 'critique').length || 0,
      }

      // Performance par mairie
      const mairiesWithStats = await Promise.all(
        (mairies || []).map(async (mairie) => {
          const { data: demandesMairie } = await supabase
            .from('requests')
            .select('statut, created_at')
            .eq('mairie_id', mairie.id)

          const { data: naissancesMairie } = await supabase
            .from('naissances')
            .select('id')
            .eq('mairie_id', mairie.id)

          return {
            ...mairie,
            demandes: demandesMairie?.length || 0,
            naissances: naissancesMairie?.length || 0,
            en_attente: demandesMairie?.filter(d => d.statut === 'en_attente').length || 0,
          }
        })
      )

      setStats({
        mairies: mairiesStats,
        agents: { total: agents?.length || 0 },
        etatCivil: {
          naissances: naissances?.length || 0,
          mariages: mariages?.length || 0,
          deces: deces?.length || 0,
        },
        demandes: demandesStats,
        alertes: alertesStats,
      })

      setMairiesData(mairiesWithStats)
      setAlertes(alertesData || [])

      // Performance par région (simulé)
      const regionsPerf = [
        { region: 'Abidjan', demandes: 450, naissances: 120, mariages: 45, deces: 18 },
        { region: 'Bouaké', demandes: 180, naissances: 60, mariages: 22, deces: 8 },
        { region: 'Yamoussoukro', demandes: 120, naissances: 40, mariages: 15, deces: 5 },
        { region: 'San-Pédro', demandes: 90, naissances: 30, mariages: 12, deces: 4 },
        { region: 'Korhogo', demandes: 75, naissances: 25, mariages: 10, deces: 3 },
      ]
      setPerformanceRegions(regionsPerf)

    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const getSeveriteColor = (severite: string) => {
    switch (severite) {
      case 'critique': return 'text-red-600 bg-red-100'
      case 'haute': return 'text-orange-600 bg-orange-100'
      case 'moyenne': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

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
            <h1 className="text-2xl md:text-4xl font-bold text-gradient mb-2">
              🏛️ Tableau de Bord National
            </h1>
            <p className="text-sm md:text-base text-gray-600 md:text-lg">
              Supervision de l'état civil - République de Côte d'Ivoire
            </p>
          </div>

          {/* Statistiques Principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Mairies Actives</p>
                  <p className="text-4xl font-bold mt-2">{stats.mairies.actives}</p>
                  <p className="text-xs mt-2 opacity-75">
                    Sur {stats.mairies.total} mairies
                  </p>
                </div>
                <Building2 size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Agents Municipaux</p>
                  <p className="text-4xl font-bold mt-2">{stats.agents.total}</p>
                  <p className="text-xs mt-2 opacity-75">
                    <Users size={14} className="inline mr-1" />
                    Actifs
                  </p>
                </div>
                <Users size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Demandes Nationales</p>
                  <p className="text-4xl font-bold mt-2">{stats.demandes.total}</p>
                  <p className="text-xs mt-2 opacity-75">
                    {stats.demandes.en_attente} en attente
                  </p>
                </div>
                <FileText size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Alertes Actives</p>
                  <p className="text-4xl font-bold mt-2">{stats.alertes.total}</p>
                  <p className="text-xs mt-2 opacity-75">
                    {stats.alertes.critiques} critiques
                  </p>
                </div>
                <AlertTriangle size={48} className="opacity-20" />
              </div>
            </Card>
          </div>

          {/* État Civil National */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card className="border-l-4 border-green-500 hover-lift animate-slideInLeft">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-700">Naissances Nationales</h3>
                <Baby className="text-green-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.etatCivil.naissances.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">Enregistrées au total</p>
            </Card>

            <Card className="border-l-4 border-pink-500 hover-lift animate-fadeIn">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-700">Mariages Célébrés</h3>
                <Heart className="text-pink-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.etatCivil.mariages.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">Au niveau national</p>
            </Card>

            <Card className="border-l-4 border-gray-500 hover-lift animate-slideInRight">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-700">Décès Déclarés</h3>
                <Cross className="text-gray-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.etatCivil.deces.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">Enregistrés</p>
            </Card>
          </div>

          {/* Graphiques et Tableaux */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Performance par Région */}
            <Card className="animate-scaleIn">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="text-primary-500" />
                Performance par Région
              </h2>
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceRegions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="demandes" fill="#3b82f6" name="Demandes" />
                  <Bar dataKey="naissances" fill="#22c55e" name="Naissances" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Alertes Récentes */}
            <Card className="animate-scaleIn">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-500" />
                Alertes Récentes
              </h2>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {alertes.length > 0 ? (
                  alertes.map((alerte) => (
                    <div key={alerte.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeveriteColor(alerte.severite)}`}>
                              {alerte.severite}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(alerte.date_detection).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <p className="font-semibold text-sm text-gray-800">{alerte.titre}</p>
                          <p className="text-xs text-gray-600 mt-1">{alerte.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle size={48} className="mx-auto mb-2 text-green-500" />
                    <p>Aucune alerte active</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Tableau des Mairies */}
          <Card className="animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="text-primary-500" />
              Supervision des Mairies
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-700">Mairie</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Région</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Demandes</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Naissances</th>
                    <th className="text-center p-3 font-semibold text-gray-700">En Attente</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {mairiesData.slice(0, 10).map((mairie) => (
                    <tr key={mairie.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="font-medium">{mairie.nom}</span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">{mairie.region || 'N/A'}</td>
                      <td className="p-3 text-center font-semibold">{mairie.demandes}</td>
                      <td className="p-3 text-center font-semibold">{mairie.naissances}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          mairie.en_attente > 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {mairie.en_attente}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          mairie.statut === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {mairie.statut || 'active'}
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
