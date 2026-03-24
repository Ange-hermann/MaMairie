'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Building2, 
  Users, 
  FileText, 
  TrendingUp, 
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function DashboardAdminPage() {
  const [stats] = useState({
    totalMairies: 12,
    totalUtilisateurs: 1547,
    totalDemandes: 3892,
    revenuMensuel: 2450000,
  })

  const [mairies] = useState([
    { id: '1', nom: 'Mairie de Cocody', ville: 'Abidjan', agents: 15, demandes: 450, statut: 'active' },
    { id: '2', nom: 'Mairie de Yopougon', ville: 'Abidjan', agents: 12, demandes: 380, statut: 'active' },
    { id: '3', nom: 'Mairie d\'Abobo', ville: 'Abidjan', agents: 10, demandes: 320, statut: 'active' },
    { id: '4', nom: 'Mairie de Plateau', ville: 'Abidjan', agents: 8, demandes: 250, statut: 'active' },
  ])

  const monthlyData = [
    { mois: 'Jan', demandes: 320, revenus: 180000 },
    { mois: 'Fév', demandes: 380, revenus: 210000 },
    { mois: 'Mar', demandes: 420, revenus: 245000 },
    { mois: 'Avr', demandes: 390, revenus: 220000 },
    { mois: 'Mai', demandes: 450, revenus: 260000 },
    { mois: 'Juin', demandes: 480, revenus: 280000 },
  ]

  const mairieData = [
    { name: 'Cocody', value: 450 },
    { name: 'Yopougon', value: 380 },
    { name: 'Abobo', value: 320 },
    { name: 'Plateau', value: 250 },
    { name: 'Autres', value: 500 },
  ]

  const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#eab308', '#8b5cf6']

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="admin" />
      
      <div className="flex-1">
        <Header userName="Admin Système" userRole="admin" />
        
        <main className="p-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Dashboard Administrateur
            </h1>
            <p className="text-gray-600">Vue d'ensemble de toutes les mairies et statistiques globales</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Total Mairies</p>
                  <p className="text-4xl font-bold mb-2">{stats.totalMairies}</p>
                  <p className="text-sm opacity-80">Actives</p>
                </div>
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Building2 size={32} strokeWidth={2} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Utilisateurs</p>
                  <p className="text-4xl font-bold mb-2">{stats.totalUtilisateurs.toLocaleString()}</p>
                  <p className="text-sm opacity-80">Citoyens & Agents</p>
                </div>
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Users size={32} strokeWidth={2} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Total Demandes</p>
                  <p className="text-4xl font-bold mb-2">{stats.totalDemandes.toLocaleString()}</p>
                  <p className="text-sm opacity-80">Toutes mairies</p>
                </div>
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <FileText size={32} strokeWidth={2} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Revenus Mensuels</p>
                  <p className="text-4xl font-bold mb-2">{(stats.revenuMensuel / 1000000).toFixed(1)}M</p>
                  <p className="text-sm opacity-80">FCFA</p>
                </div>
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <TrendingUp size={32} strokeWidth={2} />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Bar Chart */}
            <Card>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Évolution Mensuelle</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="demandes" fill="#f97316" name="Demandes" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Pie Chart */}
            <Card>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Répartition par Mairie</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mairieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mairieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Mairies Table */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Building2 className="text-blue-500" size={28} />
                Gestion des Mairies
              </h2>
              <Button variant="primary">
                <Plus size={16} className="mr-2" />
                Ajouter une Mairie
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mairie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ville
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agents
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Demandes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mairies.map((mairie) => (
                    <tr key={mairie.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="text-blue-500" size={20} />
                          </div>
                          <span className="font-semibold text-gray-800">{mairie.nom}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {mairie.ville}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {mairie.agents}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-primary-600">{mairie.demandes}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye size={14} className="mr-1" />
                            Voir
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit size={14} className="mr-1" />
                            Modifier
                          </Button>
                          <Button variant="danger" size="sm">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Users className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Gestion Utilisateurs</h3>
                  <p className="text-sm text-gray-600">Gérer les comptes et rôles</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Toutes les Demandes</h3>
                  <p className="text-sm text-gray-600">Vue globale des demandes</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <Settings className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Paramètres Système</h3>
                  <p className="text-sm text-gray-600">Configuration générale</p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
