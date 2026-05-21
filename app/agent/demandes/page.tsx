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
  const [showRejetModal, setShowRejetModal] = useState(false)
  const [motifRejet, setMotifRejet] = useState('')
  const [motifAutre, setMotifAutre] = useState('')
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [verificationLoading, setVerificationLoading] = useState(false)

  useEffect(() => {
    fetchData()

    // Rechargement automatique toutes les 30 secondes
    const interval = setInterval(() => {
      fetchData()
    }, 30000)

    // Écouter les changements en temps réel avec Supabase Realtime
    const channel = supabase
      .channel('requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Écouter tous les événements (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'requests'
        },
        (payload) => {
          console.log('🔔 Changement détecté:', payload)
          fetchData() // Recharger les données
        }
      )
      .subscribe()

    // Nettoyer à la destruction du composant
    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
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
      // Si on approuve, générer le PDF avec QR Code
      if (newStatut === 'approuvee') {
        const response = await fetch('/api/generer-extrait', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ demandeId })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erreur génération PDF')
        }

        const { pdfUrl } = await response.json()
        alert(`✅ Demande approuvée ! PDF généré avec QR Code.\nURL: ${pdfUrl}`)
      } else {
        // Pour les autres statuts, mise à jour simple
        const { error } = await supabase
          .from('requests')
          .update({ statut: newStatut })
          .eq('id', demandeId)

        if (error) throw error
        alert(`✅ Statut mis à jour: ${getStatutLabel(newStatut)}`)
      }
      
      fetchData()
      setShowModal(false)
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('❌ Erreur : ' + error.message)
    }
  }

  const handleRejet = async () => {
    // Validation du motif
    const motifFinal = motifRejet === 'autre' ? motifAutre : motifRejet
    
    if (!motifFinal || motifFinal.trim() === '') {
      alert('⚠️ Le motif de rejet est obligatoire')
      return
    }

    try {
      const { error } = await supabase
        .from('requests')
        .update({ 
          statut: 'rejetee',
          motif_rejet: motifFinal,
          date_rejet: new Date().toISOString()
        })
        .eq('id', selectedDemande.id)

      if (error) throw error

      // Créer une notification pour le citoyen
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedDemande.user_id,
          titre: 'Demande rejetée',
          message: `Votre demande d'extrait de ${selectedDemande.type_acte} a été rejetée. Motif: ${motifFinal}`,
          type: 'demande_rejetee',
          lue: false
        })
      
      alert('✅ Demande rejetée avec succès')
      setShowRejetModal(false)
      setShowModal(false)
      setMotifRejet('')
      setMotifAutre('')
      fetchData()
    } catch (error: any) {
      alert('❌ Erreur : ' + error.message)
    }
  }

  const verifierNumeroActe = async (demande: any) => {
    if (!demande.numero_acte) {
      setVerificationResult({
        valide: false,
        message: 'Aucun numéro d\'acte fourni',
        details: null
      })
      return
    }

    setVerificationLoading(true)
    try {
      // Déterminer la table selon le type d'acte
      const tableName = demande.type_acte === 'naissance' ? 'naissances' :
                        demande.type_acte === 'mariage' ? 'mariages' : 'deces'

      // Chercher l'acte dans la base de données
      const { data: acte, error } = await supabase
        .from(tableName)
        .select('*, mairies(nom_mairie, ville)')
        .eq('numero_acte', demande.numero_acte)
        .single()

      if (error || !acte) {
        setVerificationResult({
          valide: false,
          message: '❌ Numéro d\'acte INVALIDE - Acte introuvable dans la base de données',
          details: null
        })
      } else {
        // Vérifier la cohérence des données
        const coherent = verifierCoherence(demande, acte)
        
        setVerificationResult({
          valide: true,
          coherent: coherent,
          message: coherent 
            ? '✅ Numéro d\'acte VALIDE - Les informations correspondent'
            : '⚠️ Numéro d\'acte VALIDE mais incohérences détectées',
          details: acte
        })
      }
    } catch (error) {
      console.error('Erreur vérification:', error)
      setVerificationResult({
        valide: false,
        message: '❌ Erreur lors de la vérification',
        details: null
      })
    } finally {
      setVerificationLoading(false)
    }
  }

  const verifierCoherence = (demande: any, acte: any) => {
    // Vérifier la cohérence selon le type d'acte
    if (demande.type_acte === 'naissance') {
      return (
        demande.nom?.toLowerCase() === acte.nom_enfant?.toLowerCase() &&
        demande.prenom?.toLowerCase() === acte.prenom_enfant?.toLowerCase()
      )
    } else if (demande.type_acte === 'mariage') {
      return (
        demande.nom?.toLowerCase() === acte.nom_epoux?.toLowerCase() ||
        demande.nom?.toLowerCase() === acte.nom_epouse?.toLowerCase()
      )
    } else if (demande.type_acte === 'deces') {
      return (
        demande.nom?.toLowerCase() === acte.nom_defunt?.toLowerCase() &&
        demande.prenom?.toLowerCase() === acte.prenom_defunt?.toLowerCase()
      )
    }
    return true
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
      
      <div className="flex-1 w-full lg:w-auto">
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Agent'}
          userRole="agent"
          avatarUrl={userData?.avatar_url}
        />
        
        <main className="p-4 md:p-6">
          <div className="mb-4 md:mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2 md:gap-3">
              <FileText className="text-primary-500" size={28} />
              Gestion des Demandes
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Traiter et valider les demandes d'extraits d'actes
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs md:text-sm opacity-90">Total Demandes</p>
                  <p className="text-2xl md:text-4xl font-bold mt-1 md:mt-2">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 md:w-12 md:h-12 opacity-20" />
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
          <Card className="mb-4 md:mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
                          <button
                            onClick={() => {
                              setSelectedDemande(demande)
                              setShowModal(true)
                              setVerificationResult(null) // Reset
                              verifierNumeroActe(demande) // Vérification automatique
                            }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                            title="Voir détails et traiter"
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
                  <p><span className="font-medium">Numéro d'acte:</span> {selectedDemande.numero_acte || 'Non fourni'}</p>
                  <p><span className="font-medium">Nom:</span> {selectedDemande.nom}</p>
                  <p><span className="font-medium">Prénom:</span> {selectedDemande.prenom}</p>
                  {selectedDemande.date_naissance && (
                    <p><span className="font-medium">Date de naissance:</span> {new Date(selectedDemande.date_naissance).toLocaleDateString('fr-FR')}</p>
                  )}
                  {selectedDemande.lieu_naissance && (
                    <p><span className="font-medium">Lieu de naissance:</span> {selectedDemande.lieu_naissance}</p>
                  )}
                  {selectedDemande.nom_pere && (
                    <p><span className="font-medium">Père:</span> {selectedDemande.nom_pere}</p>
                  )}
                  {selectedDemande.nom_mere && (
                    <p><span className="font-medium">Mère:</span> {selectedDemande.nom_mere}</p>
                  )}
                </div>
              </div>

              {/* Résultat de la vérification automatique */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">🔍 Vérification Automatique du Numéro d'Acte</h3>
                {verificationLoading ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800">🔄 Vérification en cours...</p>
                  </div>
                ) : verificationResult ? (
                  <div className={`border rounded-lg p-4 ${
                    verificationResult.valide 
                      ? (verificationResult.coherent ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200')
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <p className={`font-semibold mb-2 ${
                      verificationResult.valide 
                        ? (verificationResult.coherent ? 'text-green-800' : 'text-yellow-800')
                        : 'text-red-800'
                    }`}>
                      {verificationResult.message}
                    </p>
                    
                    {verificationResult.details && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <p className="text-sm font-semibold text-gray-800 mb-3">📊 Comparaison Détaillée</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {/* Colonne 1 : Ce que le citoyen a rempli */}
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <p className="text-xs font-semibold text-blue-900 mb-2">📝 Demande du citoyen</p>
                            <div className="text-xs text-blue-800 space-y-1">
                              <p><strong>Nom:</strong> {selectedDemande.nom}</p>
                              <p><strong>Prénom:</strong> {selectedDemande.prenom}</p>
                              {selectedDemande.date_naissance && (
                                <p><strong>Date naissance:</strong> {new Date(selectedDemande.date_naissance).toLocaleDateString('fr-FR')}</p>
                              )}
                              {selectedDemande.lieu_naissance && (
                                <p><strong>Lieu naissance:</strong> {selectedDemande.lieu_naissance}</p>
                              )}
                              {selectedDemande.nom_pere && (
                                <p><strong>Père:</strong> {selectedDemande.nom_pere}</p>
                              )}
                              {selectedDemande.nom_mere && (
                                <p><strong>Mère:</strong> {selectedDemande.nom_mere}</p>
                              )}
                            </div>
                          </div>

                          {/* Colonne 2 : Ce qui est dans la base (acte original) */}
                          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <p className="text-xs font-semibold text-green-900 mb-2">✅ Acte original (Base de données)</p>
                            <div className="text-xs text-green-800 space-y-1">
                              {verificationResult.details.nom_enfant && (
                                <>
                                  <p><strong>Nom:</strong> {verificationResult.details.nom_enfant}</p>
                                  <p><strong>Prénom:</strong> {verificationResult.details.prenom_enfant}</p>
                                  {verificationResult.details.date_naissance && (
                                    <p><strong>Date naissance:</strong> {new Date(verificationResult.details.date_naissance).toLocaleDateString('fr-FR')}</p>
                                  )}
                                  {verificationResult.details.lieu_naissance && (
                                    <p><strong>Lieu naissance:</strong> {verificationResult.details.lieu_naissance}</p>
                                  )}
                                  {verificationResult.details.nom_pere && (
                                    <p><strong>Père:</strong> {verificationResult.details.prenom_pere} {verificationResult.details.nom_pere}</p>
                                  )}
                                  {verificationResult.details.nom_mere && (
                                    <p><strong>Mère:</strong> {verificationResult.details.prenom_mere} {verificationResult.details.nom_mere}</p>
                                  )}
                                </>
                              )}
                              {verificationResult.details.nom_epoux && (
                                <>
                                  <p><strong>Époux:</strong> {verificationResult.details.prenom_epoux} {verificationResult.details.nom_epoux}</p>
                                  <p><strong>Épouse:</strong> {verificationResult.details.prenom_epouse} {verificationResult.details.nom_epouse}</p>
                                  {verificationResult.details.date_mariage && (
                                    <p><strong>Date mariage:</strong> {new Date(verificationResult.details.date_mariage).toLocaleDateString('fr-FR')}</p>
                                  )}
                                  {verificationResult.details.lieu_mariage && (
                                    <p><strong>Lieu mariage:</strong> {verificationResult.details.lieu_mariage}</p>
                                  )}
                                </>
                              )}
                              {verificationResult.details.nom_defunt && (
                                <>
                                  <p><strong>Nom:</strong> {verificationResult.details.nom_defunt}</p>
                                  <p><strong>Prénom:</strong> {verificationResult.details.prenom_defunt}</p>
                                  {verificationResult.details.date_deces && (
                                    <p><strong>Date décès:</strong> {new Date(verificationResult.details.date_deces).toLocaleDateString('fr-FR')}</p>
                                  )}
                                  {verificationResult.details.lieu_deces && (
                                    <p><strong>Lieu décès:</strong> {verificationResult.details.lieu_deces}</p>
                                  )}
                                </>
                              )}
                              {verificationResult.details.mairies && (
                                <p><strong>Mairie:</strong> {verificationResult.details.mairies.nom_mairie} - {verificationResult.details.mairies.ville}</p>
                              )}
                              <p><strong>Numéro acte:</strong> {verificationResult.details.numero_acte}</p>
                              {verificationResult.details.annee && (
                                <p><strong>Année:</strong> {verificationResult.details.annee}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Indicateur de correspondance */}
                        <div className="mt-3 text-center">
                          {verificationResult.coherent ? (
                            <p className="text-sm font-semibold text-green-700">
                              ✅ Les informations correspondent parfaitement
                            </p>
                          ) : (
                            <p className="text-sm font-semibold text-yellow-700">
                              ⚠️ Attention : Des différences ont été détectées entre la demande et l'acte original
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {!verificationResult.valide && (
                      <div className="mt-3 pt-3 border-t border-red-300">
                        <p className="text-sm text-red-700 font-medium">
                          ⚠️ Vous ne pouvez QUE rejeter cette demande car le numéro d'acte est invalide.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600">En attente de vérification...</p>
                  </div>
                )}
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
                    disabled={verificationLoading}
                  >
                    Mettre en Traitement
                  </Button>
                )}
                {(selectedDemande.statut === 'en_attente' || selectedDemande.statut === 'en_traitement') && (
                  <>
                    <div className="flex-1">
                      <Button
                        variant="success"
                        onClick={() => handleUpdateStatut(selectedDemande.id, 'approuvee')}
                        className="w-full"
                        disabled={verificationLoading || (verificationResult && !verificationResult.valide)}
                        title={
                          verificationLoading ? 'Vérification en cours...' :
                          (verificationResult && !verificationResult.valide) ? 'Impossible d\'approuver : numéro d\'acte invalide' :
                          'Approuver la demande'
                        }
                      >
                        {verificationLoading ? '🔄 Vérification...' : '✅ Approuver'}
                      </Button>
                      {verificationResult && !verificationResult.valide && (
                        <p className="text-xs text-red-600 mt-1 text-center">
                          ⚠️ Numéro d'acte invalide
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowRejetModal(true)}
                      className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                      disabled={verificationLoading}
                    >
                      ❌ Rejeter
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Rejet avec Motif */}
      {showRejetModal && selectedDemande && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <Card className="max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <XCircle className="text-red-600" size={28} />
                Rejeter la Demande
              </h2>
              <button
                onClick={() => {
                  setShowRejetModal(false)
                  setMotifRejet('')
                  setMotifAutre('')
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Attention :</strong> Cette action rejettera définitivement la demande. 
                  Le citoyen sera notifié du rejet avec le motif que vous indiquez.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Motif du rejet <span className="text-red-600">*</span>
                </label>
                <Select
                  label=""
                  value={motifRejet}
                  onChange={(e) => setMotifRejet(e.target.value)}
                  options={[
                    { value: '', label: 'Sélectionner un motif' },
                    { value: 'Informations incorrectes', label: 'Informations incorrectes' },
                    { value: 'Documents incomplets', label: 'Documents incomplets' },
                    { value: 'Faux documents soumis', label: 'Faux documents soumis' },
                    { value: 'Documents illisibles', label: 'Documents illisibles' },
                    { value: 'Acte introuvable dans les registres', label: 'Acte introuvable dans les registres' },
                    { value: 'Demande en doublon', label: 'Demande en doublon' },
                    { value: 'autre', label: 'Autre (préciser)' },
                  ]}
                />
              </div>

              {motifRejet === 'autre' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Précisez le motif <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={motifAutre}
                    onChange={(e) => setMotifAutre(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    placeholder="Veuillez préciser le motif du rejet..."
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejetModal(false)
                    setMotifRejet('')
                    setMotifAutre('')
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleRejet}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={!motifRejet || (motifRejet === 'autre' && !motifAutre.trim())}
                >
                  Confirmer le Rejet
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
