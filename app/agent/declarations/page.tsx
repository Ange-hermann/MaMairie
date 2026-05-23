'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { VerificationDocumentsModal } from '@/components/VerificationDocumentsModal'
import { telechargerPdfActeNaissance } from '@/lib/genererPdfActeNaissance'
import { FileText, Search, Eye, CheckCircle, XCircle, Clock, Baby } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function DeclarationsAgentPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [declarations, setDeclarations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('tous')
  const [selectedDeclaration, setSelectedDeclaration] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [showRejetModal, setShowRejetModal] = useState(false)
  const [motifRejet, setMotifRejet] = useState('')
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'validation' | 'traitement'>('validation')

  useEffect(() => {
    fetchData()

    // Rechargement automatique toutes les 30 secondes
    const interval = setInterval(() => {
      fetchData()
    }, 30000)

    // Écouter les changements en temps réel
    const channel = supabase
      .channel('declarations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'declarations_naissance'
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
        
        // Récupérer les déclarations de la mairie
        const { data: declarationsData, error } = await supabase
          .from('declarations_naissance')
          .select('*')
          .eq('mairie_id', profile.mairie_id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erreur:', error)
        } else {
          setDeclarations(declarationsData || [])
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleValider = async () => {
    if (!selectedDeclaration) return

    try {
      // Mettre à jour le statut
      const { error } = await supabase
        .from('declarations_naissance')
        .update({ 
          statut: 'validee',
          agent_id: userData.id
        })
        .eq('id', selectedDeclaration.id)

      if (error) throw error

      alert('✅ Déclaration validée avec succès')
      setShowModal(false)
      fetchData()
    } catch (error: any) {
      alert('❌ Erreur : ' + error.message)
    }
  }

  const handleRejeter = async () => {
    if (!selectedDeclaration || !motifRejet) {
      alert('Veuillez saisir un motif de rejet')
      return
    }

    try {
      const { error } = await supabase
        .from('declarations_naissance')
        .update({ 
          statut: 'rejetee',
          motif_rejet: motifRejet,
          agent_id: userData.id
        })
        .eq('id', selectedDeclaration.id)

      if (error) throw error

      alert('✅ Déclaration rejetée')
      setShowRejetModal(false)
      setShowModal(false)
      setMotifRejet('')
      fetchData()
    } catch (error: any) {
      alert('❌ Erreur : ' + error.message)
    }
  }

  const handleVerificationDocuments = async (data: { documents_recus: any; observations: string }) => {
    if (!selectedDeclaration) return

    try {
      const { error } = await supabase
        .from('declarations_naissance')
        .update({
          documents_verifies: true,
          date_verification_documents: new Date().toISOString(),
          agent_verificateur_id: userData.id,
          documents_recus: data.documents_recus,
          observations_agent: data.observations,
          statut: 'documents_verifies'
        })
        .eq('id', selectedDeclaration.id)

      if (error) throw error

      alert('✅ Documents vérifiés avec succès')
      setShowVerificationModal(false)
      setShowModal(false)
      fetchData()
    } catch (error: any) {
      alert('❌ Erreur : ' + error.message)
    }
  }

  const getStatutBadge = (statut: string) => {
    const badges = {
      en_attente: 'bg-orange-100 text-orange-600',
      en_traitement: 'bg-blue-100 text-blue-600',
      validee: 'bg-green-100 text-green-600',
      documents_verifies: 'bg-cyan-100 text-cyan-600',
      remis: 'bg-purple-100 text-purple-600',
      rejetee: 'bg-red-100 text-red-600',
    }
    return badges[statut as keyof typeof badges] || 'bg-gray-100 text-gray-600'
  }

  const getStatutLabel = (statut: string) => {
    const labels = {
      en_attente: 'En attente',
      en_traitement: 'En traitement',
      validee: 'Validée',
      documents_verifies: 'Documents vérifiés',
      remis: 'Acte remis',
      rejetee: 'Rejetée',
    }
    return labels[statut as keyof typeof labels] || statut
  }

  const filteredDeclarations = declarations.filter(decl => {
    const matchSearch = 
      decl.nom_enfant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      decl.prenom_enfant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      decl.code_suivi?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filtrage selon l'onglet
    let matchTab = true
    if (activeTab === 'validation') {
      // Onglet Validation : seulement les en_attente et en_traitement
      matchTab = decl.statut === 'en_attente' || decl.statut === 'en_traitement'
    } else {
      // Onglet Traitement : seulement les validee et documents_verifies
      matchTab = decl.statut === 'validee' || decl.statut === 'documents_verifies'
    }
    
    const matchStatut = filterStatut === 'tous' || decl.statut === filterStatut

    return matchSearch && matchStatut && matchTab
  })

  const stats = {
    total: declarations.length,
    en_attente: declarations.filter(d => d.statut === 'en_attente').length,
    en_traitement: declarations.filter(d => d.statut === 'en_traitement').length,
    en_cours_traitement: declarations.filter(d => d.statut === 'validee' || d.statut === 'documents_verifies').length,
    termines: declarations.filter(d => d.statut === 'remis').length,
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
                👶 Déclarations de Naissance
              </h1>
              <p className="text-gray-600">
                Gérez les déclarations de naissance reçues
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
                      {stats.en_cours_traitement}
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
                  <Baby size={48} className="opacity-20" />
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
                    <p className="text-sm opacity-90">Terminés</p>
                    <p className="text-4xl font-bold mt-2">{stats.termines}</p>
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
                        placeholder="Rechercher par nom ou prénom..."
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
                      ]}
                    />
                  </div>
                </Card>

                {/* Liste des déclarations - Tableau */}
            <Card>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Déclarations ({filteredDeclarations.length})
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enfant</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Naissance</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Déclaration</th>
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
                    ) : filteredDeclarations.length > 0 ? (
                      filteredDeclarations.map((decl) => (
                        <tr key={decl.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-mono text-gray-900">
                            {decl.code_suivi}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {decl.prenom_enfant} {decl.nom_enfant}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(decl.date_naissance).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(decl.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutBadge(decl.statut)}`}>
                              {getStatutLabel(decl.statut)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => {
                                setSelectedDeclaration(decl)
                                setShowModal(true)
                              }}
                              className="inline-flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                            >
                              <Eye size={16} />
                              <span className="text-sm font-medium">Voir détails</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          Aucune déclaration trouvée
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
                        🔍 Rechercher une Déclaration
                      </h2>
                      <p className="text-gray-600">
                        Entrez le code de suivi fourni par le citoyen
                      </p>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                      <input
                        type="text"
                        placeholder="DEC-2024-001234"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                        className="w-full pl-14 pr-4 py-4 text-xl font-mono border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center uppercase"
                      />
                    </div>

                    {searchTerm && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                          {filteredDeclarations.length} résultat(s) trouvé(s)
                        </p>
                      </div>
                    )}
                  </Card>

                  {/* Résultats de la recherche */}
                  {filteredDeclarations.length > 0 ? (
                    <div className="space-y-4">
                      {filteredDeclarations.map((decl) => (
                        <Card key={decl.id} className="border-2 border-green-200 hover:border-green-400 transition">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-mono bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                                  {decl.code_suivi}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutBadge(decl.statut)}`}>
                                  {getStatutLabel(decl.statut)}
                                </span>
                              </div>
                              <h3 className="text-xl font-bold text-gray-900">
                                {decl.prenom_enfant} {decl.nom_enfant}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Né(e) le {new Date(decl.date_naissance).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>

                          {/* Informations détaillées */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="text-xs text-blue-600 font-semibold mb-1">👨 PÈRE</p>
                              <p className="text-sm font-medium">{decl.prenom_pere} {decl.nom_pere}</p>
                              <p className="text-xs text-gray-600">{decl.nationalite_pere}</p>
                            </div>
                            <div className="bg-pink-50 p-3 rounded-lg">
                              <p className="text-xs text-pink-600 font-semibold mb-1">👩 MÈRE</p>
                              <p className="text-sm font-medium">{decl.prenom_mere} {decl.nom_mere}</p>
                              <p className="text-xs text-gray-600">{decl.nationalite_mere}</p>
                            </div>
                          </div>

                          {/* Actions selon le statut */}
                          <div className="flex gap-3">
                            {decl.statut === 'validee' && (
                              <Button
                                variant="primary"
                                onClick={() => {
                                  setSelectedDeclaration(decl)
                                  setShowVerificationModal(true)
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                              >
                                <FileText size={18} className="mr-2" />
                                Vérifier les Documents
                              </Button>
                            )}
                            {decl.statut === 'documents_verifies' && (
                              <>
                                <Button
                                  variant="success"
                                  onClick={async () => {
                                    if (!confirm('Générer l\'acte de naissance officiel ?\n\nCela va créer l\'acte dans l\'état civil et télécharger le PDF.')) return
                                    
                                    try {
                                      // 1. Créer l'acte dans la base
                                      const { data: acteData, error } = await supabase.rpc('generer_acte_naissance', {
                                        p_declaration_id: decl.id,
                                        p_agent_id: userData.id
                                      })

                                      if (error) throw error

                                      // 2. Récupérer l'acte créé avec le numéro
                                      const { data: acte, error: acteError } = await supabase
                                        .from('naissances')
                                        .select('*, mairies(nom_mairie, ville)')
                                        .eq('id', acteData)
                                        .single()

                                      if (acteError) throw acteError

                                      // 3. Générer et télécharger le PDF
                                      telechargerPdfActeNaissance({
                                        numero_acte: acte.numero_acte,
                                        date_acte: new Date().toLocaleDateString('fr-FR'),
                                        nom: decl.nom_enfant,
                                        prenom: decl.prenom_enfant,
                                        sexe: decl.sexe,
                                        date_naissance: new Date(decl.date_naissance).toLocaleDateString('fr-FR'),
                                        heure_naissance: decl.heure_naissance,
                                        lieu_naissance: decl.lieu_naissance,
                                        nom_pere: decl.nom_pere,
                                        prenom_pere: decl.prenom_pere,
                                        date_naissance_pere: new Date(decl.date_naissance_pere).toLocaleDateString('fr-FR'),
                                        nationalite_pere: decl.nationalite_pere,
                                        profession_pere: decl.profession_pere,
                                        domicile_pere: decl.lieu_naissance,
                                        nom_mere: decl.nom_mere,
                                        prenom_mere: decl.prenom_mere,
                                        date_naissance_mere: new Date(decl.date_naissance_mere).toLocaleDateString('fr-FR'),
                                        nationalite_mere: decl.nationalite_mere,
                                        profession_mere: decl.profession_mere,
                                        domicile_mere: decl.lieu_naissance,
                                        mairie: {
                                          nom: acte.mairies.nom_mairie,
                                          commune: acte.mairies.ville,
                                          district: 'DISTRICT AUTONOME D\'ABIDJAN'
                                        },
                                        officier: {
                                          nom: userData.nom,
                                          prenom: userData.prenom,
                                          fonction: 'Maire'
                                        }
                                      })

                                      alert('✅ Acte de naissance généré avec succès !\n\nNuméro : ' + acte.numero_acte + '\nLe PDF a été téléchargé.')
                                      fetchData()
                                    } catch (error: any) {
                                      alert('❌ Erreur : ' + error.message)
                                    }
                                  }}
                                  className="flex-1"
                                >
                                  <FileText size={18} className="mr-2" />
                                  Générer l'Acte + PDF
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedDeclaration(decl)
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
                        Aucune déclaration trouvée
                      </h3>
                      <p className="text-gray-600">
                        Le code <span className="font-mono font-bold">{searchTerm}</span> ne correspond à aucune déclaration validée.
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Vérifiez que le code est correct et que la déclaration a bien été validée.
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

      {/* Modal Détails */}
      {showModal && selectedDeclaration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Détails de la Déclaration</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Code de suivi</p>
                <p className="text-lg font-mono font-bold text-orange-600">{selectedDeclaration.code_suivi}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">👶 Enfant</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><strong>Nom:</strong> {selectedDeclaration.nom_enfant}</p>
                  <p><strong>Prénom:</strong> {selectedDeclaration.prenom_enfant}</p>
                  <p><strong>Date:</strong> {new Date(selectedDeclaration.date_naissance).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Heure:</strong> {selectedDeclaration.heure_naissance}</p>
                  <p><strong>Sexe:</strong> {selectedDeclaration.sexe === 'masculin' ? 'Masculin' : 'Féminin'}</p>
                  <p className="col-span-2"><strong>Lieu:</strong> {selectedDeclaration.lieu_naissance}</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-3">👨 Père</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><strong>Nom:</strong> {selectedDeclaration.nom_pere}</p>
                  <p><strong>Prénom:</strong> {selectedDeclaration.prenom_pere}</p>
                  <p><strong>Date naissance:</strong> {new Date(selectedDeclaration.date_naissance_pere).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Nationalité:</strong> {selectedDeclaration.nationalite_pere}</p>
                  <p className="col-span-2"><strong>Profession:</strong> {selectedDeclaration.profession_pere}</p>
                </div>
              </div>

              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <h3 className="font-semibold text-pink-900 mb-3">👩 Mère</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><strong>Nom:</strong> {selectedDeclaration.nom_mere}</p>
                  <p><strong>Prénom:</strong> {selectedDeclaration.prenom_mere}</p>
                  <p><strong>Date naissance:</strong> {new Date(selectedDeclaration.date_naissance_mere).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Nationalité:</strong> {selectedDeclaration.nationalite_mere}</p>
                  <p className="col-span-2"><strong>Profession:</strong> {selectedDeclaration.profession_mere}</p>
                </div>
              </div>

              {selectedDeclaration.statut === 'en_attente' || selectedDeclaration.statut === 'en_traitement' ? (
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
              ) : selectedDeclaration.statut === 'validee' ? (
                <div className="space-y-3 pt-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <p className="font-semibold text-green-900">
                      ✅ Déclaration validée
                    </p>
                    <p className="text-sm text-green-700 mt-2">
                      Le citoyen peut maintenant se présenter avec ses documents originaux.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setShowVerificationModal(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <FileText size={18} className="mr-2" />
                    Vérifier les Documents
                  </Button>
                </div>
              ) : (
                <div className={`p-4 rounded-lg ${
                  selectedDeclaration.statut === 'validee' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`font-semibold ${
                    selectedDeclaration.statut === 'validee' ? 'text-green-900' : 
                    selectedDeclaration.statut === 'documents_verifies' ? 'text-cyan-900' :
                    selectedDeclaration.statut === 'remis' ? 'text-purple-900' :
                    selectedDeclaration.statut === 'rejetee' ? 'text-red-900' : 'text-gray-900'
                  }`}>
                    {getStatutLabel(selectedDeclaration.statut)}
                  </p>
                  {selectedDeclaration.motif_rejet && (
                    <p className="text-sm text-red-800 mt-2">
                      <strong>Motif:</strong> {selectedDeclaration.motif_rejet}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <Card className="max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Rejeter la Déclaration</h2>
              <button
                onClick={() => setShowRejetModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  Veuillez indiquer le motif du rejet. Le citoyen sera notifié.
                </p>
              </div>

              <textarea
                value={motifRejet}
                onChange={(e) => setMotifRejet(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={4}
                placeholder="Motif du rejet..."
              />

              <div className="flex gap-3">
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
            </div>
          </Card>
        </div>
      )}

      {/* Modale de vérification des documents */}
      <VerificationDocumentsModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onConfirm={handleVerificationDocuments}
        declaration={selectedDeclaration}
      />
    </div>
  )
}
