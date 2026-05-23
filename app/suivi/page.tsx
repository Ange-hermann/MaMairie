'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Search, CheckCircle, Clock, XCircle, FileText, Download, Baby, AlertTriangle } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { validateCodeSuivi } from '@/lib/generateCodeSuivi'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SuiviPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [code, setCode] = useState(searchParams.get('code') || '')
  const [loading, setLoading] = useState(false)
  const [declaration, setDeclaration] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUserData()
    
    // Si un code est dans l'URL, rechercher automatiquement
    const codeFromUrl = searchParams.get('code')
    if (codeFromUrl) {
      setCode(codeFromUrl)
      handleSearch(codeFromUrl)
    }
  }, [])

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          setUserData(profile)
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setPageLoading(false)
    }
  }

  const handleSearch = async (searchCode?: string) => {
    const codeToSearch = searchCode || code
    
    if (!codeToSearch) {
      setError('Veuillez saisir un code de suivi')
      return
    }

    if (!validateCodeSuivi(codeToSearch)) {
      setError('Format de code invalide. Format attendu : NAI-AAAA-XXX-XXXXX')
      return
    }

    setLoading(true)
    setError('')
    setDeclaration(null)

    try {
      console.log('🔍 Recherche du code:', codeToSearch)
      
      const { data, error: fetchError } = await supabase
        .from('declarations_naissance')
        .select(`
          *,
          mairies (
            nom_mairie,
            ville
          ),
          naissances (
            id,
            numero_acte
          )
        `)
        .eq('code_suivi', codeToSearch)
        .single()

      console.log('📊 Résultat:', { data, fetchError })

      if (fetchError) {
        console.error('❌ Erreur Supabase:', fetchError)
        if (fetchError.code === 'PGRST116') {
          setError('Aucune déclaration trouvée avec ce code. Vérifiez le code et réessayez.')
        } else if (fetchError.message.includes('RLS')) {
          setError('Erreur de permission. Veuillez contacter le support.')
        } else {
          setError(`Erreur: ${fetchError.message}`)
        }
        return
      }

      if (!data) {
        setError('Aucune déclaration trouvée avec ce code')
        return
      }

      console.log('✅ Déclaration trouvée:', data)
      setDeclaration(data)
    } catch (err: any) {
      console.error('❌ Erreur catch:', err)
      setError(`Erreur lors de la recherche: ${err.message || 'Erreur inconnue'}`)
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
          description: 'Votre déclaration a été reçue et est en attente de traitement par un agent'
        }
      case 'en_traitement':
        return {
          icon: FileText,
          color: 'text-blue-600',
          bg: 'bg-blue-100',
          label: 'En cours de traitement',
          description: 'Un agent est en train de vérifier votre déclaration'
        }
      case 'validee':
        return {
          icon: CheckCircle,
          color: 'text-cyan-600',
          bg: 'bg-cyan-100',
          label: 'Validée - Présentez-vous à la mairie',
          description: 'Votre déclaration a été validée. Présentez-vous à la mairie avec vos documents originaux'
        }
      case 'documents_verifies':
        return {
          icon: CheckCircle,
          color: 'text-blue-600',
          bg: 'bg-blue-100',
          label: 'Documents vérifiés',
          description: 'Vos documents ont été vérifiés. L\'acte est en cours de génération'
        }
      case 'remis':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-100',
          label: 'Acte remis',
          description: 'L\'acte de naissance vous a été remis. Processus terminé ✅'
        }
      case 'rejetee':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-100',
          label: 'Rejetée',
          description: 'Votre déclaration a été rejetée'
        }
      default:
        return {
          icon: AlertTriangle,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          label: `Statut: ${statut}`,
          description: 'Contactez la mairie pour plus d\'informations'
        }
    }
  }

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={userData?.role || 'citoyen'} />
      
      <div className="flex-1 w-full lg:w-auto">
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Visiteur'}
          userRole={userData?.role || 'citoyen'}
          avatarUrl={userData?.avatar_url}
        />
        
        <main className="p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🔍 Suivre une Déclaration
              </h1>
              <p className="text-gray-600">
                Entrez votre code de suivi pour consulter l'état de votre déclaration de naissance
              </p>
            </div>

        {/* Formulaire de recherche */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                label="Code de suivi"
                placeholder="NAI-2026-ABJ-00001"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <p className="text-xs text-gray-500 mt-1">
                Format : NAI-AAAA-XXX-XXXXX
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
        {declaration && (
          <div className="space-y-6">
            {/* Statut actuel */}
            <Card>
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getStatutInfo(declaration.statut).bg} mb-4`}>
                  {(() => {
                    const Icon = getStatutInfo(declaration.statut).icon
                    return <Icon className={getStatutInfo(declaration.statut).color} size={40} />
                  })()}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {getStatutInfo(declaration.statut).label}
                </h2>
                <p className="text-gray-600 mb-4">
                  {getStatutInfo(declaration.statut).description}
                </p>
                <p className="text-sm text-gray-500">
                  Code de suivi : <span className="font-mono font-bold text-orange-600">{declaration.code_suivi}</span>
                </p>
              </div>
            </Card>

            {/* Message important si validée */}
            {declaration.statut === 'validee' && (
              <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="text-white" size={24} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-orange-900 mb-2">
                      ⚠️ Action requise - Présentez-vous à la mairie
                    </h3>
                    <div className="space-y-2 text-gray-800">
                      <p className="font-semibold">
                        Votre déclaration a été validée ! Vous devez maintenant vous présenter à la mairie dans un délai de <span className="text-orange-600 font-bold">7 jours</span>.
                      </p>
                      <div className="bg-white/70 rounded-lg p-4 mt-3">
                        <p className="font-semibold text-gray-900 mb-2">📋 Documents à apporter :</p>
                        <ul className="space-y-1 text-sm">
                          <li>✓ Votre pièce d'identité (CNI, passeport)</li>
                          <li>✓ Les documents originaux justificatifs</li>
                          <li>✓ Ce code de suivi : <span className="font-mono font-bold text-orange-600">{declaration.code_suivi}</span></li>
                        </ul>
                      </div>
                      <div className="bg-orange-100 rounded-lg p-3 mt-3">
                        <p className="text-sm font-semibold text-orange-900">
                          🏛️ Mairie : {declaration.mairies?.nom_mairie} - {declaration.mairies?.ville}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        ⏰ Après vérification de vos documents originaux, l'acte de naissance vous sera remis en main propre.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

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
                      <p className="font-semibold text-gray-800">Déclaration soumise</p>
                      <p className="text-sm text-gray-600">
                        {new Date(declaration.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {/* En traitement */}
                  {['en_traitement', 'validee', 'rejetee'].includes(declaration.statut) && (
                    <div className="relative flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full ${
                        declaration.statut === 'en_traitement' ? 'bg-blue-500' : 'bg-green-500'
                      } flex items-center justify-center z-10`}>
                        <FileText className="text-white" size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">Mise en traitement</p>
                        <p className="text-sm text-gray-600">
                          {new Date(declaration.updated_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Validée ou Rejetée */}
                  {['validee', 'documents_verifies', 'remis', 'rejetee'].includes(declaration.statut) && (
                    <div className="relative flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full ${
                        declaration.statut === 'rejetee' ? 'bg-red-500' : 'bg-cyan-500'
                      } flex items-center justify-center z-10`}>
                        {declaration.statut === 'rejetee' ? (
                          <XCircle className="text-white" size={18} />
                        ) : (
                          <CheckCircle className="text-white" size={18} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {declaration.statut === 'rejetee' ? 'Déclaration rejetée' : 'Déclaration validée'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(declaration.updated_at).toLocaleString('fr-FR')}
                        </p>
                        {declaration.statut === 'rejetee' && declaration.motif_rejet && (
                          <div className="mt-2 bg-red-50 border border-red-200 rounded p-3">
                            <p className="text-sm text-red-800">
                              <strong>Motif :</strong> {declaration.motif_rejet}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Documents vérifiés */}
                  {['documents_verifies', 'remis'].includes(declaration.statut) && (
                    <div className="relative flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center z-10">
                        <CheckCircle className="text-white" size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">Documents vérifiés</p>
                        <p className="text-sm text-gray-600">
                          Documents originaux vérifiés par l'agent
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Acte remis */}
                  {declaration.statut === 'remis' && (
                    <div className="relative flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center z-10">
                        <CheckCircle className="text-white" size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">Acte remis</p>
                        <p className="text-sm text-gray-600">
                          L'acte de naissance vous a été remis en main propre
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          ✅ Processus terminé
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Informations de la déclaration */}
            <Card>
              <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Détails de la déclaration</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">👶 Enfant</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><strong>Nom :</strong> {declaration.nom_enfant}</p>
                    <p><strong>Prénom :</strong> {declaration.prenom_enfant}</p>
                    <p><strong>Date de naissance :</strong> {new Date(declaration.date_naissance).toLocaleDateString('fr-FR')}</p>
                    <p><strong>Sexe :</strong> {declaration.sexe === 'masculin' ? 'Masculin' : 'Féminin'}</p>
                    <p className="col-span-2"><strong>Lieu :</strong> {declaration.lieu_naissance}</p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">🏛️ Mairie</h4>
                  <p className="text-sm">
                    {declaration.mairies?.nom_mairie} - {declaration.mairies?.ville}
                  </p>
                </div>

                {declaration.statut === 'validee' && declaration.naissances && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">✅ Acte de naissance</h4>
                    <p className="text-sm mb-3">
                      Numéro d'acte : <strong>{declaration.naissances.numero_acte}</strong>
                    </p>
                    <Button
                      onClick={() => window.open(`/api/download-acte?id=${declaration.naissances.id}&type=naissance`, '_blank')}
                      className="w-full"
                    >
                      <Download size={18} className="mr-2" />
                      Télécharger l'acte de naissance
                    </Button>
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
                  setDeclaration(null)
                  setError('')
                }}
              >
                Faire une nouvelle recherche
              </Button>
            </div>
          </div>
        )}

        {/* Aide */}
        {!declaration && !error && (
          <Card className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">❓ Besoin d'aide ?</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Le code de suivi vous a été fourni lors de la soumission de votre déclaration</p>
              <p>• Si vous avez perdu votre code, connectez-vous à votre espace citoyen</p>
              <p>• Le format du code est : NAI-AAAA-XXX-XXXXX</p>
              <p>• Pour toute question, contactez la mairie où vous avez fait votre déclaration</p>
            </div>
          </Card>
        )}
          </div>
        </main>
      </div>
    </div>
  )
}
