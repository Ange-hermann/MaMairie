'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { VerificationDocumentsModal } from '@/components/VerificationDocumentsModal'
import { FileText, Search, Eye, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { getTypeMentionLabel } from '@/lib/generateCodeMention'

export default function AvisMentionsAgentPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [avis, setAvis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('tous')
  const [activeTab, setActiveTab] = useState<'validation' | 'traitement'>('validation')
  const [selectedAvis, setSelectedAvis] = useState<any>(null)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showRejetModal, setShowRejetModal] = useState(false)
  const [motifRejet, setMotifRejet] = useState('')

  useEffect(() => {
    fetchData()

    // Rechargement automatique toutes les 30 secondes
    const interval = setInterval(() => {
      fetchData()
    }, 30000)

    // Écouter les changements en temps réel
    const channel = supabase
      .channel('avis-mentions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'avis_mentions'
        },
        (payload) => {
          console.log('🔔 Changement détecté:', payload)
          fetchData()
        }
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [])

  // Réinitialiser la recherche quand on change d'onglet
  useEffect(() => {
    setSearchTerm('')
    setFilterStatut('tous')
  }, [activeTab])

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
        
        // Récupérer les avis de la mairie
        const { data: avisData, error } = await supabase
          .from('avis_mentions')
          .select('*')
          .eq('mairie_id', profile.mairie_id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erreur:', error)
        } else {
          setAvis(avisData || [])
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatutBadge = (statut: string) => {
    const badges = {
      en_attente: 'bg-orange-100 text-orange-600',
      en_traitement: 'bg-blue-100 text-blue-600',
      approuvee: 'bg-green-100 text-green-600',
      rejetee: 'bg-red-100 text-red-600',
    }
    return badges[statut as keyof typeof badges] || 'bg-gray-100 text-gray-600'
  }

  const getStatutLabel = (statut: string) => {
    const labels = {
      en_attente: 'En attente',
      en_traitement: 'En traitement',
      approuvee: 'Approuvée',
      rejetee: 'Rejetée',
    }
    return labels[statut as keyof typeof labels] || statut
  }

  const getStatutIcon = (statut: string) => {
    const icons = {
      en_attente: Clock,
      en_traitement: FileText,
      approuvee: CheckCircle,
      rejetee: XCircle,
    }
    return icons[statut as keyof typeof icons] || Clock
  }

  const filteredAvis = avis.filter(a => {
    const matchSearch = 
      a.code_suivi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.numero_acte_original?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.users?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.users?.prenom?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filtrage selon l'onglet
    let matchTab = true
    if (activeTab === 'validation') {
      // Onglet Validation : seulement les en_attente et en_traitement
      matchTab = a.statut === 'en_attente' || a.statut === 'en_traitement'
    } else {
      // Onglet Traitement : seulement les validee et documents_verifies
      matchTab = a.statut === 'validee' || a.statut === 'documents_verifies'
    }
    
    const matchStatut = filterStatut === 'tous' || a.statut === filterStatut

    return matchSearch && matchStatut && matchTab
  })

  const stats = {
    total: avis.length,
    en_attente: avis.filter(a => a.statut === 'en_attente').length,
    en_traitement: avis.filter(a => a.statut === 'en_traitement').length,
    validees: avis.filter(a => a.statut === 'validee').length,
  }

  const handleValider = async () => {
    if (!selectedAvis) return

    try {
      const { error } = await supabase
        .from('avis_mention')
        .update({
          statut: 'validee',
          agent_id: userData.id,
          date_validation: new Date().toISOString()
        })
        .eq('id', selectedAvis.id)

      if (error) throw error

      alert('✅ Avis de mention validé')
      setShowModal(false)
      fetchData()
    } catch (error: any) {
      alert('❌ Erreur : ' + error.message)
    }
  }

  const handleRejeter = async () => {
    if (!selectedAvis || !motifRejet.trim()) return

    try {
      const { error } = await supabase
        .from('avis_mention')
        .update({
          statut: 'rejetee',
          motif_rejet: motifRejet,
          agent_id: userData.id
        })
        .eq('id', selectedAvis.id)

      if (error) throw error

      alert('✅ Avis de mention rejeté')
      setShowRejetModal(false)
      setShowModal(false)
      setMotifRejet('')
      fetchData()
    } catch (error: any) {
      alert('❌ Erreur : ' + error.message)
    }
  }

  const handleVerificationDocuments = async (data: { documents_recus: any; observations: string }) => {
    if (!selectedAvis) return

    try {
      const { error } = await supabase
        .from('avis_mention')
        .update({
          documents_verifies: true,
          date_verification_documents: new Date().toISOString(),
          agent_verificateur_id: userData.id,
          documents_recus: data.documents_recus,
          observations_agent: data.observations,
          statut: 'documents_verifies'
        })
        .eq('id', selectedAvis.id)

      if (error) throw error

      alert('✅ Documents vérifiés avec succès')
      setShowVerificationModal(false)
      fetchData()
    } catch (error: any) {
      alert('❌ Erreur : ' + error.message)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="agent" />
      
      <div className="flex-1 w-full lg:w-auto">
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Chargement...'}
          userRole="agent"
          avatarUrl={userData?.avatar_url}
        />
        
        <main className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                📝 Avis de Mention
              </h1>
              <p className="text-gray-600">
                Gérez les demandes d'avis de mention
              </p>
            </div>

            {/* Onglets */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex gap-4">
                  <button
                    onClick={() => setActiveTab('validation')}
                    className={`px-6 py-3 font-semibold border-b-2 transition ${
                      activeTab === 'validation'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    ✅ Validation
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-600">
                      {stats.en_attente + stats.en_traitement}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('traitement')}
                    className={`px-6 py-3 font-semibold border-b-2 transition ${
                      activeTab === 'traitement'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    🔍 Traitement
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                      {stats.validees}
                    </span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total</p>
                    <p className="text-4xl font-bold mt-2">{stats.total}</p>
                  </div>
                  <AlertTriangle size={48} className="opacity-20" />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">En attente</p>
                    <p className="text-4xl font-bold mt-2">{stats.en_attente}</p>
                  </div>
                  <Clock size={48} className="opacity-20" />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">En traitement</p>
                    <p className="text-4xl font-bold mt-2">{stats.en_traitement}</p>
                  </div>
                  <FileText size={48} className="opacity-20" />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Validées</p>
                    <p className="text-4xl font-bold mt-2">{stats.validees}</p>
                  </div>
                  <CheckCircle size={48} className="opacity-20" />
                </div>
              </Card>
            </div>

            {/* Interface selon l'onglet */}
            {activeTab === 'validation' ? (
              <>
                {/* Filtres pour Validation */}
            <Card className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="text"
                    placeholder="Rechercher par code, numéro acte, citoyen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select
                  label=""
                  value={filterStatut}
                  onChange={(e) => setFilterStatut(e.target.value)}
                  options={[
                    { value: 'tous', label: 'Tous les statuts' },
                    { value: 'en_attente', label: 'En attente' },
                    { value: 'en_traitement', label: 'En traitement' },
                    { value: 'approuvee', label: 'Approuvée' },
                    { value: 'rejetee', label: 'Rejetée' },
                  ]}
                />
              </div>
            </Card>

            {/* Liste des avis */}
            <Card>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Avis de mention ({filteredAvis.length})
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type Mention</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acte Ciblé</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Citoyen</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          Chargement...
                        </td>
                      </tr>
                    ) : filteredAvis.length > 0 ? (
                      filteredAvis.map((a) => {
                        const StatutIcon = getStatutIcon(a.statut)
                        return (
                          <tr key={a.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-mono text-gray-900">
                              {a.code_suivi}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {getTypeMentionLabel(a.type_mention)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">{a.type_acte_cible}</span>
                                <br />
                                <span className="text-xs">N° {a.numero_acte_cible}/{a.annee_acte_cible}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {a.users?.prenom} {a.users?.nom}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(a.created_at).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatutBadge(a.statut)}`}>
                                <StatutIcon size={14} />
                                {getStatutLabel(a.statut)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <button
                                onClick={() => router.push(`/agent/avis-mentions/${a.id}`)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                              >
                                <Eye size={16} />
                                <span className="text-sm font-medium">Traiter</span>
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          <AlertTriangle size={48} className="mx-auto mb-3 opacity-30" />
                          <p>Aucun avis de mention trouvé</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
              </>
            ) : (
              <>
                {/* Interface Traitement - Recherche par code */}
                <div className="max-w-3xl mx-auto">
                  {/* Champ de recherche centré */}
                  <Card className="mb-6 bg-gradient-to-br from-green-50 to-blue-50">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        🔍 Rechercher un Avis de Mention
                      </h2>
                      <p className="text-gray-600">
                        Entrez le code de suivi fourni par le citoyen
                      </p>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                      <input
                        type="text"
                        placeholder="MENT-2024-001234"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                        className="w-full pl-14 pr-4 py-4 text-xl font-mono border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center uppercase"
                      />
                    </div>

                    {searchTerm && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                          {filteredAvis.length} résultat(s) trouvé(s)
                        </p>
                      </div>
                    )}
                  </Card>

                  {/* Résultats de la recherche */}
                  {filteredAvis.length > 0 ? (
                    <div className="space-y-4">
                      {filteredAvis.map((avis) => (
                        <Card key={avis.id} className="border-2 border-green-200 hover:border-green-400 transition">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-mono bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                                  {avis.code_suivi}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutBadge(avis.statut)}`}>
                                  {getStatutLabel(avis.statut)}
                                </span>
                              </div>
                              <h3 className="text-xl font-bold text-gray-900">
                                {getTypeMentionLabel(avis.type_mention)}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Acte : {avis.numero_acte_original}
                              </p>
                              <p className="text-sm text-gray-600">
                                Date événement : {new Date(avis.date_evenement).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>

                          {/* Actions selon le statut */}
                          <div className="flex gap-3">
                            {avis.statut === 'validee' && (
                              <Button
                                variant="primary"
                                onClick={() => {
                                  setSelectedAvis(avis)
                                  setShowVerificationModal(true)
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                              >
                                <FileText size={18} className="mr-2" />
                                Vérifier les Documents
                              </Button>
                            )}
                            {avis.statut === 'documents_verifies' && (
                              <>
                                <Button
                                  variant="success"
                                  onClick={() => {
                                    alert('Génération de la mention en cours...')
                                  }}
                                  className="flex-1"
                                >
                                  <FileText size={18} className="mr-2" />
                                  Générer la Mention
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedAvis(avis)
                                    setShowModal(true)
                                  }}
                                  className="flex-1"
                                >
                                  <Eye size={18} className="mr-2" />
                                  Voir Détails
                                </Button>
                              </>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : searchTerm ? (
                    <Card className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <Search size={64} className="mx-auto" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Aucun avis trouvé
                      </h3>
                      <p className="text-gray-600">
                        Le code <span className="font-mono font-bold">{searchTerm}</span> ne correspond à aucun avis validé.
                      </p>
                    </Card>
                  ) : (
                    <Card className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <Search size={64} className="mx-auto" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Entrez un code de suivi
                      </h3>
                      <p className="text-gray-600">
                        Demandez au citoyen son code de suivi et entrez-le ci-dessus
                      </p>
                    </Card>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modale de vérification des documents */}
      <VerificationDocumentsModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onConfirm={handleVerificationDocuments}
        declaration={selectedAvis}
      />

      {/* Modal Détails */}
      {showModal && selectedAvis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Détails de l'Avis</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Code de suivi</p>
                <p className="font-mono font-bold">{selectedAvis.code_suivi}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type de mention</p>
                <p className="font-semibold">{getTypeMentionLabel(selectedAvis.type_mention)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Acte original</p>
                <p>{selectedAvis.numero_acte_original}</p>
              </div>

              {(selectedAvis.statut === 'en_attente' || selectedAvis.statut === 'en_traitement') && (
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="success"
                    onClick={handleValider}
                    className="flex-1"
                  >
                    <CheckCircle size={18} className="mr-2" />
                    Valider
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowRejetModal(true)}
                    className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <XCircle size={18} className="mr-2" />
                    Rejeter
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Modal Rejet */}
      {showRejetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Rejeter l'avis</h3>
            <textarea
              value={motifRejet}
              onChange={(e) => setMotifRejet(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={4}
              placeholder="Motif du rejet..."
            />
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowRejetModal(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleRejeter}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={!motifRejet.trim()}
              >
                Confirmer le Rejet
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
