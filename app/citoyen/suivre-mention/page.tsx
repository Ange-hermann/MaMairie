'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Search, FileText, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SuivreMentionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [codeSuivi, setCodeSuivi] = useState(searchParams.get('code') || '')
  const [avisMention, setAvisMention] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUserData()
    
    // Si un code est dans l'URL, rechercher automatiquement
    const codeFromUrl = searchParams.get('code')
    if (codeFromUrl) {
      setCodeSuivi(codeFromUrl)
      handleSearch(codeFromUrl)
    }
  }, [])

  const fetchUserData = async () => {
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
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (code?: string) => {
    const searchCode = code || codeSuivi
    
    if (!searchCode.trim()) {
      setError('Veuillez saisir un code de suivi')
      return
    }

    setSearching(true)
    setError('')
    setAvisMention(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('avis_mentions')
        .select('*')
        .eq('code_suivi', searchCode.trim())
        .single()

      if (fetchError || !data) {
        setError('Aucun avis de mention trouvé avec ce code')
        return
      }

      setAvisMention(data)
    } catch (err) {
      console.error('Erreur:', err)
      setError('Erreur lors de la recherche')
    } finally {
      setSearching(false)
    }
  }

  const getStatutInfo = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return {
          label: 'En attente de validation',
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        }
      case 'en_traitement':
        return {
          label: 'En cours de traitement',
          icon: FileText,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        }
      case 'documents_verifies':
        return {
          label: 'Documents vérifiés',
          icon: CheckCircle,
          color: 'text-cyan-600',
          bgColor: 'bg-cyan-50',
          borderColor: 'border-cyan-200'
        }
      case 'approuvee':
        return {
          label: 'Approuvée - Mention apposée',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
      case 'rejetee':
        return {
          label: 'Rejetée',
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      default:
        return {
          label: statut,
          icon: AlertTriangle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        }
    }
  }

  const getTypeMentionLabel = (type: string) => {
    const labels: Record<string, string> = {
      adoption: 'Adoption',
      mariage: 'Mariage',
      divorce: 'Divorce',
      deces: 'Décès',
      reconnaissance: 'Reconnaissance',
      changement_nom: 'Changement de nom'
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="citoyen" />
      
      <div className="flex-1 w-full lg:w-auto">
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Chargement...'}
          userRole="citoyen"
          avatarUrl={userData?.avatar_url}
        />
        
        <main className="p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🔍 Suivre un Avis de Mention
              </h1>
              <p className="text-gray-600">
                Entrez votre code de suivi pour consulter l'état de votre demande
              </p>
            </div>

            {/* Formulaire de recherche */}
            <Card className="mb-6">
              <div className="space-y-4">
                <Input
                  label="Code de suivi"
                  value={codeSuivi}
                  onChange={(e) => setCodeSuivi(e.target.value)}
                  placeholder="Ex: MEN-2024-001234"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                
                <Button
                  onClick={() => handleSearch()}
                  disabled={searching || !codeSuivi.trim()}
                  className="w-full"
                  variant="primary"
                >
                  <Search size={20} className="mr-2" />
                  {searching ? 'Recherche...' : 'Rechercher'}
                </Button>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Résultat */}
            {avisMention && (
              <Card>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Détails de votre avis de mention
                </h2>

                {/* Statut */}
                <div className={`${getStatutInfo(avisMention.statut).bgColor} border ${getStatutInfo(avisMention.statut).borderColor} rounded-lg p-6 mb-6`}>
                  <div className="flex items-center gap-3 mb-3">
                    {(() => {
                      const Icon = getStatutInfo(avisMention.statut).icon
                      return <Icon className={getStatutInfo(avisMention.statut).color} size={32} />
                    })()}
                    <div>
                      <p className="text-sm text-gray-600">Statut actuel</p>
                      <p className={`text-xl font-bold ${getStatutInfo(avisMention.statut).color}`}>
                        {getStatutInfo(avisMention.statut).label}
                      </p>
                    </div>
                  </div>

                  {avisMention.statut === 'approuvee' && (
                    <div className="mt-4 bg-white/50 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        ✅ Votre mention a été apposée sur l'acte. Vous pouvez demander un nouvel extrait pour voir la mention.
                      </p>
                    </div>
                  )}

                  {avisMention.statut === 'rejetee' && avisMention.motif_rejet && (
                    <div className="mt-4 bg-white/50 rounded-lg p-4">
                      <p className="text-sm text-red-800 font-semibold mb-1">Motif du rejet :</p>
                      <p className="text-sm text-red-800">{avisMention.motif_rejet}</p>
                    </div>
                  )}
                </div>

                {/* Informations */}
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Code de suivi</p>
                      <p className="font-semibold text-gray-800">{avisMention.code_suivi}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date de soumission</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(avisMention.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Type d'acte concerné</p>
                      <p className="font-semibold text-gray-800 capitalize">{avisMention.type_acte_cible}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Numéro de l'acte</p>
                      <p className="font-semibold text-gray-800">
                        {avisMention.numero_acte_cible}/{avisMention.annee_acte_cible}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Type de mention</p>
                    <p className="font-semibold text-gray-800">
                      {getTypeMentionLabel(avisMention.type_mention)}
                    </p>
                  </div>

                  {avisMention.description_mention && (
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="text-gray-800">{avisMention.description_mention}</p>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className="mt-8 border-t pt-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Historique</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Demande soumise</p>
                        <p className="text-xs text-gray-600">
                          {new Date(avisMention.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    {avisMention.date_validation && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Validée par l'agent</p>
                          <p className="text-xs text-gray-600">
                            {new Date(avisMention.date_validation).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    )}

                    {avisMention.date_verification && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Documents vérifiés</p>
                          <p className="text-xs text-gray-600">
                            {new Date(avisMention.date_verification).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    )}

                    {avisMention.statut === 'approuvee' && avisMention.updated_at && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Mention apposée</p>
                          <p className="text-xs text-gray-600">
                            {new Date(avisMention.updated_at).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    )}

                    {avisMention.statut === 'rejetee' && avisMention.updated_at && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Demande rejetée</p>
                          <p className="text-xs text-gray-600">
                            {new Date(avisMention.updated_at).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
