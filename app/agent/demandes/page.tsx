'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { FileText, Search, Eye, CheckCircle, XCircle, Clock, Download } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function DemandesAgentPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [demandes, setDemandes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('tous')
  const [selectedDemande, setSelectedDemande] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

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
        
        // Récupérer les demandes de la mairie
        const { data: demandesData, error } = await supabase
          .from('requests')
          .select('*, users!requests_user_id_fkey(nom, prenom, email, telephone)')
          .eq('mairie_id', profile.mairie_id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erreur:', error)
        } else {
          setDemandes(demandesData || [])
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatut = async (demandeId: string, newStatut: string) => {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ statut: newStatut })
        .eq('id', demandeId)

      if (error) throw error
      
      alert(`✅ Statut mis à jour: ${getStatutLabel(newStatut)}`)
      fetchData()
      setShowModal(false)
    } catch (error: any) {
      alert('❌ Erreur : ' + error.message)
    }
  }

  const getStatutBadge = (statut: string) => {
    const badges = {
      en_attente: 'bg-orange-100 text-orange-600',
      en_traitement: 'bg-blue-100 text-blue-600',
      validee: 'bg-green-100 text-green-600',
      prete: 'bg-green-100 text-green-600',
      rejetee: 'bg-red-100 text-red-600',
    }
    
    return badges[statut as keyof typeof badges] || 'bg-gray-100 text-gray-600'
  }

  const getStatutLabel = (statut: string) => {
    const labels = {
      en_attente: 'En attente',
      en_traitement: 'En traitement',
      validee: 'Validée',
      prete: 'Prête',
      rejetee: 'Rejetée',
    }
    
    return labels[statut as keyof typeof labels] || statut
  }

  const filteredDemandes = demandes.filter(d => {
    const matchSearch = 
      d.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.users?.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchStatut = filterStatut === 'tous' || d.statut === filterStatut
    
    return matchSearch && matchStatut
  })

  const stats = {
    total: demandes.length,
    en_attente: demandes.filter(d => d.statut === 'en_attente').length,
    en_traitement: demandes.filter(d => d.statut === 'en_traitement').length,
    validees: demandes.filter(d => d.statut === 'validee' || d.statut === 'prete').length,
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="agent" />
      
      <div className="flex-1">
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Agent'}
          userRole="agent"
          avatarUrl={userData?.avatar_url}
        />
        
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <FileText className="text-primary-500" size={36} />
              Gestion des Demandes
            </h1>
            <p className="text-gray-600">
              Traiter et valider les demandes d'extraits d'actes
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Demandes</p>
                  <p className="text-4xl font-bold mt-2">{stats.total}</p>
                </div>
                <FileText size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">En Attente</p>
                  <p className="text-4xl font-bold mt-2">{stats.en_attente}</p>
                </div>
                <Clock size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">En Traitement</p>
                  <p className="text-4xl font-bold mt-2">{stats.en_traitement}</p>
                </div>
                <Clock size={48} className="opacity-20" />
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

          {/* Filtres */}
          <Card className="mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Rechercher par nom, prénom ou email..."
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
                  { value: 'validee', label: 'Validée' },
                  { value: 'prete', label: 'Prête' },
                  { value: 'rejetee', label: 'Rejetée' },
                ]}
              />
            </div>
          </Card>

          {/* Liste des demandes */}
          <Card>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Demandes ({filteredDemandes.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Citoyen</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Personne Concernée</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Demande</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        Chargement...
                      </td>
                    </tr>
                  ) : filteredDemandes.length > 0 ? (
                    filteredDemandes.map((demande) => (
                      <tr key={demande.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          <div>
                            <p className="font-medium text-gray-900">
                              {demande.users?.prenom} {demande.users?.nom}
                            </p>
                            <p className="text-xs text-gray-500">{demande.users?.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {demande.type_acte === 'naissance' ? 'Naissance' : 
                           demande.type_acte === 'mariage' ? 'Mariage' : 
                           demande.type_acte === 'deces' ? 'Décès' : 'Autre'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {demande.prenom} {demande.nom}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(demande.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutBadge(demande.statut)}`}>
                            {getStatutLabel(demande.statut)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedDemande(demande)
                                setShowModal(true)
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Voir détails"
                            >
                              <Eye size={18} />
                            </button>
                            {demande.statut === 'en_attente' && (
                              <button
                                onClick={() => handleUpdateStatut(demande.id, 'en_traitement')}
                                className="p-1 text-cyan-600 hover:bg-cyan-50 rounded"
                                title="Mettre en traitement"
                              >
                                <Clock size={18} />
                              </button>
                            )}
                            {(demande.statut === 'en_attente' || demande.statut === 'en_traitement') && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatut(demande.id, 'validee')}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                  title="Valider"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatut(demande.id, 'rejetee')}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Rejeter"
                                >
                                  <XCircle size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        <FileText size={48} className="mx-auto mb-3 opacity-30" />
                        <p>Aucune demande trouvée</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      </div>

      {/* Modal Détails */}
      {showModal && selectedDemande && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Détails de la Demande</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Informations du Citoyen</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><span className="font-medium">Nom:</span> {selectedDemande.users?.prenom} {selectedDemande.users?.nom}</p>
                  <p><span className="font-medium">Email:</span> {selectedDemande.users?.email}</p>
                  <p><span className="font-medium">Téléphone:</span> {selectedDemande.telephone}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Informations de la Demande</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><span className="font-medium">Type:</span> {selectedDemande.type_acte}</p>
                  <p><span className="font-medium">Nom:</span> {selectedDemande.nom}</p>
                  <p><span className="font-medium">Prénom:</span> {selectedDemande.prenom}</p>
                  <p><span className="font-medium">Date de naissance:</span> {new Date(selectedDemande.date_naissance).toLocaleDateString('fr-FR')}</p>
                  <p><span className="font-medium">Lieu de naissance:</span> {selectedDemande.lieu_naissance}</p>
                  <p><span className="font-medium">Père:</span> {selectedDemande.nom_pere}</p>
                  <p><span className="font-medium">Mère:</span> {selectedDemande.nom_mere}</p>
                </div>
              </div>

              {selectedDemande.document_url && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Document Joint</h3>
                  <a
                    href={selectedDemande.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
                  >
                    <Download size={18} />
                    Voir le document
                  </a>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {selectedDemande.statut === 'en_attente' && (
                  <Button
                    variant="primary"
                    onClick={() => handleUpdateStatut(selectedDemande.id, 'en_traitement')}
                    className="flex-1"
                  >
                    Mettre en Traitement
                  </Button>
                )}
                {(selectedDemande.statut === 'en_attente' || selectedDemande.statut === 'en_traitement') && (
                  <>
                    <Button
                      variant="success"
                      onClick={() => handleUpdateStatut(selectedDemande.id, 'validee')}
                      className="flex-1"
                    >
                      Valider
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatut(selectedDemande.id, 'rejetee')}
                      className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Rejeter
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
