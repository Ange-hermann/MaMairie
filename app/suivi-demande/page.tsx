'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Search, CheckCircle, Clock, XCircle, FileText, ArrowLeft } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function SuiviDemandePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [numeroActe, setNumeroActe] = useState('')
  const [loading, setLoading] = useState(false)
  const [demande, setDemande] = useState<any>(null)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!numeroActe.trim()) {
      setError('Veuillez saisir un numéro d\'acte')
      return
    }

    setLoading(true)
    setError('')
    setDemande(null)

    try {
      // Rechercher dans les demandes
      const { data, error: fetchError } = await supabase
        .from('requests')
        .select('*')
        .eq('numero_acte', numeroActe.trim())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (fetchError || !data) {
        setError('Aucune demande trouvée avec ce numéro d\'acte')
        return
      }

      setDemande(data)
    } catch (err) {
      console.error('Erreur:', err)
      setError('Erreur lors de la recherche')
    } finally {
      setLoading(false)
    }
  }

  const getStatutInfo = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return {
          icon: Clock,
          color: 'text-orange-600',
          bg: 'bg-orange-100',
          label: 'En attente',
          description: 'Votre demande a été reçue et est en attente de traitement'
        }
      case 'en_traitement':
        return {
          icon: FileText,
          color: 'text-blue-600',
          bg: 'bg-blue-100',
          label: 'En cours de traitement',
          description: 'Un agent traite actuellement votre demande'
        }
      case 'validee':
      case 'approuvee':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-100',
          label: 'Validée',
          description: 'Votre demande a été validée. Vous pouvez récupérer votre document'
        }
      case 'rejetee':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-100',
          label: 'Rejetée',
          description: 'Votre demande a été rejetée'
        }
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          label: statut,
          description: ''
        }
    }
  }

  const getTypeActeLabel = (type: string) => {
    const types: any = {
      naissance: 'Acte de Naissance',
      mariage: 'Acte de Mariage',
      deces: 'Acte de Décès'
    }
    return types[type] || type
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Bouton Retour */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Retour
          </Button>
        </div>

        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🔍 Suivi de Demande d'Extrait
          </h1>
          <p className="text-gray-600">
            Entrez le numéro d'acte pour consulter l'état de votre demande
          </p>
        </div>

        {/* Formulaire de recherche */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                label="Numéro d'acte"
                placeholder="Ex: 1234567890"
                value={numeroActe}
                onChange={(e) => setNumeroActe(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <p className="text-xs text-gray-500 mt-1">
                Le numéro d'acte que vous avez saisi lors de votre demande
              </p>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="w-full md:w-auto"
              >
                <Search size={18} className="mr-2" />
                {loading ? 'Recherche...' : 'Rechercher'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </Card>

        {/* Résultat */}
        {demande && (
          <div className="space-y-6">
            {/* Statut actuel */}
            <Card>
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getStatutInfo(demande.statut).bg} mb-4`}>
                  {(() => {
                    const Icon = getStatutInfo(demande.statut).icon
                    return <Icon className={getStatutInfo(demande.statut).color} size={40} />
                  })()}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {getStatutInfo(demande.statut).label}
                </h2>
                <p className="text-gray-600 mb-4">
                  {getStatutInfo(demande.statut).description}
                </p>
                <p className="text-sm text-gray-500">
                  Numéro d'acte : <span className="font-mono font-bold text-orange-600">{demande.numero_acte}</span>
                </p>
              </div>
            </Card>

            {/* Timeline */}
            <Card>
              <h3 className="text-xl font-bold text-gray-800 mb-6">📅 Historique</h3>
              
              <div className="relative">
                {/* Ligne verticale */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

                {/* Étapes */}
                <div className="space-y-6">
                  {/* Soumise */}
                  <div className="relative flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center z-10">
                      <CheckCircle className="text-white" size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">Demande soumise</p>
                      <p className="text-sm text-gray-600">
                        {new Date(demande.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {/* En traitement */}
                  {['en_traitement', 'validee', 'approuvee', 'rejetee'].includes(demande.statut) && (
                    <div className="relative flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full ${
                        demande.statut === 'en_traitement' ? 'bg-blue-500' : 'bg-green-500'
                      } flex items-center justify-center z-10`}>
                        <FileText className="text-white" size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">Mise en traitement</p>
                        <p className="text-sm text-gray-600">
                          {new Date(demande.updated_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Validée ou Rejetée */}
                  {['validee', 'approuvee', 'rejetee'].includes(demande.statut) && (
                    <div className="relative flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full ${
                        ['validee', 'approuvee'].includes(demande.statut) ? 'bg-green-500' : 'bg-red-500'
                      } flex items-center justify-center z-10`}>
                        {['validee', 'approuvee'].includes(demande.statut) ? (
                          <CheckCircle className="text-white" size={18} />
                        ) : (
                          <XCircle className="text-white" size={18} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {['validee', 'approuvee'].includes(demande.statut) ? 'Demande validée' : 'Demande rejetée'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(demande.updated_at).toLocaleString('fr-FR')}
                        </p>
                        {demande.statut === 'rejetee' && demande.motif_rejet && (
                          <div className="mt-2 bg-red-50 border border-red-200 rounded p-3">
                            <p className="text-sm text-red-800">
                              <strong>Motif :</strong> {demande.motif_rejet}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Informations de la demande */}
            <Card>
              <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Détails de la demande</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">📄 Type de document</h4>
                  <p className="text-sm">{getTypeActeLabel(demande.type_acte)}</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">👤 Informations</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><strong>Nom :</strong> {demande.nom}</p>
                    <p><strong>Prénom :</strong> {demande.prenom}</p>
                    {demande.date_naissance && (
                      <p><strong>Date naissance :</strong> {new Date(demande.date_naissance).toLocaleDateString('fr-FR')}</p>
                    )}
                    {demande.lieu_naissance && (
                      <p><strong>Lieu naissance :</strong> {demande.lieu_naissance}</p>
                    )}
                  </div>
                </div>

                {['validee', 'approuvee'].includes(demande.statut) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">✅ Document prêt</h4>
                    <p className="text-sm text-green-800">
                      Votre document est prêt. Veuillez vous rendre à la mairie pour le récupérer.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Actions */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setNumeroActe('')
                  setDemande(null)
                  setError('')
                }}
              >
                Faire une nouvelle recherche
              </Button>
            </div>
          </div>
        )}

        {/* Aide */}
        {!demande && !error && (
          <Card className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">❓ Besoin d'aide ?</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Le numéro d'acte vous a été demandé lors de votre demande d'extrait</p>
              <p>• Si vous avez perdu votre numéro, connectez-vous à votre espace citoyen</p>
              <p>• Vous pouvez aussi consulter vos demandes dans "Mes Demandes"</p>
              <p>• Pour toute question, contactez votre mairie</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
