'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { 
  AlertTriangle, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Shield,
  FileWarning,
  TrendingDown,
  Ban
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function AlertesMinisterePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [alertes, setAlertes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedSeverite, setSelectedSeverite] = useState('all')
  const [selectedStatut, setSelectedStatut] = useState('nouvelle')
  const [showDetails, setShowDetails] = useState(false)
  const [selectedAlerte, setSelectedAlerte] = useState<any>(null)

  const [stats, setStats] = useState({
    total: 0,
    nouvelles: 0,
    critiques: 0,
    resolues: 0,
  })

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
      await fetchAlertes()

    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAlertes = async () => {
    try {
      const { data: alertesData } = await supabase
        .from('alertes_ministere')
        .select(`
          *,
          mairies (
            id,
            nom,
            ville,
            region
          ),
          users!alertes_ministere_agent_id_fkey (
            id,
            nom,
            prenom,
            email
          )
        `)
        .order('date_detection', { ascending: false })

      if (alertesData) {
        setAlertes(alertesData)

        // Calculer stats
        const statsData = {
          total: alertesData.length,
          nouvelles: alertesData.filter(a => a.statut === 'nouvelle').length,
          critiques: alertesData.filter(a => a.severite === 'critique').length,
          resolues: alertesData.filter(a => a.statut === 'resolue').length,
        }
        setStats(statsData)
      }

      // Détecter nouvelles anomalies
      await detecterAnomalies()

    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const detecterAnomalies = async () => {
    try {
      // 1. Détecter les retards importants
      const { data: demandesEnRetard } = await supabase
        .from('requests')
        .select('id, mairie_id, created_at')
        .eq('statut', 'en_attente')
        .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      if (demandesEnRetard && demandesEnRetard.length > 0) {
        // Grouper par mairie
        const mairiesRetard = demandesEnRetard.reduce((acc: any, demande) => {
          if (!acc[demande.mairie_id]) {
            acc[demande.mairie_id] = []
          }
          acc[demande.mairie_id].push(demande)
          return acc
        }, {})

        // Créer alertes pour mairies avec plus de 10 demandes en retard
        for (const [mairieId, demandes] of Object.entries(mairiesRetard)) {
          const demandesArray = demandes as any[]
          if (demandesArray.length >= 10) {
            // Vérifier si alerte existe déjà
            const { data: existingAlerte } = await supabase
              .from('alertes_ministere')
              .select('id')
              .eq('type', 'retard')
              .eq('mairie_id', mairieId)
              .eq('statut', 'nouvelle')
              .single()

            if (!existingAlerte) {
              await supabase
                .from('alertes_ministere')
                .insert([{
                  type: 'retard',
                  severite: demandesArray.length > 20 ? 'critique' : 'haute',
                  mairie_id: mairieId,
                  titre: 'Retard important dans le traitement des demandes',
                  description: `${demandesArray.length} demandes en attente depuis plus de 7 jours`,
                  statut: 'nouvelle',
                }])
            }
          }
        }
      }

      // 2. Détecter les mairies inactives
      const { data: mairies } = await supabase
        .from('mairies')
        .select('id, nom')

      if (mairies) {
        for (const mairie of mairies) {
          const { data: activiteRecente } = await supabase
            .from('requests')
            .select('id')
            .eq('mairie_id', mairie.id)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

          if (!activiteRecente || activiteRecente.length === 0) {
            // Vérifier si alerte existe déjà
            const { data: existingAlerte } = await supabase
              .from('alertes_ministere')
              .select('id')
              .eq('type', 'inactivite')
              .eq('mairie_id', mairie.id)
              .eq('statut', 'nouvelle')
              .single()

            if (!existingAlerte) {
              await supabase
                .from('alertes_ministere')
                .insert([{
                  type: 'inactivite',
                  severite: 'moyenne',
                  mairie_id: mairie.id,
                  titre: 'Mairie inactive',
                  description: 'Aucune activité détectée depuis 30 jours',
                  statut: 'nouvelle',
                }])
            }
          }
        }
      }

    } catch (error) {
      console.error('Erreur détection anomalies:', error)
    }
  }

  const getSeveriteColor = (severite: string) => {
    switch (severite) {
      case 'critique': return 'bg-red-100 text-red-600 border-red-200'
      case 'haute': return 'bg-orange-100 text-orange-600 border-orange-200'
      case 'moyenne': return 'bg-yellow-100 text-yellow-600 border-yellow-200'
      default: return 'bg-blue-100 text-blue-600 border-blue-200'
    }
  }

  const getSeveriteIcon = (severite: string) => {
    switch (severite) {
      case 'critique': return <XCircle className="text-red-600" size={20} />
      case 'haute': return <AlertTriangle className="text-orange-600" size={20} />
      case 'moyenne': return <AlertCircle className="text-yellow-600" size={20} />
      default: return <AlertCircle className="text-blue-600" size={20} />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'retard': return <Clock className="text-orange-600" size={20} />
      case 'fraude': return <Shield className="text-red-600" size={20} />
      case 'erreur': return <FileWarning className="text-yellow-600" size={20} />
      case 'inactivite': return <TrendingDown className="text-gray-600" size={20} />
      default: return <AlertCircle className="text-blue-600" size={20} />
    }
  }

  const changerStatut = async (alerteId: string, nouveauStatut: string) => {
    try {
      const { error } = await supabase
        .from('alertes_ministere')
        .update({ 
          statut: nouveauStatut,
          date_resolution: nouveauStatut === 'resolue' ? new Date().toISOString() : null,
          resolu_par: nouveauStatut === 'resolue' ? userData.id : null,
        })
        .eq('id', alerteId)

      if (error) throw error

      alert(`✅ Statut mis à jour : ${nouveauStatut}`)
      fetchAlertes()
      setShowDetails(false)
    } catch (error: any) {
      alert('❌ Erreur : ' + error.message)
    }
  }

  const viewDetails = (alerte: any) => {
    setSelectedAlerte(alerte)
    setShowDetails(true)
  }

  const filteredAlertes = alertes.filter(alerte => {
    const matchSearch = 
      alerte.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alerte.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alerte.mairies?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchType = selectedType === 'all' || alerte.type === selectedType
    const matchSeverite = selectedSeverite === 'all' || alerte.severite === selectedSeverite
    const matchStatut = selectedStatut === 'all' || alerte.statut === selectedStatut
    
    return matchSearch && matchType && matchSeverite && matchStatut
  })

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
      
      <div className="flex-1">
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Ministère'}
          userRole="ministere"
          avatarUrl={userData?.avatar_url}
        />
        
        <main className="p-6">
          {/* En-tête */}
          <div className="mb-6 flex items-center justify-between animate-fadeIn">
            <div>
              <h1 className="text-3xl font-bold text-gradient mb-2 flex items-center gap-3">
                <AlertTriangle className="text-primary-500" size={36} />
                Alertes & Anomalies
              </h1>
              <p className="text-gray-600">
                Détection et gestion des anomalies au niveau national
              </p>
            </div>
            
            <Button
              onClick={() => fetchAlertes()}
              className="btn-ripple hover-glow"
            >
              <Shield size={20} className="mr-2" />
              Détecter Anomalies
            </Button>
          </div>

          {/* Statistiques */}
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Alertes</p>
                  <p className="text-4xl font-bold mt-2">{stats.total}</p>
                </div>
                <AlertCircle size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Nouvelles</p>
                  <p className="text-4xl font-bold mt-2">{stats.nouvelles}</p>
                </div>
                <AlertTriangle size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Critiques</p>
                  <p className="text-4xl font-bold mt-2">{stats.critiques}</p>
                </div>
                <XCircle size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Résolues</p>
                  <p className="text-4xl font-bold mt-2">{stats.resolues}</p>
                </div>
                <CheckCircle size={48} className="opacity-20" />
              </div>
            </Card>
          </div>

          {/* Filtres */}
          <Card className="mb-6 animate-scaleIn">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                label=""
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                options={[
                  { value: 'all', label: 'Tous les types' },
                  { value: 'retard', label: 'Retards' },
                  { value: 'fraude', label: 'Fraudes' },
                  { value: 'erreur', label: 'Erreurs' },
                  { value: 'inactivite', label: 'Inactivité' },
                  { value: 'anomalie', label: 'Anomalies' },
                ]}
              />

              <Select
                label=""
                value={selectedSeverite}
                onChange={(e) => setSelectedSeverite(e.target.value)}
                options={[
                  { value: 'all', label: 'Toutes sévérités' },
                  { value: 'critique', label: 'Critique' },
                  { value: 'haute', label: 'Haute' },
                  { value: 'moyenne', label: 'Moyenne' },
                  { value: 'faible', label: 'Faible' },
                ]}
              />

              <Select
                label=""
                value={selectedStatut}
                onChange={(e) => setSelectedStatut(e.target.value)}
                options={[
                  { value: 'all', label: 'Tous les statuts' },
                  { value: 'nouvelle', label: 'Nouvelles' },
                  { value: 'en_cours', label: 'En cours' },
                  { value: 'resolue', label: 'Résolues' },
                  { value: 'ignoree', label: 'Ignorées' },
                ]}
              />
            </div>
          </Card>

          {/* Liste des Alertes */}
          <div className="space-y-4 animate-fadeIn">
            {filteredAlertes.map((alerte) => (
              <Card 
                key={alerte.id} 
                className={`border-l-4 hover-lift cursor-pointer transition ${
                  alerte.severite === 'critique' ? 'border-red-500' :
                  alerte.severite === 'haute' ? 'border-orange-500' :
                  alerte.severite === 'moyenne' ? 'border-yellow-500' :
                  'border-blue-500'
                }`}
                onClick={() => viewDetails(alerte)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getTypeIcon(alerte.type)}
                      <h3 className="font-bold text-lg text-gray-800">{alerte.titre}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeveriteColor(alerte.severite)}`}>
                        {alerte.severite}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        alerte.statut === 'resolue' ? 'bg-green-100 text-green-600' :
                        alerte.statut === 'en_cours' ? 'bg-blue-100 text-blue-600' :
                        alerte.statut === 'ignoree' ? 'bg-gray-100 text-gray-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {alerte.statut}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">{alerte.description}</p>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      {alerte.mairies && (
                        <div className="flex items-center gap-1">
                          <AlertCircle size={14} />
                          <span>{alerte.mairies.nom} - {alerte.mairies.region}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{new Date(alerte.date_detection).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {alerte.users && (
                        <div className="flex items-center gap-1">
                          <Shield size={14} />
                          <span>Agent: {alerte.users.prenom} {alerte.users.nom}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      viewDetails(alerte)
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <Eye size={20} className="text-gray-600" />
                  </button>
                </div>
              </Card>
            ))}

            {filteredAlertes.length === 0 && (
              <Card className="text-center py-12">
                <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
                <p className="text-gray-600 text-lg">Aucune alerte trouvée</p>
                <p className="text-gray-500 text-sm mt-2">Le système fonctionne normalement</p>
              </Card>
            )}
          </div>

          {/* Modal Détails Alerte */}
          {showDetails && selectedAlerte && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
              <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    {getSeveriteIcon(selectedAlerte.severite)}
                    Détails de l'Alerte
                  </h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Informations Principales */}
                  <div className={`p-4 rounded-lg border-2 ${getSeveriteColor(selectedAlerte.severite)}`}>
                    <div className="flex items-center gap-3 mb-3">
                      {getTypeIcon(selectedAlerte.type)}
                      <h3 className="text-xl font-bold">{selectedAlerte.titre}</h3>
                    </div>
                    <p className="text-gray-700">{selectedAlerte.description}</p>
                  </div>

                  {/* Détails */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Type</p>
                      <p className="font-semibold capitalize">{selectedAlerte.type}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Sévérité</p>
                      <p className="font-semibold capitalize">{selectedAlerte.severite}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Date de détection</p>
                      <p className="font-semibold">
                        {new Date(selectedAlerte.date_detection).toLocaleString('fr-FR')}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Statut</p>
                      <p className="font-semibold capitalize">{selectedAlerte.statut}</p>
                    </div>
                  </div>

                  {/* Mairie concernée */}
                  {selectedAlerte.mairies && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-2">Mairie concernée</h4>
                      <p className="font-medium">{selectedAlerte.mairies.nom}</p>
                      <p className="text-sm text-gray-600">{selectedAlerte.mairies.ville} - {selectedAlerte.mairies.region}</p>
                    </div>
                  )}

                  {/* Agent concerné */}
                  {selectedAlerte.users && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-2">Agent concerné</h4>
                      <p className="font-medium">{selectedAlerte.users.prenom} {selectedAlerte.users.nom}</p>
                      <p className="text-sm text-gray-600">{selectedAlerte.users.email}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    {selectedAlerte.statut === 'nouvelle' && (
                      <>
                        <Button
                          onClick={() => changerStatut(selectedAlerte.id, 'en_cours')}
                          className="flex-1"
                        >
                          <Clock size={20} className="mr-2" />
                          Prendre en Charge
                        </Button>
                        <Button
                          onClick={() => changerStatut(selectedAlerte.id, 'ignoree')}
                          variant="outline"
                          className="flex-1"
                        >
                          <Ban size={20} className="mr-2" />
                          Ignorer
                        </Button>
                      </>
                    )}

                    {selectedAlerte.statut === 'en_cours' && (
                      <Button
                        onClick={() => changerStatut(selectedAlerte.id, 'resolue')}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check size={20} className="mr-2" />
                        Marquer comme Résolue
                      </Button>
                    )}

                    {selectedAlerte.statut === 'resolue' && (
                      <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <CheckCircle className="mx-auto mb-2 text-green-600" size={32} />
                        <p className="font-semibold text-green-600">Alerte Résolue</p>
                        {selectedAlerte.date_resolution && (
                          <p className="text-sm text-gray-600 mt-1">
                            Le {new Date(selectedAlerte.date_resolution).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
