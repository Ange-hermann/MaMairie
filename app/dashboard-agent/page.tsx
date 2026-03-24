'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { 
  LayoutDashboard, 
  FileText, 
  Baby, 
  Heart, 
  Cross,
  Clock,
  CheckCircle,
  TrendingUp
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardAgentPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    demandesEnAttente: 0,
    demandesTraitees: 0,
    naissances: 0,
    mariages: 0,
    deces: 0,
  })
  const [recentDemandes, setRecentDemandes] = useState<any[]>([])

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

      // Récupérer le profil
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUserData(profile)
        
        // Vérifier que c'est bien un agent
        if (profile.role !== 'agent' && profile.role !== 'admin') {
          router.push('/dashboard-citoyen')
          return
        }

        // Récupérer les statistiques des demandes
        const { data: demandes } = await supabase
          .from('requests')
          .select('*')
          .eq('mairie_id', profile.mairie_id)

        const demandesEnAttente = demandes?.filter(d => d.statut === 'en_attente').length || 0
        const demandesTraitees = demandes?.filter(d => d.statut === 'validee' || d.statut === 'prete').length || 0

        // Récupérer les statistiques état civil
        const { data: naissances } = await supabase
          .from('naissances')
          .select('id')
          .eq('mairie_id', profile.mairie_id)

        const { data: mariages } = await supabase
          .from('mariages')
          .select('id')
          .eq('mairie_id', profile.mairie_id)

        const { data: deces } = await supabase
          .from('deces')
          .select('id')
          .eq('mairie_id', profile.mairie_id)

        setStats({
          demandesEnAttente,
          demandesTraitees,
          naissances: naissances?.length || 0,
          mariages: mariages?.length || 0,
          deces: deces?.length || 0,
        })

        // Récupérer les demandes récentes
        const { data: recentDemandesData } = await supabase
          .from('requests')
          .select('*')
          .eq('mairie_id', profile.mairie_id)
          .order('created_at', { ascending: false })
          .limit(5)

        setRecentDemandes(recentDemandesData || [])
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (statut: string) => {
    const badges = {
      en_attente: 'bg-orange-100 text-orange-600',
      en_traitement: 'bg-blue-100 text-blue-600',
      validee: 'bg-green-100 text-green-600',
      prete: 'bg-green-100 text-green-600',
      rejetee: 'bg-red-100 text-red-600',
    }
    
    const labels = {
      en_attente: 'En attente',
      en_traitement: 'En traitement',
      validee: 'Validée',
      prete: 'Prête',
      rejetee: 'Rejetée',
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[statut as keyof typeof badges] || 'bg-gray-100 text-gray-600'}`}>
        {labels[statut as keyof typeof labels] || statut}
      </span>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="agent" />
      
      <div className="flex-1">
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Chargement...'}
          userRole="agent"
          avatarUrl={userData?.avatar_url}
        />
        
        <main className="p-8">
          {/* Welcome Message */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <LayoutDashboard className="text-primary-500" size={36} />
              Tableau de Bord Agent
            </h1>
            <p className="text-gray-600">
              Vue d'ensemble de votre mairie et des demandes en cours
            </p>
          </div>

          {/* Stats Cards - Demandes */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Demandes en Attente</p>
                  <p className="text-5xl font-bold mb-2">{stats.demandesEnAttente}</p>
                  <p className="text-sm opacity-80">À traiter</p>
                </div>
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Clock size={40} strokeWidth={2} />
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Demandes Traitées</p>
                  <p className="text-5xl font-bold mb-2">{stats.demandesTraitees}</p>
                  <p className="text-sm opacity-80">Ce mois-ci</p>
                </div>
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <CheckCircle size={40} strokeWidth={2} />
                </div>
              </div>
            </Card>
          </div>

          {/* Stats Cards - État Civil */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">État Civil</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/agent/etat-civil/naissances">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:scale-105 transition-transform cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Naissances</p>
                      <p className="text-4xl font-bold mb-2">{stats.naissances}</p>
                      <p className="text-sm opacity-80">Enregistrées</p>
                    </div>
                    <Baby size={48} className="opacity-20" />
                  </div>
                </Card>
              </Link>

              <Link href="/agent/etat-civil/mariages">
                <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white hover:scale-105 transition-transform cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Mariages</p>
                      <p className="text-4xl font-bold mb-2">{stats.mariages}</p>
                      <p className="text-sm opacity-80">Célébrés</p>
                    </div>
                    <Heart size={48} className="opacity-20" />
                  </div>
                </Card>
              </Link>

              <Link href="/agent/etat-civil/deces">
                <Card className="bg-gradient-to-br from-gray-600 to-gray-700 text-white hover:scale-105 transition-transform cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Décès</p>
                      <p className="text-4xl font-bold mb-2">{stats.deces}</p>
                      <p className="text-sm opacity-80">Déclarés</p>
                    </div>
                    <Cross size={48} className="opacity-20" />
                  </div>
                </Card>
              </Link>
            </div>
          </div>

          {/* Demandes Récentes */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="text-primary-500" size={28} />
                Demandes Récentes
              </h2>
              <Link href="/agent/demandes">
                <button className="text-primary-500 hover:text-primary-600 font-semibold text-sm hover:underline">
                  Voir tout →
                </button>
              </Link>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  Chargement...
                </div>
              ) : recentDemandes.length > 0 ? (
                recentDemandes.map((demande) => (
                  <div
                    key={demande.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all border border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="text-primary-500" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {demande.type_acte === 'naissance' ? 'Extrait de Naissance' : 
                           demande.type_acte === 'mariage' ? 'Extrait de Mariage' : 
                           'Document'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {demande.prenom} {demande.nom}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(demande.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      {getStatusBadge(demande.statut)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText size={48} className="mx-auto mb-3 opacity-30" />
                  <p>Aucune demande récente</p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <TrendingUp className="text-primary-500" size={24} />
                Actions Rapides
              </h3>
              <div className="space-y-2">
                <Link href="/agent/etat-civil/naissances">
                  <button className="w-full text-left px-4 py-3 bg-white rounded-lg hover:bg-primary-50 transition-colors border border-gray-200">
                    <span className="font-medium text-gray-800">➕ Enregistrer une naissance</span>
                  </button>
                </Link>
                <Link href="/agent/demandes">
                  <button className="w-full text-left px-4 py-3 bg-white rounded-lg hover:bg-primary-50 transition-colors border border-gray-200">
                    <span className="font-medium text-gray-800">📋 Traiter les demandes</span>
                  </button>
                </Link>
                <Link href="/agent/documents">
                  <button className="w-full text-left px-4 py-3 bg-white rounded-lg hover:bg-primary-50 transition-colors border border-gray-200">
                    <span className="font-medium text-gray-800">📄 Générer un document</span>
                  </button>
                </Link>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100 border-2 border-secondary-200">
              <h3 className="font-bold text-gray-800 mb-3">💡 Conseils</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-secondary-500 font-bold">•</span>
                  <span>Traitez les demandes en attente en priorité</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary-500 font-bold">•</span>
                  <span>Vérifiez les informations avant validation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary-500 font-bold">•</span>
                  <span>Utilisez la recherche pour trouver rapidement un acte</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary-500 font-bold">•</span>
                  <span>Générez les PDF après validation des demandes</span>
                </li>
              </ul>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
