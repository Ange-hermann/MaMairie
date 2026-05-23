'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FileText, Search, Eye, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { getTypeMentionLabel } from '@/lib/generateCodeMention'

export default function AvisMentionsAgentPageSimple() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [avis, setAvis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'validation' | 'traitement'>('validation')
  const [selectedAvis, setSelectedAvis] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [showRejetModal, setShowRejetModal] = useState(false)
  const [motifRejet, setMotifRejet] = useState('')

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

  const handleValider = async () => {
    if (!selectedAvis) return
    
    try {
      const { error } = await supabase
        .from('avis_mentions')
        .update({ 
          statut: 'approuvee',
          agent_id: userData.id,
          date_traitement: new Date().toISOString()
        })
        .eq('id', selectedAvis.id)

      if (error) throw error

      alert('✅ Avis de mention validé')
      setShowModal(false)
      setSelectedAvis(null)
      fetchData()
    } catch (error: any) {
      alert('❌ Erreur : ' + error.message)
    }
  }

  const handleRejeter = async () => {
    if (!selectedAvis || !motifRejet.trim()) return
    
    try {
      const { error } = await supabase
        .from('avis_mentions')
        .update({ 
          statut: 'rejetee',
          motif_rejet: motifRejet,
          agent_id: userData.id,
          date_traitement: new Date().toISOString()
        })
        .eq('id', selectedAvis.id)

      if (error) throw error

      alert('✅ Avis de mention rejeté')
      setShowRejetModal(false)
      setShowModal(false)
      setSelectedAvis(null)
      setMotifRejet('')
      fetchData()
    } catch (error: any) {
      alert('❌ Erreur : ' + error.message)
    }
  }

  const getStatutBadge = (statut: string) => {
    const badges = {
      en_attente: 'bg-orange-100 text-orange-600',
      approuvee: 'bg-green-100 text-green-600',
      rejetee: 'bg-red-100 text-red-600',
    }
    return badges[statut as keyof typeof badges] || 'bg-gray-100 text-gray-600'
  }

  const getStatutLabel = (statut: string) => {
    const labels = {
      en_attente: 'En attente',
      approuvee: 'Approuvée',
      rejetee: 'Rejetée',
    }
    return labels[statut as keyof typeof labels] || statut
  }

  // Filtrer les avis selon l'onglet actif
  const filteredAvis = avis.filter(a => {
    const matchSearch = !searchTerm || 
      a.code_suivi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.numero_acte_cible?.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === 'validation') {
      return matchSearch && a.statut === 'en_attente'
    } else {
      return matchSearch && (a.statut === 'approuvee' || a.statut === 'rejetee')
    }
  })

  const stats = {
    en_attente: avis.filter(a => a.statut === 'en_attente').length,
    approuvee: avis.filter(a => a.statut === 'approuvee').length,
    rejetee: avis.filter(a => a.statut === 'rejetee').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="agent" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Agent'}
          userRole="agent"
          avatarUrl={userData?.avatar_url}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                📋 Avis de Mention
              </h1>
              <p className="text-gray-600">
                Gérez les demandes d'avis de mention sur les actes d'état civil
              </p>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">En attente</p>
                    <p className="text-3xl font-bold text-orange-700">{stats.en_attente}</p>
                  </div>
                  <Clock className="text-orange-400" size={40} />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Approuvées</p>
                    <p className="text-3xl font-bold text-green-700">{stats.approuvee}</p>
                  </div>
                  <CheckCircle className="text-green-400" size={40} />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Rejetées</p>
                    <p className="text-3xl font-bold text-red-700">{stats.rejetee}</p>
                  </div>
                  <XCircle className="text-red-400" size={40} />
                </div>
              </Card>
            </div>

            {/* Onglets */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('validation')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'validation'
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                📋 Validation ({stats.en_attente})
              </button>
              <button
                onClick={() => setActiveTab('traitement')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'traitement'
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                ✅ Traitement ({stats.approuvee + stats.rejetee})
              </button>
            </div>

            {/* Recherche */}
            <Card className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Rechercher par code ou numéro d'acte..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </Card>

            {/* Liste des avis */}
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left p-3 font-semibold text-gray-700">Code</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Type de mention</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Acte cible</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Date</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Statut</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAvis.length > 0 ? (
                      filteredAvis.map((a) => (
                        <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3 font-mono text-sm">{a.code_suivi}</td>
                          <td className="p-3">{getTypeMentionLabel(a.type_mention)}</td>
                          <td className="p-3">
                            <div className="text-sm">
                              <span className="font-medium">{a.type_acte_cible}</span>
                              <br />
                              <span className="text-xs text-gray-600">
                                N° {a.numero_acte_cible}/{a.annee_acte_cible}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(a.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="p-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutBadge(a.statut)}`}>
                              {getStatutLabel(a.statut)}
                            </span>
                          </td>
                          <td className="p-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAvis(a)
                                setShowModal(true)
                              }}
                            >
                              <Eye size={16} className="mr-2" />
                              Voir détails
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          <AlertTriangle size={48} className="mx-auto mb-3 opacity-30" />
                          <p>Aucun avis de mention trouvé</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </main>
      </div>

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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Code de suivi</p>
                  <p className="font-mono font-bold">{selectedAvis.code_suivi}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type de mention</p>
                  <p className="font-semibold">{getTypeMentionLabel(selectedAvis.type_mention)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Acte original</p>
                <p className="font-semibold">
                  {selectedAvis.type_acte_cible} N° {selectedAvis.numero_acte_cible}/{selectedAvis.annee_acte_cible}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-sm bg-gray-50 p-3 rounded-lg">
                  {selectedAvis.description_mention || 'Aucune description'}
                </p>
              </div>

              {selectedAvis.date_evenement && (
                <div>
                  <p className="text-sm text-gray-600">Date de l'événement</p>
                  <p className="font-semibold">
                    {new Date(selectedAvis.date_evenement).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}

              {selectedAvis.statut === 'en_attente' && (
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

              {selectedAvis.statut !== 'en_attente' && (
                <div className={`p-4 rounded-lg ${
                  selectedAvis.statut === 'approuvee' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`font-semibold ${
                    selectedAvis.statut === 'approuvee' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {selectedAvis.statut === 'approuvee' ? '✅ Avis approuvé' : '❌ Avis rejeté'}
                  </p>
                  {selectedAvis.motif_rejet && (
                    <p className="text-sm text-red-800 mt-2">
                      <strong>Motif:</strong> {selectedAvis.motif_rejet}
                    </p>
                  )}
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
