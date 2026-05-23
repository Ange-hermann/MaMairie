'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { GeoSelector } from '@/components/GeoSelector'
import { GeoBreadcrumb } from '@/components/GeoBreadcrumb'
import { FileText, MapPin, AlertCircle } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import type { GeoSelection } from '@/types/geo'
import { formatGeoSelection } from '@/lib/geoHelpers'

export default function DemandeExtraitGeoPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mairieCompetente, setMairieCompetente] = useState<any>(null)
  const [loadingMairie, setLoadingMairie] = useState(false)

  const [formData, setFormData] = useState({
    type_acte: '',
    nom: '',
    prenom: '',
    date_naissance: '',
    lieu_naissance: '',
    nom_pere: '',
    nom_mere: '',
    motif: '',
    nombre_copies: 1
  })

  const [localisation, setLocalisation] = useState<GeoSelection>({})

  useEffect(() => {
    fetchUserData()
  }, [])

  // Quand la localisation change, trouver la mairie compétente
  useEffect(() => {
    if (localisation.village_id) {
      findMairieCompetente()
    } else if (localisation.commune_id) {
      findMairieByCommune()
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

      if (profile) {
        setUserData(profile)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  // Trouver la mairie compétente pour un village
  const findMairieCompetente = async () => {
    if (!localisation.village_id) return

    setLoadingMairie(true)
    try {
      const { data, error } = await supabase
        .rpc('get_mairie_competente', { village_uuid: localisation.village_id })

      if (error) throw error

      if (data && data.length > 0) {
        setMairieCompetente(data[0])
      } else {
        setError('Aucune mairie trouvée pour ce village')
      }
    } catch (err: any) {
      console.error('Erreur mairie:', err)
      setError('Erreur lors de la recherche de la mairie')
    } finally {
      setLoadingMairie(false)
    }
  }

  // Trouver la mairie par commune
  const findMairieByCommune = async () => {
    if (!localisation.commune_id) return

    setLoadingMairie(true)
    try {
      const { data, error } = await supabase
        .from('mairies')
        .select('id, nom_mairie')
        .eq('commune_id', localisation.commune_id)
        .single()

      if (error) throw error

      if (data) {
        setMairieCompetente({
          mairie_id: data.id,
          mairie_nom: data.nom_mairie,
          type_rattachement: 'communale'
        })
      }
    } catch (err: any) {
      console.error('Erreur mairie:', err)
      // Essayer par sous-préfecture
      if (localisation.sous_prefecture_id) {
        const { data } = await supabase
          .from('mairies')
          .select('id, nom_mairie')
          .eq('sous_prefecture_id', localisation.sous_prefecture_id)
          .eq('gere_villages', true)
          .single()

        if (data) {
          setMairieCompetente({
            mairie_id: data.id,
            mairie_nom: data.nom_mairie,
            type_rattachement: 'sous_prefectorale'
          })
        }
      }
    } finally {
      setLoadingMairie(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!localisation.commune_id) {
      setError('Veuillez sélectionner une localisation complète')
      return
    }

    if (!mairieCompetente) {
      setError('Aucune mairie compétente trouvée pour cette localisation')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error: insertError } = await supabase
        .from('requests')
        .insert([{
          user_id: user?.id,
          type_acte: formData.type_acte,
          nom: formData.nom,
          prenom: formData.prenom,
          date_naissance: formData.date_naissance,
          lieu_naissance: formData.lieu_naissance,
          nom_pere: formData.nom_pere,
          nom_mere: formData.nom_mere,
          motif: formData.motif,
          nombre_copies: formData.nombre_copies,
          mairie_id: mairieCompetente.mairie_id,
          // Localisation géographique
          commune_id: localisation.commune_id,
          village_id: localisation.village_id,
          sous_prefecture_id: localisation.sous_prefecture_id,
          localisation_complete: formatGeoSelection(localisation),
          statut: 'en_attente'
        }])

      if (insertError) throw insertError

      alert('✅ Demande soumise avec succès !')
      router.push('/mes-demandes')
    } catch (err: any) {
      console.error('Erreur:', err)
      setError('Erreur lors de la soumission: ' + err.message)
    } finally {
      setLoading(false)
    }
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
                📄 Demande d'extrait d'acte
              </h1>
              <p className="text-gray-600">
                Remplissez le formulaire avec votre localisation précise
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <Card className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  📋 Informations de l'acte
                </h2>

                <div className="space-y-4">
                  <Select
                    label="Type d'acte"
                    value={formData.type_acte}
                    onChange={(e) => setFormData({ ...formData, type_acte: e.target.value })}
                    options={[
                      { value: '', label: 'Sélectionner un type' },
                      { value: 'naissance', label: 'Acte de naissance' },
                      { value: 'mariage', label: 'Acte de mariage' },
                      { value: 'deces', label: 'Acte de décès' }
                    ]}
                    required
                  />

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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Date de naissance"
                      type="date"
                      value={formData.date_naissance}
                      onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                      required
                    />

                    <Input
                      label="Lieu de naissance"
                      value={formData.lieu_naissance}
                      onChange={(e) => setFormData({ ...formData, lieu_naissance: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nom du père"
                      value={formData.nom_pere}
                      onChange={(e) => setFormData({ ...formData, nom_pere: e.target.value })}
                    />

                    <Input
                      label="Nom de la mère"
                      value={formData.nom_mere}
                      onChange={(e) => setFormData({ ...formData, nom_mere: e.target.value })}
                    />
                  </div>

                  <Input
                    label="Motif de la demande"
                    value={formData.motif}
                    onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                    required
                  />

                  <Input
                    label="Nombre de copies"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.nombre_copies}
                    onChange={(e) => setFormData({ ...formData, nombre_copies: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </Card>

              {/* Sélection géographique */}
              <Card className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  🗺️ Localisation de l'acte
                </h2>

                <GeoSelector
                  onSelect={setLocalisation}
                  required
                  showVillage={true}
                  showDistrict={true}
                />

                {/* Breadcrumb de la sélection */}
                {localisation.commune_id && (
                  <div className="mt-4">
                    <GeoBreadcrumb selection={localisation} />
                  </div>
                )}

                {/* Mairie compétente */}
                {loadingMairie && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      🔍 Recherche de la mairie compétente...
                    </p>
                  </div>
                )}

                {mairieCompetente && !loadingMairie && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <MapPin className="text-green-600 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <p className="font-semibold text-green-900 mb-1">
                          Mairie compétente trouvée
                        </p>
                        <p className="text-sm text-green-800">
                          <strong>{mairieCompetente.mairie_nom}</strong>
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          Type : {mairieCompetente.type_rattachement === 'communale' ? 'Mairie communale' : 'Mairie sous-préfectorale'}
                        </p>
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
                  disabled={loading || !mairieCompetente}
                  className="flex-1"
                >
                  {loading ? 'Soumission...' : '✅ Soumettre la demande'}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
