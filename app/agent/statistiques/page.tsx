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
  Users, 
  FileText, 
  Baby, 
  Heart, 
  Cross,
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

export default function StatistiquesPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [periode, setPeriode] = useState('mois') // mois, trimestre, annee
  
  const [stats, setStats] = useState({
    demandes: {
      total: 0,
      en_attente: 0,
      en_traitement: 0,
      validees: 0,
      rejetees: 0,
    },
    etatCivil: {
      naissances: 0,
      mariages: 0,
      deces: 0,
    },
    evolution: [] as any[],
    repartition: [] as any[],
  })

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

      if (profile) {
        setUserData(profile)
        await fetchStatistics(profile.mairie_id)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async (mairieId: string) => {
    try {
      // Statistiques des demandes
      const { data: demandes } = await supabase
        .from('requests')
        .select('statut, created_at')
        .eq('mairie_id', mairieId)

      const demandesStats = {
        total: demandes?.length || 0,
        en_attente: demandes?.filter(d => d.statut === 'en_attente').length || 0,
        en_traitement: demandes?.filter(d => d.statut === 'en_traitement').length || 0,
        validees: demandes?.filter(d => d.statut === 'validee' || d.statut === 'prete').length || 0,
        rejetees: demandes?.filter(d => d.statut === 'rejetee').length || 0,
      }

      // Statistiques état civil
      const { data: naissances } = await supabase
        .from('naissances')
        .select('id, created_at')
        .eq('mairie_id', mairieId)

      const { data: mariages } = await supabase
        .from('mariages')
        .select('id, created_at')
        .eq('mairie_id', mairieId)

      const { data: deces } = await supabase
        .from('deces')
        .select('id, created_at')
        .eq('mairie_id', mairieId)

      // Évolution par mois (6 derniers mois)
      const evolution = calculateEvolution(demandes || [], naissances || [], mariages || [], deces || [])

      // Répartition des demandes
      const repartition = [
        { name: 'En attente', value: demandesStats.en_attente, color: '#f97316' },
        { name: 'En traitement', value: demandesStats.en_traitement, color: '#3b82f6' },
        { name: 'Validées', value: demandesStats.validees, color: '#22c55e' },
        { name: 'Rejetées', value: demandesStats.rejetees, color: '#ef4444' },
      ]

      setStats({
        demandes: demandesStats,
        etatCivil: {
          naissances: naissances?.length || 0,
          mariages: mariages?.length || 0,
          deces: deces?.length || 0,
        },
        evolution,
        repartition,
      })
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const calculateEvolution = (demandes: any[], naissances: any[], mariages: any[], deces: any[]) => {
    const months = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short' })
      
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const demandesCount = demandes.filter(d => {
        const createdAt = new Date(d.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).length
      
      const naissancesCount = naissances.filter(n => {
        const createdAt = new Date(n.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).length
      
      const mariagesCount = mariages.filter(m => {
        const createdAt = new Date(m.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).length
      
      const decesCount = deces.filter(d => {
        const createdAt = new Date(d.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).length
      
      months.push({
        mois: monthName,
        demandes: demandesCount,
        naissances: naissancesCount,
        mariages: mariagesCount,
        deces: decesCount,
      })
    }
    
    return months
  }

  const exportData = () => {
    const data = {
      periode: periode,
      date_export: new Date().toISOString(),
      statistiques: stats,
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `statistiques_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    alert('✅ Statistiques exportées !')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="agent" />
      
      <div className="flex-1 w-full lg:w-auto">
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Chargement...'}
          userRole="agent" 
        />
        
        <main className="p-4 md:p-6">
          {/* En-tête */}
          <div className="mb-4 md:mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2 md:gap-3">
                <BarChart3 className="text-primary-500" size={28} />
                Statistiques
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Analyse et suivi des activités de la mairie
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
                ]}
              />
              
              <Button
                variant="outline"
                onClick={exportData}
                className="flex items-center gap-2"
              >
                <Download size={20} />
                Exporter
              </Button>
            </div>
          </div>

          {/* Cartes Statistiques Principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Demandes</p>
                  <p className="text-4xl font-bold mt-2">{stats.demandes.total}</p>
                  <p className="text-xs mt-2 opacity-75">
                    <TrendingUp size={14} className="inline mr-1" />
                    Toutes périodes
                  </p>
                </div>
                <FileText size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Naissances</p>
                  <p className="text-4xl font-bold mt-2">{stats.etatCivil.naissances}</p>
                  <p className="text-xs mt-2 opacity-75">
                    <Baby size={14} className="inline mr-1" />
                    Enregistrées
                  </p>
                </div>
                <Baby size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Mariages</p>
                  <p className="text-4xl font-bold mt-2">{stats.etatCivil.mariages}</p>
                  <p className="text-xs mt-2 opacity-75">
                    <Heart size={14} className="inline mr-1" />
                    Célébrés
                  </p>
                </div>
                <Heart size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-gray-600 to-gray-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Décès</p>
                  <p className="text-4xl font-bold mt-2">{stats.etatCivil.deces}</p>
                  <p className="text-xs mt-2 opacity-75">
                    <Cross size={14} className="inline mr-1" />
                    Déclarés
                  </p>
                </div>
                <Cross size={48} className="opacity-20" />
              </div>
            </Card>
          </div>

          {/* Graphiques */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Évolution */}
            <Card>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                📈 Évolution des Activités
              </h2>
              
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.evolution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="demandes" stroke="#3b82f6" name="Demandes" strokeWidth={2} />
                  <Line type="monotone" dataKey="naissances" stroke="#22c55e" name="Naissances" strokeWidth={2} />
                  <Line type="monotone" dataKey="mariages" stroke="#ec4899" name="Mariages" strokeWidth={2} />
                  <Line type="monotone" dataKey="deces" stroke="#6b7280" name="Décès" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Répartition des Demandes */}
            <Card>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                🥧 Répartition des Demandes
              </h2>
              
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.repartition}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.repartition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Graphique en Barres */}
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              📊 Comparaison Mensuelle
            </h2>
            
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats.evolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="demandes" fill="#3b82f6" name="Demandes" />
                <Bar dataKey="naissances" fill="#22c55e" name="Naissances" />
                <Bar dataKey="mariages" fill="#ec4899" name="Mariages" />
                <Bar dataKey="deces" fill="#6b7280" name="Décès" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Détails des Demandes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <Card className="border-l-4 border-orange-500">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-700">En Attente</h3>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="text-orange-600" size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.demandes.en_attente}</p>
              <p className="text-sm text-gray-600 mt-1">
                {((stats.demandes.en_attente / stats.demandes.total) * 100 || 0).toFixed(1)}% du total
              </p>
            </Card>

            <Card className="border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-700">En Traitement</h3>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-blue-600" size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.demandes.en_traitement}</p>
              <p className="text-sm text-gray-600 mt-1">
                {((stats.demandes.en_traitement / stats.demandes.total) * 100 || 0).toFixed(1)}% du total
              </p>
            </Card>

            <Card className="border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-700">Validées</h3>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="text-green-600" size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.demandes.validees}</p>
              <p className="text-sm text-gray-600 mt-1">
                {((stats.demandes.validees / stats.demandes.total) * 100 || 0).toFixed(1)}% du total
              </p>
            </Card>

            <Card className="border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-700">Rejetées</h3>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Cross className="text-red-600" size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.demandes.rejetees}</p>
              <p className="text-sm text-gray-600 mt-1">
                {((stats.demandes.rejetees / stats.demandes.total) * 100 || 0).toFixed(1)}% du total
              </p>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
