'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { agentFormStore } from '@/lib/voiceAgent/agentFormStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { FileUpload } from '@/components/ui/FileUpload'
import { GeoSelector } from '@/components/GeoSelector'
import { GeoBreadcrumb } from '@/components/GeoBreadcrumb'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { GeoSelection } from '@/types/geo'
import { formatGeoSelection } from '@/lib/geoHelpers'
import { MapPin, AlertCircle } from 'lucide-react'

function DemandeExtraitContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [documentName, setDocumentName] = useState<string | null>(null)
  const [mairies, setMairies] = useState<any[]>([])
  const [communes, setCommunes] = useState<any[]>([])
  const [sousPrefectures, setSousPrefectures] = useState<any[]>([])
  const [localisation, setLocalisation] = useState<GeoSelection>({})
  const [mairieCompetente, setMairieCompetente] = useState<any>(null)
  const [loadingMairie, setLoadingMairie] = useState(false)
  const [villagesResults, setVillagesResults] = useState<any[]>([])

  // Pré-remplissage depuis l'agent vocal (query params)
  const agentType = searchParams.get('type_acte') as 'naissance' | 'mariage' | 'deces' | null
  const agentNom = searchParams.get('nom') || ''
  const agentPrenom = searchParams.get('prenom') || ''
  const agentDate = searchParams.get('date_naissance') || ''
  const agentTel = searchParams.get('telephone') || ''
  
  const [typeActe, setTypeActe] = useState<'naissance' | 'mariage' | 'deces'>(agentType || 'naissance')
  
  const [formData, setFormData] = useState({
    numero_acte: '',
    nom: agentNom,
    prenom: agentPrenom,
    date_naissance: agentDate,
    lieu_naissance: '',
    nom_pere: '',
    nom_mere: '',
    telephone: agentTel,
    mairie_id: '',
    selection_mode: 'mairie',
    village_search: '',
    // Pour mariage
    nom_conjoint: '',
    prenom_conjoint: '',
    date_mariage: '',
    lieu_mariage: '',
    // Pour décès
    date_deces: '',
    lieu_deces: '',
    cause_deces: '',
  })

  // ─── Lire le store de l'agent vocal et remplir les champs ───────────
  useEffect(() => {
    const applyPrefill = async () => {
      const prefill = agentFormStore.prefill
      if (!prefill) return

      if (prefill.type_acte) setTypeActe(prefill.type_acte)

      setFormData(prev => ({
        ...prev,
        numero_acte: prefill.numero_acte && prefill.numero_acte.toLowerCase() !== 'inconnu' ? prefill.numero_acte : prev.numero_acte,
        nom: prefill.nom || prev.nom,
        prenom: prefill.prenom || prev.prenom,
        date_naissance: prefill.date_naissance || prev.date_naissance,
        lieu_naissance: prefill.lieu_naissance || prev.lieu_naissance,
        nom_pere: prefill.nom_pere || prev.nom_pere,
        nom_mere: prefill.nom_mere || prev.nom_mere,
        telephone: prefill.telephone || prev.telephone,
        nom_conjoint: prefill.nom_conjoint || prev.nom_conjoint,
        prenom_conjoint: prefill.prenom_conjoint || prev.prenom_conjoint,
        date_mariage: prefill.date_mariage || prev.date_mariage,
        lieu_mariage: prefill.lieu_mariage || prev.lieu_mariage,
        date_deces: prefill.date_deces || prev.date_deces,
        lieu_deces: prefill.lieu_deces || prev.lieu_deces,
        cause_deces: prefill.cause_deces || prev.cause_deces,
      }))

      // Rechercher la mairie par nom de commune si fourni
      if (prefill.commune_nom) {
        const { data: mairie } = await supabase
          .from('mairies')
          .select('id, nom_mairie')
          .ilike('nom_mairie', `%${prefill.commune_nom}%`)
          .limit(1)
          .single()
        if (mairie) {
          setFormData(prev => ({ ...prev, mairie_id: mairie.id }))
        }
      }

      agentFormStore.clearPrefill()
    }
    applyPrefill()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Récupérer le profil
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUserData(profile)
        // Pré-remplir le téléphone si disponible
        setFormData(prev => ({
          ...prev,
          telephone: profile.telephone || ''
        }))
      }

      // Récupérer la liste des mairies
      const { data: mairiesData } = await supabase
        .from('mairies')
        .select('id, nom_mairie, ville')
        .order('nom_mairie')

      if (mairiesData) {
        setMairies(mairiesData.map(m => ({
          value: m.id,
          label: `${m.nom_mairie} - ${m.ville || ''}`,
          type: 'mairie'
        })))
      }

      // Récupérer la liste des communes
      const { data: communesData } = await supabase
        .from('communes')
        .select('id, nom, sous_prefectures(nom)')
        .order('nom')

      console.log('Communes chargées:', communesData)

      if (communesData) {
        setCommunes(communesData.map(c => ({
          value: c.id,
          label: `Commune de ${c.nom}`,
          type: 'commune'
        })))
      }

      // Récupérer la liste des sous-préfectures
      const { data: sousPrefData } = await supabase
        .from('sous_prefectures')
        .select('id, nom, departements(nom)')
        .order('nom')

      console.log('Sous-préfectures chargées:', sousPrefData)

      if (sousPrefData) {
        setSousPrefectures(sousPrefData.map(sp => ({
          value: sp.id,
          label: `Sous-préfecture de ${sp.nom}`,
          type: 'sous_prefecture'
        })))
      }
    }

    fetchData()
  }, [])

  // Trouver la mairie compétente quand la localisation change
  useEffect(() => {
    const findMairieCompetente = async () => {
      if (!localisation.village_id && !localisation.commune_id) {
        setMairieCompetente(null)
        return
      }

      setLoadingMairie(true)
      try {
        // Si un village est sélectionné, utiliser la fonction SQL
        if (localisation.village_id) {
          const { data, error } = await supabase
            .rpc('get_mairie_competente', { village_uuid: localisation.village_id })

          if (error) throw error

          if (data && data.length > 0) {
            setMairieCompetente(data[0])
            // Mettre à jour le formData avec l'ID de la mairie
            setFormData(prev => ({ ...prev, mairie_id: data[0].mairie_id }))
          }
        } 
        // Sinon chercher par commune
        else if (localisation.commune_id) {
          const { data, error } = await supabase
            .from('mairies')
            .select('id, nom_mairie')
            .eq('commune_id', localisation.commune_id)
            .single()

          if (data) {
            setMairieCompetente({
              mairie_id: data.id,
              mairie_nom: data.nom_mairie,
              type_rattachement: 'communale'
            })
            setFormData(prev => ({ ...prev, mairie_id: data.id }))
          } else if (localisation.sous_prefecture_id) {
            // Essayer par sous-préfecture
            const { data: spData } = await supabase
              .from('mairies')
              .select('id, nom_mairie')
              .eq('sous_prefecture_id', localisation.sous_prefecture_id)
              .eq('gere_villages', true)
              .single()

            if (spData) {
              setMairieCompetente({
                mairie_id: spData.id,
                mairie_nom: spData.nom_mairie,
                type_rattachement: 'sous_prefectorale'
              })
              setFormData(prev => ({ ...prev, mairie_id: spData.id }))
            }
          }
        }
      } catch (err: any) {
        console.error('Erreur mairie:', err)
      } finally {
        setLoadingMairie(false)
      }
    }

    findMairieCompetente()
  }, [localisation])

  // Recherche de villages quand l'utilisateur tape
  useEffect(() => {
    const searchVillages = async () => {
      if (!formData.village_search || formData.village_search.length < 2) {
        setVillagesResults([])
        return
      }

      try {
        const { data, error } = await supabase
          .from('villages')
          .select(`
            id,
            nom,
            commune_id,
            sous_prefecture_id,
            communes(nom),
            sous_prefectures(nom)
          `)
          .ilike('nom', `%${formData.village_search}%`)
          .limit(10)

        if (error) {
          console.error('Erreur requête villages:', error)
          setVillagesResults([])
          return
        }

        console.log('Villages trouvés:', data)
        setVillagesResults(data || [])
      } catch (err) {
        console.error('Erreur recherche villages:', err)
        setVillagesResults([])
      }
    }

    const timer = setTimeout(searchVillages, 300)
    return () => clearTimeout(timer)
  }, [formData.village_search])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Vous devez être connecté')
      }

      // Préparer les données selon le type d'acte
      const requestData: any = {
        user_id: user.id,
        type_acte: typeActe,
        numero_acte: formData.numero_acte || null,
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
        mairie_id: formData.mairie_id || null,
        document_url: documentUrl,
        document_name: documentName,
        statut: 'en_attente',
        conditions_acceptees: true,
        date_acceptation_conditions: new Date().toISOString(),
      }

      // Ajouter les champs spécifiques selon le type
      if (typeActe === 'naissance') {
        requestData.date_naissance = formData.date_naissance
        requestData.lieu_naissance = formData.lieu_naissance
        requestData.nom_pere = formData.nom_pere
        requestData.nom_mere = formData.nom_mere
      } else if (typeActe === 'mariage') {
        requestData.date_mariage = formData.date_mariage
        requestData.lieu_mariage = formData.lieu_mariage
        requestData.nom_conjoint = formData.nom_conjoint
        requestData.prenom_conjoint = formData.prenom_conjoint
      } else if (typeActe === 'deces') {
        requestData.date_deces = formData.date_deces
        requestData.lieu_deces = formData.lieu_deces
        requestData.date_naissance = formData.date_naissance
        requestData.cause_deces = formData.cause_deces
      }

      // Créer la demande dans Supabase
      const { data, error } = await supabase
        .from('requests')
        .insert([requestData])
        .select()

      if (error) throw error

      // Afficher un message de succès avec le code de suivi
      const codeSuivi = data?.[0]?.code_suivi || 'N/A'
      alert(`✅ Demande soumise avec succès !\n\n📋 Code de suivi : ${codeSuivi}\n\nConservez ce code précieusement. Vous en aurez besoin pour retirer votre document.`)
      router.push('/mes-demandes')
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de la soumission : ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50" suppressHydrationWarning>
      <Sidebar role="citoyen" />
      
      <div className="flex-1 w-full lg:w-auto">
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Chargement...'}
          userRole="citoyen"
          avatarUrl={userData?.avatar_url}
        />
        
        <main className="p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {(agentNom || agentPrenom) && (
              <div className="mb-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-800 text-sm">
                <span className="text-xl">🎤</span>
                <span>Les champs ont été <strong>pré-remplis par MaMairie IA</strong>. Vérifiez les informations, joignez votre document et soumettez.</span>
              </div>
            )}
            <div className="mb-4 md:mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Demander un Extrait d'Acte {typeActe === 'naissance' ? 'de Naissance' : typeActe === 'mariage' ? 'de Mariage' : 'de Décès'}
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Remplissez le formulaire ci-dessous pour faire votre demande
              </p>
            </div>

            <Card>
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                {/* Sélecteur de type d'acte */}
                <Select
                  label="Type d'Acte"
                  options={[
                    { value: 'naissance', label: '📄 Acte de Naissance' },
                    { value: 'mariage', label: '💍 Acte de Mariage' },
                    { value: 'deces', label: '⚰️ Acte de Décès' },
                  ]}
                  value={typeActe}
                  onChange={(e) => setTypeActe(e.target.value as any)}
                  required
                />

                {/* Numéro d'acte */}
                <div>
                  <Input
                    label="Numéro d'Acte"
                    type="text"
                    placeholder="Ex: 1234567890"
                    value={formData.numero_acte}
                    onChange={(e) => setFormData({ ...formData, numero_acte: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Le numéro d'acte se trouve sur votre ancien document d'état civil
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <Input
                    label="Nom"
                    type="text"
                    placeholder="Kouadio"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                  />
                  
                  <Input
                    label="Prénom(s)"
                    type="text"
                    placeholder="Jean"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    required
                  />
                </div>

                {/* Champs spécifiques selon le type d'acte */}
                {typeActe === 'naissance' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <Input
                        label="Date de Naissance"
                        type="date"
                        value={formData.date_naissance}
                        onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                        required
                      />
                      
                      <Input
                        label="Lieu de Naissance"
                        type="text"
                        placeholder="Abidjan"
                        value={formData.lieu_naissance}
                        onChange={(e) => setFormData({ ...formData, lieu_naissance: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Nom du Père"
                        type="text"
                        placeholder="Kouadio Yao"
                        value={formData.nom_pere}
                        onChange={(e) => setFormData({ ...formData, nom_pere: e.target.value })}
                        required
                      />
                      
                      <Input
                        label="Nom de la Mère"
                        type="text"
                        placeholder="N'Guessan Aya"
                        value={formData.nom_mere}
                        onChange={(e) => setFormData({ ...formData, nom_mere: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}

                {typeActe === 'mariage' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <Input
                        label="Date du Mariage"
                        type="date"
                        value={formData.date_mariage}
                        onChange={(e) => setFormData({ ...formData, date_mariage: e.target.value })}
                        required
                      />
                      
                      <Input
                        label="Lieu du Mariage"
                        type="text"
                        placeholder="Abidjan"
                        value={formData.lieu_mariage}
                        onChange={(e) => setFormData({ ...formData, lieu_mariage: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Nom du Conjoint"
                        type="text"
                        placeholder="Kouadio"
                        value={formData.nom_conjoint}
                        onChange={(e) => setFormData({ ...formData, nom_conjoint: e.target.value })}
                        required
                      />
                      
                      <Input
                        label="Prénom du Conjoint"
                        type="text"
                        placeholder="Marie"
                        value={formData.prenom_conjoint}
                        onChange={(e) => setFormData({ ...formData, prenom_conjoint: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}

                {typeActe === 'deces' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <Input
                        label="Date de Naissance"
                        type="date"
                        value={formData.date_naissance}
                        onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                        required
                      />
                      
                      <Input
                        label="Date du Décès"
                        type="date"
                        value={formData.date_deces}
                        onChange={(e) => setFormData({ ...formData, date_deces: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Lieu du Décès"
                        type="text"
                        placeholder="Abidjan"
                        value={formData.lieu_deces}
                        onChange={(e) => setFormData({ ...formData, lieu_deces: e.target.value })}
                        required
                      />
                      
                      <Input
                        label="Cause du Décès (Optionnel)"
                        type="text"
                        placeholder="Maladie"
                        value={formData.cause_deces}
                        onChange={(e) => setFormData({ ...formData, cause_deces: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <Input
                  label="Téléphone"
                  type="tel"
                  placeholder="+225 07 XX XX XX XX"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  required
                />

                {/* Sélection SIMPLIFIÉE de la localisation */}
                <div className="border-2 border-orange-100 rounded-lg p-4 bg-orange-50/30">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <MapPin size={20} className="text-orange-500" />
                    Où se trouve votre acte ?
                  </h3>

                  {/* Choix du mode de sélection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comment souhaitez-vous sélectionner ?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, selection_mode: 'mairie' })}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                          formData.selection_mode === 'mairie'
                            ? 'border-orange-500 bg-orange-50 text-orange-900'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-orange-200'
                        }`}
                      >
                        🏢 Mairie
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, selection_mode: 'sous_prefecture' })}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                          formData.selection_mode === 'sous_prefecture'
                            ? 'border-orange-500 bg-orange-50 text-orange-900'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-orange-200'
                        }`}
                      >
                        🏘️ Sous-préfecture
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, selection_mode: 'village' })}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                          formData.selection_mode === 'village'
                            ? 'border-orange-500 bg-orange-50 text-orange-900'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-orange-200'
                        }`}
                      >
                        🏡 Village
                      </button>
                    </div>
                  </div>

                  {/* Si Mairie sélectionnée */}
                  {formData.selection_mode === 'mairie' && (
                    <div>
                      <Select
                        label="Sélectionnez votre mairie"
                        options={mairies}
                        value={formData.mairie_id}
                        onChange={(e) => setFormData({ ...formData, mairie_id: e.target.value })}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {mairies.length} mairie(s) disponible(s)
                      </p>
                    </div>
                  )}

                  {/* Si Sous-préfecture sélectionnée */}
                  {formData.selection_mode === 'sous_prefecture' && (
                    <div>
                      <Select
                        label="Sélectionnez votre sous-préfecture"
                        options={sousPrefectures}
                        value={formData.mairie_id}
                        onChange={(e) => setFormData({ ...formData, mairie_id: e.target.value })}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {sousPrefectures.length} sous-préfecture(s) disponible(s)
                      </p>
                    </div>
                  )}

                  {/* Si Village sélectionné */}
                  {formData.selection_mode === 'village' && (
                    <div>
                      <Input
                        label="Tapez le nom de votre village"
                        type="text"
                        placeholder="Ex: Cocody-Riviera"
                        value={formData.village_search}
                        onChange={(e) => setFormData({ ...formData, village_search: e.target.value })}
                      />
                      
                      {/* Résultats de recherche */}
                      {formData.village_search && formData.village_search.length >= 2 && (
                        <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                          {loadingMairie ? (
                            <div className="p-4 text-center">
                              <p className="text-sm text-gray-500">🔍 Recherche en cours...</p>
                            </div>
                          ) : villagesResults.length > 0 ? (
                            villagesResults.map((village) => (
                              <button
                                key={village.id}
                                type="button"
                                onClick={async () => {
                                  console.log('Village cliqué:', village)
                                  setLoadingMairie(true)
                                  
                                  try {
                                    // Trouver la mairie/SP pour ce village
                                    const { data, error } = await supabase
                                      .rpc('get_mairie_competente', { village_uuid: village.id })
                                    
                                    console.log('Résultat get_mairie_competente:', data, error)
                                    
                                    if (error) {
                                      console.error('Erreur get_mairie_competente:', error)
                                      alert('Erreur lors de la recherche de la mairie. Vérifiez que la fonction SQL existe.')
                                      setLoadingMairie(false)
                                      return
                                    }
                                    
                                    if (data && data.length > 0) {
                                      console.log('Mairie trouvée:', data[0])
                                      setMairieCompetente(data[0])
                                      setFormData(prev => ({ 
                                        ...prev, 
                                        mairie_id: data[0].mairie_id,
                                        village_search: village.nom
                                      }))
                                      setVillagesResults([]) // Fermer la liste
                                    } else {
                                      alert('Aucune mairie trouvée pour ce village.')
                                    }
                                  } catch (err) {
                                    console.error('Erreur:', err)
                                    alert('Erreur lors de la sélection du village.')
                                  } finally {
                                    setLoadingMairie(false)
                                  }
                                }}
                                className="w-full text-left p-3 hover:bg-orange-50 border-b border-gray-100 transition cursor-pointer"
                              >
                                <p className="font-medium text-gray-900">🏡 {village.nom}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  Commune: {village.communes?.nom || 'N/A'} • SP: {village.sous_prefectures?.nom || 'N/A'}
                                </p>
                              </button>
                            ))
                          ) : (
                            <p className="p-3 text-sm text-gray-500 text-center">
                              Aucun village trouvé
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mairie/SP trouvée */}
                  {mairieCompetente && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MapPin className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="text-xs text-green-700 mb-1">
                            {mairieCompetente.type_rattachement === 'sous_prefecture' ? 'Sous-préfecture responsable :' : 'Mairie responsable :'}
                          </p>
                          <p className="font-semibold text-green-900">
                            {mairieCompetente.mairie_nom}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Composant Upload de Document */}
                <div>
                  <FileUpload
                    onFileUploaded={(url, name) => {
                      setDocumentUrl(url)
                      setDocumentName(name)
                    }}
                    onFileRemoved={() => {
                      setDocumentUrl(null)
                      setDocumentName(null)
                    }}
                    accept="image/*,.pdf"
                    maxSizeMB={5}
                    label="Ancien Acte (Obligatoire)"
                    helpText="Téléchargez une photo de votre ancien acte ou un PDF (max 5MB)"
                  />
                  {!documentUrl && (
                    <p className="text-xs text-red-600 mt-1">
                      ⚠️ L'upload de l'ancien acte est obligatoire pour traiter votre demande
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">
                    📋 Informations importantes
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Assurez-vous que toutes les informations sont correctes</li>
                    <li>• Le traitement de votre demande prendra 2-5 jours ouvrables</li>
                    <li>• Vous recevrez une notification par email et SMS</li>
                    <li>• Frais de traitement : 1,000 FCFA</li>
                    <li>• ⚠️ L'upload de l'ancien acte est obligatoire</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || !documentUrl || !formData.mairie_id}
                    className="flex-1"
                  >
                    {loading ? 'Soumission en cours...' : 'Soumettre la Demande'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DemandeExtraitPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Chargement...</div>}>
      <DemandeExtraitContent />
    </Suspense>
  )
}
