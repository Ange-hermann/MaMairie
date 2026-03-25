'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FileText, Download, Clock, CheckCircle, FileCheck } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function DashboardCitoyenPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    enCours: 0,
    documentsRecus: 0,
  })
  const [recentRequests, setRecentRequests] = useState<any[]>([])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Récupérer l'utilisateur connecté
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.push('/login')
          return
        }

        // Récupérer le profil utilisateur
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Erreur profil:', profileError)
        } else {
          setUserData(profile)
        }

        // Récupérer les demandes de l'utilisateur
        const { data: requests, error: requestsError } = await supabase
          .from('requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (requestsError) {
          console.error('Erreur demandes:', requestsError)
        } else {
          setRecentRequests(requests || [])
          
          // Calculer les statistiques
          const enCours = requests?.filter(r => r.statut === 'en_attente' || r.statut === 'en_traitement').length || 0
          const documentsRecus = requests?.filter(r => r.statut === 'validee' || r.statut === 'prete').length || 0
          
          setStats({
            enCours,
            documentsRecus,
          })
        }
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar role="citoyen" />
      
      {/* Main Content */}
      <div className="flex-1 w-full lg:w-auto">
        {/* Header */}
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Chargement...'}
          userRole="citoyen"
          avatarUrl={userData?.avatar_url}
        />
        
        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">
          {/* Welcome Message */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Bienvenue, {userData ? `${userData.prenom} ${userData.nom}` : 'Chargement...'}
            </h1>
            <p className="text-sm md:text-base text-gray-600">Voici un aperçu de vos demandes et documents</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Demandes en cours */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Demandes en cours</p>
                  <p className="text-5xl font-bold mb-2">{stats.enCours}</p>
                  <p className="text-sm opacity-80">En attente de validation</p>
                </div>
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Clock size={40} strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Documents Reçus */}
            <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Documents Reçus</p>
                  <p className="text-5xl font-bold mb-2">{stats.documentsRecus}</p>
                  <p className="text-sm opacity-80">Téléchargements disponibles</p>
                </div>
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <FileCheck size={40} strokeWidth={2} />
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            {/* Left Column - Quick Action */}
            <Card className="h-fit">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                <FileText className="text-primary-500" size={24} />
                Demander un Extrait d'Acte
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type d'Acte <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white text-gray-700">
                    <option value="">Sélectionner...</option>
                    <option value="naissance">Extrait de Naissance</option>
                    <option value="mariage">Extrait de Mariage</option>
                    <option value="deces">Extrait de Décès</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date de Naissance <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    defaultValue="2024-12-15"
                  />
                </div>
                
                <Link href="/demande-extrait" className="block">
                  <Button variant="primary" className="w-full py-3 text-base font-semibold">
                    Soumettre la Demande
                  </Button>
                </Link>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Astuce :</strong> Préparez vos documents avant de faire une demande pour un traitement plus rapide.
                  </p>
                </div>
              </div>
            </Card>

            {/* Right Column - Recent Requests */}
            <Card className="h-fit">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FileCheck className="text-secondary-500" size={28} />
                  Mes Demandes Récentes
                </h2>
                <Link href="/mes-demandes">
                  <button className="text-primary-500 hover:text-primary-600 font-semibold text-sm hover:underline">
                    Voir tout →
                  </button>
                </Link>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Chargement des demandes...</p>
                  </div>
                ) : recentRequests.length > 0 ? (
                  recentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all border border-gray-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="text-primary-500" size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {request.type_acte === 'naissance' ? 'Extrait de Naissance' : 
                             request.type_acte === 'mariage' ? 'Extrait de Mariage' : 
                             request.type_acte === 'deces' ? 'Extrait de Décès' : 
                             'Document'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(request.created_at || request.date)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {request.statut === 'en_attente' && (
                          <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                            En attente
                          </span>
                        )}
                        {request.statut === 'en_traitement' && (
                          <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                            En traitement
                          </span>
                        )}
                        {(request.statut === 'validee' || request.statut === 'prete') && (
                          <>
                            <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                              Prêt
                            </span>
                            <Button variant="success" size="sm">
                              <Download size={14} className="mr-1" />
                              PDF
                            </Button>
                          </>
                        )}
                        {request.statut === 'rejetee' && (
                          <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                            Rejetée
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText size={48} className="mx-auto mb-3 opacity-30" />
                    <p>Aucune demande récente</p>
                    <p className="text-sm mt-2">Créez votre première demande pour commencer</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Success Message */}
          <div className="mt-8 bg-green-50 border-l-4 border-green-500 rounded-lg p-5 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="text-white" size={24} />
            </div>
            <div>
              <p className="text-green-900 font-bold text-base">Demande validée avec succès!</p>
              <p className="text-green-700 text-sm">Votre document est prêt à être téléchargé.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
