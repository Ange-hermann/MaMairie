'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Search, CheckCircle, Clock, XCircle, FileText, ArrowLeft } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { validateCodeMention, getTypeMentionLabel } from '@/lib/generateCodeMention'

export default function SuiviMentionPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [avis, setAvis] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const codeParam = params.get('code')
    if (codeParam) {
      setCode(codeParam)
      handleSearch(codeParam)
    }
  }, [])

  const handleSearch = async (searchCode?: string) => {
    const codeToSearch = searchCode || code
    
    if (!codeToSearch) {
      setError('Veuillez saisir un code de suivi')
      return
    }

    if (!validateCodeMention(codeToSearch)) {
      setError('Format de code invalide. Format attendu : MEN-AAAA-XXX-XXXXX')
      return
    }

    setLoading(true)
    setError('')
    setAvis(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('avis_mentions')
        .select(`
          *,
          mairies (
            nom_mairie,
            ville
          )
        `)
        .eq('code_suivi', codeToSearch)
        .single()

      if (fetchError || !data) {
        setError('Aucun avis de mention trouvé avec ce code')
        return
      }

      setAvis(data)
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
          label: 'En attente de traitement',
          description: 'Votre avis de mention a été reçu et est en attente de traitement'
        }
      case 'en_traitement':
        return {
          icon: FileText,
          color: 'text-blue-600',
          bg: 'bg-blue-100',
          label: 'En cours de traitement',
          description: 'Un agent est en train de vérifier votre demande'
        }
      case 'approuvee':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-100',
          label: 'Approuvée',
          description: 'Votre avis de mention a été approuvé. La mention a été apposée sur l\'acte'
        }
      case 'rejetee':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-100',
          label: 'Rejetée',
          description: 'Votre avis de mention a été rejeté'
        }
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          label: 'Statut inconnu',
          description: ''
        }
    }
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
            🔍 Suivi d'Avis de Mention
          </h1>
          <p className="text-gray-600">
            Entrez votre code de suivi pour consulter l'état de votre avis de mention
          </p>
        </div>

        {/* Formulaire de recherche */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                label="Code de suivi"
                placeholder="MEN-2026-ABJ-00001"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <p className="text-xs text-gray-500 mt-1">
                Format : MEN-AAAA-XXX-XXXXX
              </p>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => handleSearch()}
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
        {avis && (
          <div className="space-y-6">
            {/* Statut actuel */}
            <Card>
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getStatutInfo(avis.statut).bg} mb-4`}>
                  {(() => {
                    const Icon = getStatutInfo(avis.statut).icon
                    return <Icon className={getStatutInfo(avis.statut).color} size={40} />
                  })()}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {getStatutInfo(avis.statut).label}
                </h2>
                <p className="text-gray-600 mb-4">
                  {getStatutInfo(avis.statut).description}
                </p>
                <p className="text-sm text-gray-500">
                  Code de suivi : <span className="font-mono font-bold text-orange-600">{avis.code_suivi}</span>
                </p>
              </div>
            </Card>

            {/* Timeline */}
            <Card>
              <h3 className="text-xl font-bold text-gray-800 mb-6">📅 Historique</h3>
              
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

                <div className="space-y-6">
                  {/* Soumise */}
                  <div className="relative flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center z-10">
                      <CheckCircle className="text-white" size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">Avis soumis</p>
                      <p className="text-sm text-gray-600">
                        {new Date(avis.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {/* En traitement */}
                  {['en_traitement', 'approuvee', 'rejetee'].includes(avis.statut) && (
                    <div className="relative flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full ${
                        avis.statut === 'en_traitement' ? 'bg-blue-500' : 'bg-green-500'
                      } flex items-center justify-center z-10`}>
                        <FileText className="text-white" size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">Mise en traitement</p>
                        <p className="text-sm text-gray-600">
                          {new Date(avis.updated_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Approuvée ou Rejetée */}
                  {['approuvee', 'rejetee'].includes(avis.statut) && avis.date_traitement && (
                    <div className="relative flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full ${
                        avis.statut === 'approuvee' ? 'bg-green-500' : 'bg-red-500'
                      } flex items-center justify-center z-10`}>
                        {avis.statut === 'approuvee' ? (
                          <CheckCircle className="text-white" size={18} />
                        ) : (
                          <XCircle className="text-white" size={18} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {avis.statut === 'approuvee' ? 'Avis approuvé' : 'Avis rejeté'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(avis.date_traitement).toLocaleString('fr-FR')}
                        </p>
                        {avis.statut === 'rejetee' && avis.motif_rejet && (
                          <div className="mt-2 bg-red-50 border border-red-200 rounded p-3">
                            <p className="text-sm text-red-800">
                              <strong>Motif :</strong> {avis.motif_rejet}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Informations de l'avis */}
            <Card>
              <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Détails de l'avis</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">📄 Acte ciblé</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><strong>Type :</strong> {avis.type_acte_cible}</p>
                    <p><strong>Numéro :</strong> {avis.numero_acte_cible}/{avis.annee_acte_cible}</p>
                    <p className="col-span-2"><strong>Mairie :</strong> {avis.mairies?.nom_mairie}</p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">📝 Mention</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Type :</strong> {getTypeMentionLabel(avis.type_mention)}</p>
                    <p><strong>Date événement :</strong> {new Date(avis.date_evenement).toLocaleDateString('fr-FR')}</p>
                    <p><strong>Description :</strong> {avis.description_mention}</p>
                  </div>
                </div>

                {avis.statut === 'approuvee' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">✅ Mention apposée</h4>
                    <p className="text-sm text-green-800">
                      La mention a été apposée sur l'acte d'état civil. Vous pouvez demander un nouvel extrait de l'acte qui inclura cette mention.
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
                  setCode('')
                  setAvis(null)
                  setError('')
                }}
              >
                Faire une nouvelle recherche
              </Button>
            </div>
          </div>
        )}

        {/* Aide */}
        {!avis && !error && (
          <Card className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">❓ Besoin d'aide ?</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Le code de suivi vous a été fourni lors de la soumission de votre avis de mention</p>
              <p>• Si vous avez perdu votre code, connectez-vous à votre espace citoyen</p>
              <p>• Le format du code est : MEN-AAAA-XXX-XXXXX</p>
              <p>• Pour toute question, contactez la mairie concernée</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
