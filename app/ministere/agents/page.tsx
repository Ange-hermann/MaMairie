'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Ban,
  CheckCircle,
  Building2,
  FileText,
  Award,
  X,
  Mail,
  Phone,
  MapPin,
  Shield
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function AgentsMinisterePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [agents, setAgents] = useState<any[]>([])
  const [mairies, setMairies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMairie, setSelectedMairie] = useState('all')
  const [selectedStatut, setSelectedStatut] = useState('all')
  const [showDetails, setShowDetails] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<any>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    telephone: '',
    mairie_id: '',
  })

  const [stats, setStats] = useState({
    total: 0,
    actifs: 0,
    bloques: 0,
    nouveaux: 0,
  })

  useEffect(() => {
    fetchData()
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

      if (profile && profile.role !== 'ministere') {
        router.push('/dashboard-citoyen')
        return
      }

      setUserData(profile)

      // Récupérer les mairies
      const { data: mairiesData } = await supabase
        .from('mairies')
        .select('id, nom_mairie, ville, region')
        .order('nom_mairie')

      setMairies(mairiesData || [])

      // Récupérer tous les agents
      await fetchAgents()

    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAgents = async () => {
    try {
      const { data: agentsData } = await supabase
        .from('users')
        .select(`
          *,
          mairies (
            id,
            nom_mairie,
            ville,
            region
          )
        `)
        .eq('role', 'agent')
        .order('created_at', { ascending: false })

      if (agentsData) {
        // Enrichir avec statistiques
        const enrichedAgents = await Promise.all(
          agentsData.map(async (agent) => {
            // Compter les naissances enregistrées
            const { data: naissances } = await supabase
              .from('naissances')
              .select('id')
              .eq('created_by', agent.id)

            // Compter les demandes traitées
            const { data: demandes } = await supabase
              .from('requests')
              .select('id')
              .eq('traite_par', agent.id)

            return {
              ...agent,
              naissances_count: naissances?.length || 0,
              demandes_count: demandes?.length || 0,
              statut: agent.statut || 'actif',
            }
          })
        )

        setAgents(enrichedAgents)

        // Calculer stats
        const now = new Date()
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

        const statsData = {
          total: enrichedAgents.length,
          actifs: enrichedAgents.filter(a => a.statut !== 'bloque').length,
          bloques: enrichedAgents.filter(a => a.statut === 'bloque').length,
          nouveaux: enrichedAgents.filter(a => new Date(a.created_at) > lastMonth).length,
        }
        setStats(statsData)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const createAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      // 1. Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: undefined, // Pas de redirection
        }
      })

      if (authError) {
        if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
          throw new Error('Cet email est déjà utilisé. Veuillez utiliser un autre email.')
        }
        throw authError
      }
      if (!authData.user) throw new Error('Utilisateur non créé')

      // 2. Créer le profil dans public.users
      console.log('📝 Création du profil pour:', authData.user.id, formData.email)
      
      const profileData = {
        id: authData.user.id,
        email: formData.email,
        role: 'agent',
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
        mairie_id: formData.mairie_id || null,
        statut: 'actif',
      }
      
      console.log('📋 Données du profil:', profileData)
      
      const { data: insertedData, error: profileError } = await supabase
        .from('users')
        .insert([profileData])
        .select()

      console.log('✅ Résultat insertion:', { insertedData, profileError })

      if (profileError) {
        console.error('❌ Erreur profil:', profileError)
        throw new Error(`Erreur création profil: ${profileError.message} (Code: ${profileError.code})`)
      }

      if (!insertedData || insertedData.length === 0) {
        throw new Error('Le profil n\'a pas été créé (aucune donnée retournée)')
      }

      console.log('🎉 Profil créé avec succès:', insertedData[0])
      alert('✅ Agent créé avec succès !')
      
      // Réinitialiser le formulaire
      setFormData({
        email: '',
        password: '',
        nom: '',
        prenom: '',
        telephone: '',
        mairie_id: '',
      })
      setShowCreateForm(false)
      
      // Recharger la liste
      fetchAgents()
    } catch (error: any) {
      console.error('Erreur:', error)
      
      // Messages d'erreur personnalisés
      let errorMessage = error.message
      
      if (error.message.includes('already registered')) {
        errorMessage = '❌ Cet email est déjà utilisé. Veuillez utiliser un autre email.'
      } else if (error.message.includes('Invalid email')) {
        errorMessage = '❌ Format d\'email invalide.'
      } else if (error.message.includes('Password')) {
        errorMessage = '❌ Le mot de passe doit contenir au moins 6 caractères.'
      }
      
      alert(errorMessage)
    } finally {
      setCreating(false)
    }
  }

  const toggleStatut = async (agentId: string, currentStatut: string) => {
    const newStatut = currentStatut === 'bloque' ? 'actif' : 'bloque'
    
    if (!confirm(`Voulez-vous ${newStatut === 'bloque' ? 'bloquer' : 'débloquer'} cet agent ?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ statut: newStatut })
        .eq('id', agentId)

      if (error) throw error
      
      alert(`✅ Agent ${newStatut === 'bloque' ? 'bloqué' : 'débloqué'}`)
      fetchAgents()
    } catch (error: any) {
      alert('❌ Erreur : ' + error.message)
    }
  }

  const viewDetails = (agent: any) => {
    setSelectedAgent(agent)
    setShowDetails(true)
  }

  const filteredAgents = agents.filter(agent => {
    const matchSearch = 
      agent.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchMairie = selectedMairie === 'all' || agent.mairie_id === selectedMairie
    const matchStatut = selectedStatut === 'all' || agent.statut === selectedStatut
    
    return matchSearch && matchMairie && matchStatut
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="ministere" />
      
      <div className="flex-1 w-full lg:w-auto">
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Ministère'}
          userRole="ministere"
          avatarUrl={userData?.avatar_url}
        />
        
        <main className="p-4 md:p-6">
          {/* En-tête */}
          <div className="mb-4 md:mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-fadeIn">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-2 flex items-center gap-2 md:gap-3">
                <Users className="text-primary-500" size={28} />
                Agents Municipaux
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Gestion de tous les agents des mairies de Côte d'Ivoire
              </p>
            </div>
            
            <Button
              onClick={() => setShowCreateForm(true)}
              className="btn-ripple hover-glow"
            >
              <Plus size={20} className="mr-2" />
              Créer un Agent
            </Button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Agents</p>
                  <p className="text-4xl font-bold mt-2">{stats.total}</p>
                </div>
                <Users size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Actifs</p>
                  <p className="text-4xl font-bold mt-2">{stats.actifs}</p>
                </div>
                <CheckCircle size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Bloqués</p>
                  <p className="text-4xl font-bold mt-2">{stats.bloques}</p>
                </div>
                <Ban size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Nouveaux (30j)</p>
                  <p className="text-4xl font-bold mt-2">{stats.nouveaux}</p>
                </div>
                <Award size={48} className="opacity-20" />
              </div>
            </Card>
          </div>

          {/* Filtres */}
          <Card className="mb-6 animate-scaleIn">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Rechercher un agent..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                label=""
                value={selectedMairie}
                onChange={(e) => setSelectedMairie(e.target.value)}
                options={[
                  { value: 'all', label: 'Toutes les mairies' },
                  ...mairies.map(m => ({ value: m.id, label: `${m.nom} - ${m.ville}` }))
                ]}
              />

              <Select
                label=""
                value={selectedStatut}
                onChange={(e) => setSelectedStatut(e.target.value)}
                options={[
                  { value: 'all', label: 'Tous les statuts' },
                  { value: 'actif', label: 'Actifs' },
                  { value: 'bloque', label: 'Bloqués' },
                ]}
              />
            </div>
          </Card>

          {/* Tableau des Agents */}
          <Card className="animate-fadeIn">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-700">Agent</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Mairie</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Contact</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Naissances</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Demandes</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Inscription</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Statut</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map((agent) => (
                    <tr key={agent.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                            {agent.prenom?.[0]}{agent.nom?.[0]}
                          </div>
                          <div>
                            <p className="font-medium">{agent.prenom} {agent.nom}</p>
                            <p className="text-sm text-gray-500">{agent.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        {agent.mairies ? (
                          <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-gray-400" />
                            <div>
                              <p className="font-medium text-sm">{agent.mairies.nom_mairie}</p>
                              <p className="text-xs text-gray-500">{agent.mairies.region}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Non assigné</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col items-center gap-1">
                          {agent.telephone && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Phone size={12} />
                              {agent.telephone}
                            </div>
                          )}
                          {agent.email && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Mail size={12} />
                              {agent.email.substring(0, 20)}...
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-600 rounded text-sm font-semibold">
                          {agent.naissances_count}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm font-semibold">
                          {agent.demandes_count}
                        </span>
                      </td>
                      <td className="p-3 text-center text-sm text-gray-600">
                        {new Date(agent.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          agent.statut === 'bloque' 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {agent.statut === 'bloque' ? 'Bloqué' : 'Actif'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => viewDetails(agent)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Voir détails"
                          >
                            <FileText size={18} />
                          </button>
                          <button
                            onClick={() => toggleStatut(agent.id, agent.statut)}
                            className={`p-1 rounded ${
                              agent.statut === 'bloque'
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                            title={agent.statut === 'bloque' ? 'Débloquer' : 'Bloquer'}
                          >
                            {agent.statut === 'bloque' ? <CheckCircle size={18} /> : <Ban size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAgents.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Aucun agent trouvé</p>
                </div>
              )}
            </div>
          </Card>

          {/* Modal Détails Agent */}
          {showDetails && selectedAgent && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
              <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Shield className="text-primary-500" />
                    Détails de l'Agent
                  </h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Informations Personnelles */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Users size={20} className="text-primary-500" />
                      Informations Personnelles
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Nom complet</p>
                        <p className="font-semibold">{selectedAgent.prenom} {selectedAgent.nom}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold">{selectedAgent.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Téléphone</p>
                        <p className="font-semibold">{selectedAgent.telephone || 'Non renseigné'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date d'inscription</p>
                        <p className="font-semibold">
                          {new Date(selectedAgent.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Affectation */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Building2 size={20} className="text-primary-500" />
                      Affectation
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {selectedAgent.mairies ? (
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-600">Mairie</p>
                            <p className="font-semibold text-lg">{selectedAgent.mairies.nom_mairie}</p>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Ville</p>
                              <p className="font-semibold">{selectedAgent.mairies.ville}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Région</p>
                              <p className="font-semibold">{selectedAgent.mairies.region}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">Non assigné à une mairie</p>
                      )}
                    </div>
                  </div>

                  {/* Statistiques de Performance */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Award size={20} className="text-primary-500" />
                      Performance
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm opacity-90">Naissances Enregistrées</p>
                            <p className="text-3xl font-bold mt-1">{selectedAgent.naissances_count}</p>
                          </div>
                          <FileText size={40} className="opacity-20" />
                        </div>
                      </Card>

                      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm opacity-90">Demandes Traitées</p>
                            <p className="text-3xl font-bold mt-1">{selectedAgent.demandes_count}</p>
                          </div>
                          <CheckCircle size={40} className="opacity-20" />
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Statut */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Statut du Compte</h3>
                    <div className={`p-4 rounded-lg ${
                      selectedAgent.statut === 'bloque' 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-green-50 border border-green-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {selectedAgent.statut === 'bloque' ? (
                            <Ban className="text-red-600" size={24} />
                          ) : (
                            <CheckCircle className="text-green-600" size={24} />
                          )}
                          <div>
                            <p className="font-semibold">
                              {selectedAgent.statut === 'bloque' ? 'Compte Bloqué' : 'Compte Actif'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {selectedAgent.statut === 'bloque' 
                                ? 'Cet agent ne peut plus accéder au système' 
                                : 'Cet agent peut accéder normalement au système'}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            toggleStatut(selectedAgent.id, selectedAgent.statut)
                            setShowDetails(false)
                          }}
                          variant={selectedAgent.statut === 'bloque' ? 'primary' : 'outline'}
                        >
                          {selectedAgent.statut === 'bloque' ? 'Débloquer' : 'Bloquer'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Modal Création Agent */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
              <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Plus className="text-primary-500" />
                    Créer un Nouvel Agent
                  </h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={createAgent} className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note :</strong> Un compte sera créé automatiquement dans Supabase Auth avec les informations fournies.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Prénom"
                      type="text"
                      required
                      value={formData.prenom}
                      onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                      placeholder="Ex: Jean"
                    />

                    <Input
                      label="Nom"
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({...formData, nom: e.target.value})}
                      placeholder="Ex: Kouassi"
                    />

                    <Input
                      label="Email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="agent@mairie.ci"
                      className="md:col-span-2"
                    />

                    <Input
                      label="Mot de passe"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Minimum 6 caractères"
                      className="md:col-span-2"
                    />

                    <Input
                      label="Téléphone"
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                      placeholder="+225 XX XX XX XX XX"
                    />

                    <Select
                      label="Mairie d'affectation"
                      value={formData.mairie_id}
                      onChange={(e) => setFormData({...formData, mairie_id: e.target.value})}
                      options={[
                        { value: '', label: 'Aucune (à assigner plus tard)' },
                        ...mairies.map(m => ({ 
                          value: m.id, 
                          label: `${m.nom_mairie} - ${m.ville}` 
                        }))
                      ]}
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>⚠️ Important :</strong> L'agent recevra un email de confirmation. Assurez-vous que l'adresse email est correcte.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      className="flex-1 btn-ripple"
                      disabled={creating}
                    >
                      {creating ? (
                        <>
                          <div className="spinner mr-2" style={{width: 16, height: 16}}></div>
                          Création en cours...
                        </>
                      ) : (
                        <>
                          <Plus size={20} className="mr-2" />
                          Créer l'Agent
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1"
                      disabled={creating}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
