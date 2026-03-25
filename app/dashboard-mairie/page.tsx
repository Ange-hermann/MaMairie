'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { StatCard, Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FileText, Users, CheckCircle, Download, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function DashboardMairiePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Forcer le rafraîchissement de la session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/login')
          return
        }

        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Erreur profil:', error)
        } else {
          setUserData(profile)
        }
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router, supabase])

  const [stats] = useState({
    aTraiter: 8,
    validees: 120,
    numerises: 3500,
    utilisateurs: 850,
  })

  const [pendingRequests] = useState([
    {
      id: '1',
      citoyen: 'Kouassi Awa',
      type: 'Extrait de Naissance',
      date: '15/01/2024',
    },
    {
      id: '2',
      citoyen: 'Touré Koffi',
      type: 'Extrait de Mariage',
      date: '14/01/2024',
    },
  ])

  const monthlyData = [
    { name: 'Déc', Demandes: 30, Mariage: 40, Décès: 20 },
    { name: 'Janv', Demandes: 45, Mariage: 30, Décès: 25 },
    { name: 'Févr', Demandes: 60, Mariage: 50, Décès: 30 },
    { name: 'Mars', Demandes: 80, Mariage: 60, Décès: 40 },
  ]

  const pieData = [
    { name: 'Naissance', value: 60, color: '#22c55e' },
    { name: 'Mariage', value: 25, color: '#f97316' },
    { name: 'Décès', value: 15, color: '#6b7280' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="agent" />
      
      <div className="flex-1">
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Chargement...'}
          userRole={userData?.role || 'agent'}
          avatarUrl={userData?.avatar_url}
        />
        
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Demandes à Traiter"
              value={stats.aTraiter}
              icon={<FileText />}
              color="orange"
            />
            <StatCard
              title="Actes Validés"
              value={stats.validees}
              icon={<CheckCircle />}
              color="green"
            />
            <StatCard
              title="Actes Numérisés"
              value={stats.numerises.toLocaleString()}
              icon={<FileText />}
              color="blue"
            />
            <StatCard
              title="Utilisateurs"
              value={stats.utilisateurs}
              icon={<Users />}
              color="gray"
            />
          </div>

          {/* Pending Requests */}
          <Card className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Demandes en Attente
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Citoyen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type d'Acte
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date de Demande
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut/Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{request.citoyen}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {request.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {request.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Button variant="success" size="sm">
                            <CheckCircle size={16} className="mr-1" />
                            Valider
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye size={16} className="mr-1" />
                            Voir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Statistics */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Statistiques Mensuelles
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Demandes" fill="#f97316" />
                  <Bar dataKey="Mariage" fill="#22c55e" />
                  <Bar dataKey="Décès" fill="#6b7280" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Répartition des Actes
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
