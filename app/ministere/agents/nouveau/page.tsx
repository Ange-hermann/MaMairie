'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { GeoSelector } from '@/components/GeoSelector'
import { GeoBreadcrumb } from '@/components/GeoBreadcrumb'
import { UserPlus, MapPin, AlertCircle, CheckCircle } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import type { GeoSelection } from '@/types/geo'
import { formatGeoSelection } from '@/lib/geoHelpers'

export default function NouvelAgentPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [mairieInfo, setMairieInfo] = useState<any>(null)

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    fonction: 'agent'
  })

  const [localisation, setLocalisation] = useState<GeoSelection>({})

  useEffect(() => {
    fetchUserData()
  }, [])

  // Quand la localisation change, vérifier si une mairie existe
  useEffect(() => {
    if (localisation.commune_id) {
      checkMairieExistante()
    }
  }, [localisation])

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

      if (profile && profile.role !== 'ministere') {
        router.push('/dashboard')
        return
      }

      setUserData(profile)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const checkMairieExistante = async () => {
    if (!localisation.commune_id) return

    try {
      // Chercher une mairie pour cette commune
      const { data: mairie } = await supabase
        .from('mairies')
        .select('id, nom_mairie, code_mairie')
        .eq('commune_id', localisation.commune_id)
        .single()

      if (mairie) {
        setMairieInfo({
          existe: true,
          ...mairie
        })
      } else {
        setMairieInfo({
          existe: false,
          sera_creee: true
        })
      }
    } catch (err) {
      // Pas de mairie trouvée
      setMairieInfo({
        existe: false,
        sera_creee: true
      })
    }
  }

  const generatePassword = () => {
    return Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10).toUpperCase()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!localisation.commune_id) {
      setError('Veuillez sélectionner une localisation complète')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // 1. Créer ou récupérer la mairie
      let mairieId = mairieInfo?.id

      if (!mairieInfo?.existe) {
        // Créer la mairie
        const codeMairie = localisation.commune_nom?.substring(0, 3).toUpperCase() || 'XXX'
        
        const { data: newMairie, error: mairieError } = await supabase
          .from('mairies')
          .insert([{
            nom_mairie: `Mairie de ${localisation.commune_nom}`,
            ville: localisation.commune_nom,
            code_mairie: codeMairie,
            commune_id: localisation.commune_id,
            sous_prefecture_id: localisation.sous_prefecture_id,
            gere_villages: true  // Par défaut, gère les villages
          }])
          .select()
          .single()

        if (mairieError) throw mairieError

        mairieId = newMairie.id
      }

      // 2. Créer l'utilisateur dans Supabase Auth
      const password = generatePassword()
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: password,
        email_confirm: true
      })

      if (authError) throw authError

      // 3. Créer le profil agent
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: formData.email,
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone,
          role: 'agent',
          mairie_id: mairieId,
          // Informations géographiques
          commune_id: localisation.commune_id,
          sous_prefecture_id: localisation.sous_prefecture_id,
          localisation_complete: formatGeoSelection(localisation)
        }])

      if (profileError) throw profileError

      // 4. Envoyer l'email avec les identifiants (à implémenter)
      console.log('Identifiants:', {
        email: formData.email,
        password: password
      })

      setSuccess(true)
      alert(`✅ Agent créé avec succès !\n\nEmail: ${formData.email}\nMot de passe: ${password}\n\n⚠️ Notez bien le mot de passe !`)
      
      setTimeout(() => {
        router.push('/ministere/agents')
      }, 3000)
    } catch (err: any) {
      console.error('Erreur:', err)
      setError('Erreur lors de la création: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="ministere" />
      
      <div className="flex-1 w-full lg:w-auto">
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Chargement...'}
          userRole="ministere"
          avatarUrl={userData?.avatar_url}
        />
        
        <main className="p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                👨‍💼 Créer un nouvel agent
              </h1>
              <p className="text-gray-600">
                Assignez un agent à une mairie avec sa localisation géographique
              </p>
            </div>

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-green-900">Agent créé avec succès !</p>
                  <p className="text-sm text-green-800 mt-1">Redirection en cours...</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Informations personnelles */}
              <Card className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  👤 Informations personnelles
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      required
                    />

                    <Input
                      label="Prénom"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      required
                    />
                  </div>

                  <Input
                    label="Email professionnel"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="agent@mairie.ci"
                    required
                  />

                  <Input
                    label="Téléphone"
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="+225 XX XX XX XX XX"
                  />
                </div>
              </Card>

              {/* Affectation géographique */}
              <Card className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  🗺️ Affectation géographique
                </h2>

                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ℹ️ Sélectionnez la commune où l'agent sera affecté. 
                    Si aucune mairie n'existe pour cette commune, elle sera créée automatiquement.
                  </p>
                </div>

                <GeoSelector
                  onSelect={setLocalisation}
                  required
                  showVillage={false}
                  showDistrict={true}
                />

                {/* Breadcrumb */}
                {localisation.commune_id && (
                  <div className="mt-4">
                    <GeoBreadcrumb selection={localisation} />
                  </div>
                )}

                {/* Info mairie */}
                {mairieInfo && (
                  <div className={`mt-4 p-4 border rounded-lg ${
                    mairieInfo.existe 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-orange-50 border-orange-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <MapPin className={`flex-shrink-0 mt-1 ${
                        mairieInfo.existe ? 'text-green-600' : 'text-orange-600'
                      }`} size={20} />
                      <div>
                        {mairieInfo.existe ? (
                          <>
                            <p className="font-semibold text-green-900 mb-1">
                              Mairie existante
                            </p>
                            <p className="text-sm text-green-800">
                              <strong>{mairieInfo.nom_mairie}</strong>
                            </p>
                            <p className="text-xs text-green-700 mt-1">
                              Code : {mairieInfo.code_mairie}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold text-orange-900 mb-1">
                              Nouvelle mairie
                            </p>
                            <p className="text-sm text-orange-800">
                              Une mairie sera créée pour <strong>{localisation.commune_nom}</strong>
                            </p>
                            <p className="text-xs text-orange-700 mt-1">
                              Code : {localisation.commune_nom?.substring(0, 3).toUpperCase()}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Erreur */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !localisation.commune_id || success}
                  className="flex-1"
                >
                  <UserPlus size={18} className="mr-2" />
                  {loading ? 'Création...' : '✅ Créer l\'agent'}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
