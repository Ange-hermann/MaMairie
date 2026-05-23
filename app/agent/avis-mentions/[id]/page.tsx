'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, CheckCircle, XCircle, FileText, Download, ExternalLink } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useParams } from 'next/navigation'
import { getTypeMentionLabel } from '@/lib/generateCodeMention'

export default function TraiterAvisMentionPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [avis, setAvis] = useState<any>(null)
  const [acteOriginal, setActeOriginal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [showRejetModal, setShowRejetModal] = useState(false)
  const [motifRejet, setMotifRejet] = useState('')

  useEffect(() => {
    fetchData()
  }, [params.id])

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
      }

      // Récupérer l'avis de mention
      const { data: avisData, error: avisError } = await supabase
        .from('avis_mentions')
        .select('*')
        .eq('id', params.id)
        .single()

      if (avisError) {
        console.error('Erreur:', avisError)
        return
      }

      setAvis(avisData)

      // Récupérer l'acte original
      if (avisData) {
        const tableName = avisData.type_acte_cible === 'naissance' ? 'naissances' :
                         avisData.type_acte_cible === 'mariage' ? 'mariages' : 'deces'

        const { data: acteData } = await supabase
          .from(tableName)
          .select('*')
          .eq('numero_acte', avisData.numero_acte_cible)
          .eq('annee', avisData.annee_acte_cible)
          .single()

        if (acteData) {
          setActeOriginal(acteData)
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprouver = async () => {
    if (!confirm('Êtes-vous sûr de vouloir approuver cet avis de mention ?')) {
      return
    }

    setProcessing(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Mettre à jour le statut de l'avis
      const { error: updateError } = await supabase
        .from('avis_mentions')
        .update({
          statut: 'approuvee',
          agent_id: user?.id,
          date_traitement: new Date().toISOString()
        })
        .eq('id', params.id)

      if (updateError) throw updateError

      // Créer la mention apposée
      const { error: mentionError } = await supabase
        .from('mentions_apposees')
        .insert([{
          avis_mention_id: params.id,
          type_acte: avis.type_acte_cible,
          acte_id: acteOriginal.id,
          type_mention: avis.type_mention,
          texte_mention: avis.description_mention,
          date_mention: avis.date_evenement,
          agent_id: user?.id
        }])

      if (mentionError) throw mentionError

      alert('✅ Avis de mention approuvé avec succès !')
      router.push('/agent/avis-mentions')
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('❌ Erreur : ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleRejeter = async () => {
    if (!motifRejet.trim()) {
      alert('Veuillez saisir un motif de rejet')
      return
    }

    setProcessing(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('avis_mentions')
        .update({
          statut: 'rejetee',
          motif_rejet: motifRejet,
          agent_id: user?.id,
          date_traitement: new Date().toISOString()
        })
        .eq('id', params.id)

      if (error) throw error

      alert('✅ Avis de mention rejeté')
      router.push('/agent/avis-mentions')
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('❌ Erreur : ' + error.message)
    } finally {
      setProcessing(false)
      setShowRejetModal(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Chargement...</p>
      </div>
    )
  }

  if (!avis) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Avis de mention non trouvé</p>
      </div>
    )
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
          <div className="max-w-5xl mx-auto">
            {/* Bouton retour */}
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => router.push('/agent/avis-mentions')}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                Retour à la liste
              </Button>
            </div>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Traiter l'avis de mention
              </h1>
              <p className="text-gray-600">
                Code : <span className="font-mono font-bold text-orange-600">{avis.code_suivi}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Colonne principale */}
              <div className="lg:col-span-2 space-y-6">
                {/* Informations du demandeur */}
                <Card>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">👤 Demandeur</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Nom</p>
                      <p className="font-semibold">{avis.users?.nom}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Prénom</p>
                      <p className="font-semibold">{avis.users?.prenom}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-semibold">{avis.users?.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Téléphone</p>
                      <p className="font-semibold">{avis.users?.telephone || 'Non renseigné'}</p>
                    </div>
                  </div>
                </Card>

                {/* Acte ciblé */}
                <Card>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">📄 Acte à annoter</h2>
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Type d'acte</p>
                          <p className="font-semibold capitalize">{avis.type_acte_cible}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Numéro</p>
                          <p className="font-semibold">{avis.numero_acte_cible}/{avis.annee_acte_cible}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-600">Mairie</p>
                          <p className="font-semibold">{avis.mairies?.nom_mairie} - {avis.mairies?.ville}</p>
                        </div>
                      </div>
                    </div>

                    {acteOriginal && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Détails de l'acte :</p>
                        <div className="text-sm text-gray-600 space-y-1">
                          {avis.type_acte_cible === 'naissance' && (
                            <>
                              <p><strong>Nom :</strong> {acteOriginal.nom}</p>
                              <p><strong>Prénom :</strong> {acteOriginal.prenom}</p>
                              <p><strong>Date naissance :</strong> {new Date(acteOriginal.date_naissance).toLocaleDateString('fr-FR')}</p>
                            </>
                          )}
                          {avis.type_acte_cible === 'mariage' && (
                            <>
                              <p><strong>Époux :</strong> {acteOriginal.prenom_epoux} {acteOriginal.nom_epoux}</p>
                              <p><strong>Épouse :</strong> {acteOriginal.prenom_epouse} {acteOriginal.nom_epouse}</p>
                              <p><strong>Date mariage :</strong> {new Date(acteOriginal.date_mariage).toLocaleDateString('fr-FR')}</p>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Détails de la mention */}
                <Card>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">📝 Mention demandée</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Type de mention</p>
                      <p className="text-lg font-semibold text-orange-600">
                        {getTypeMentionLabel(avis.type_mention)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date de l'événement</p>
                      <p className="font-semibold">
                        {new Date(avis.date_evenement).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Description</p>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {avis.description_mention}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Pièces justificatives */}
                {avis.pieces_justificatives && avis.pieces_justificatives.length > 0 && (
                  <Card>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">📎 Pièces justificatives</h2>
                    <div className="space-y-2">
                      {avis.pieces_justificatives.map((url: string, index: number) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2">
                            <FileText size={20} className="text-gray-600" />
                            <span className="text-sm text-gray-700">Document {index + 1}</span>
                          </div>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <ExternalLink size={16} />
                            Voir
                          </a>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* Colonne latérale - Actions */}
              <div className="space-y-6">
                <Card>
                  <h3 className="font-semibold text-gray-800 mb-4">⚡ Actions</h3>
                  
                  {avis.statut === 'en_attente' || avis.statut === 'en_traitement' ? (
                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        onClick={handleApprouver}
                        disabled={processing}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle size={18} className="mr-2" />
                        {processing ? 'Traitement...' : 'Approuver'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => setShowRejetModal(true)}
                        disabled={processing}
                        className="w-full text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle size={18} className="mr-2" />
                        Rejeter
                      </Button>
                    </div>
                  ) : (
                    <div className={`p-4 rounded-lg ${
                      avis.statut === 'approuvee' 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className={`font-semibold ${
                        avis.statut === 'approuvee' ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {avis.statut === 'approuvee' ? '✅ Avis approuvé' : '❌ Avis rejeté'}
                      </p>
                      {avis.motif_rejet && (
                        <p className="text-sm text-red-800 mt-2">
                          <strong>Motif :</strong> {avis.motif_rejet}
                        </p>
                      )}
                      {avis.date_traitement && (
                        <p className="text-sm mt-2 text-gray-600">
                          Le {new Date(avis.date_traitement).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  )}
                </Card>

                <Card>
                  <h3 className="font-semibold text-gray-800 mb-4">ℹ️ Informations</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-600">Date de demande</p>
                      <p className="font-semibold">
                        {new Date(avis.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Statut actuel</p>
                      <p className="font-semibold capitalize">{avis.statut.replace('_', ' ')}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Rejet */}
      {showRejetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Rejeter l'avis</h2>
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
                  disabled={!motifRejet.trim() || processing}
                >
                  {processing ? 'Traitement...' : 'Confirmer le Rejet'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
