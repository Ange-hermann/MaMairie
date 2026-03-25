'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { 
  Building2, 
  Plus, 
  Search, 
  Edit, 
  Power,
  MapPin,
  Users,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function MairiesMinisterePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [mairies, setMairies] = useState<any[]>([])
  const [regions, setRegions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [selectedStatut, setSelectedStatut] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    nom: '',
    ville: '',
    region: '',
    departement: '',
    latitude: '',
    longitude: '',
    population_estimee: '',
    statut: 'active',
  })

  const [stats, setStats] = useState({
    total: 0,
    actives: 0,
    inactives: 0,
    suspendues: 0,
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

      // Récupérer les régions
      const { data: regionsData } = await supabase
        .from('regions')
        .select('*')
        .order('nom')

      setRegions(regionsData || [])

      // Récupérer toutes les mairies
      await fetchMairies()

    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMairies = async () => {
    try {
      const { data: mairiesData } = await supabase
        .from('mairies')
        .select('*')
        .order('nom_mairie')

      if (mairiesData) {
        // Enrichir avec statistiques
        const enrichedMairies = await Promise.all(
          mairiesData.map(async (mairie) => {
            const { data: agents } = await supabase
              .from('users')
              .select('id')
              .eq('mairie_id', mairie.id)
              .eq('role', 'agent')

            const { data: demandes } = await supabase
              .from('requests')
              .select('id, statut')
              .eq('mairie_id', mairie.id)

            return {
              ...mairie,
              nombre_agents: agents?.length || 0,
              total_demandes: demandes?.length || 0,
              demandes_en_attente: demandes?.filter(d => d.statut === 'en_attente').length || 0,
            }
          })
        )

        setMairies(enrichedMairies)

        // Calculer stats
        const statsData = {
          total: enrichedMairies.length,
          actives: enrichedMairies.filter(m => m.statut === 'active').length,
          inactives: enrichedMairies.filter(m => m.statut === 'inactive').length,
          suspendues: enrichedMairies.filter(m => m.statut === 'suspendue').length,
        }
        setStats(statsData)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingId) {
        // Modifier
        const { error } = await supabase
          .from('mairies')
          .update({
            nom_mairie: formData.nom,
            ville: formData.ville,
            region: formData.region,
            departement: formData.departement,
            latitude: formData.latitude ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            population_estimee: formData.population_estimee ? parseInt(formData.population_estimee) : null,
            statut: formData.statut,
          })
          .eq('id', editingId)

        if (error) throw error
        alert('✅ Mairie modifiée avec succès')
      } else {
        // Créer
        const { error } = await supabase
          .from('mairies')
          .insert([{
            nom_mairie: formData.nom,
            ville: formData.ville,
            region: formData.region,
            departement: formData.departement,
            latitude: formData.latitude ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            population_estimee: formData.population_estimee ? parseInt(formData.population_estimee) : null,
            statut: formData.statut,
            pays: 'Côte d\'Ivoire',
            code_mairie: `CI-${formData.ville.substring(0, 3).toUpperCase()}-${Date.now()}`,
          }])

        if (error) throw error
        alert('✅ Mairie créée avec succès')
      }

      resetForm()
      fetchMairies()
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('❌ Erreur : ' + error.message)
    }
  }

  const handleEdit = (mairie: any) => {
    setFormData({
      nom: mairie.nom_mairie || '',
      ville: mairie.ville || '',
      region: mairie.region || '',
      departement: mairie.departement || '',
      latitude: mairie.latitude?.toString() || '',
      longitude: mairie.longitude?.toString() || '',
      population_estimee: mairie.population_estimee?.toString() || '',
      statut: mairie.statut || 'active',
    })
    setEditingId(mairie.id)
    setShowForm(true)
  }

  const toggleStatut = async (mairieId: string, currentStatut: string) => {
    const newStatut = currentStatut === 'active' ? 'inactive' : 'active'
    
    if (!confirm(`Voulez-vous ${newStatut === 'active' ? 'activer' : 'désactiver'} cette mairie ?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('mairies')
        .update({ statut: newStatut })
        .eq('id', mairieId)

      if (error) throw error
      
      alert(`✅ Mairie ${newStatut === 'active' ? 'activée' : 'désactivée'}`)
      fetchMairies()
    } catch (error: any) {
      alert('❌ Erreur : ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      nom: '',
      ville: '',
      region: '',
      departement: '',
      latitude: '',
      longitude: '',
      population_estimee: '',
      statut: 'active',
    })
    setEditingId(null)
    setShowForm(false)
  }

  const filteredMairies = mairies.filter(mairie => {
    const matchSearch = mairie.nom_mairie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       mairie.ville?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchRegion = selectedRegion === 'all' || mairie.region === selectedRegion
    const matchStatut = selectedStatut === 'all' || mairie.statut === selectedStatut
    
    return matchSearch && matchRegion && matchStatut
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
          <div className="mb-4 md:mb-6 flex items-center justify-between animate-fadeIn">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-2 flex items-center gap-3">
                <Building2 className="text-primary-500" size={36} />
                Toutes les Mairies
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Gestion et supervision de toutes les mairies de Côte d'Ivoire
              </p>
            </div>
            
            <Button
              onClick={() => setShowForm(true)}
              className="btn-ripple hover-glow"
            >
              <Plus size={20} className="mr-2" />
              Ajouter une Mairie
            </Button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Mairies</p>
                  <p className="text-4xl font-bold mt-2">{stats.total}</p>
                </div>
                <Building2 size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Actives</p>
                  <p className="text-4xl font-bold mt-2">{stats.actives}</p>
                </div>
                <CheckCircle size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Inactives</p>
                  <p className="text-4xl font-bold mt-2">{stats.inactives}</p>
                </div>
                <X size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Suspendues</p>
                  <p className="text-4xl font-bold mt-2">{stats.suspendues}</p>
                </div>
                <AlertCircle size={48} className="opacity-20" />
              </div>
            </Card>
          </div>

          {/* Filtres */}
          <Card className="mb-6 animate-scaleIn">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Rechercher une mairie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                label=""
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                options={[
                  { value: 'all', label: 'Toutes les régions' },
                  ...regions.map(r => ({ value: r.nom, label: r.nom }))
                ]}
              />

              <Select
                label=""
                value={selectedStatut}
                onChange={(e) => setSelectedStatut(e.target.value)}
                options={[
                  { value: 'all', label: 'Tous les statuts' },
                  { value: 'active', label: 'Actives' },
                  { value: 'inactive', label: 'Inactives' },
                  { value: 'suspendue', label: 'Suspendues' },
                ]}
              />
            </div>
          </Card>

          {/* Tableau des Mairies */}
          <Card className="animate-fadeIn">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-700">Mairie</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Région</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Agents</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Demandes</th>
                    <th className="text-center p-3 font-semibold text-gray-700">En Attente</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Population</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Statut</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMairies.map((mairie) => (
                    <tr key={mairie.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          <div>
                            <p className="font-medium">{mairie.nom_mairie}</p>
                            <p className="text-sm text-gray-500">{mairie.ville}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">{mairie.region || 'N/A'}</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm font-semibold">
                          <Users size={14} />
                          {mairie.nombre_agents}
                        </span>
                      </td>
                      <td className="p-3 text-center font-semibold">{mairie.total_demandes}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          mairie.demandes_en_attente > 10 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {mairie.demandes_en_attente}
                        </span>
                      </td>
                      <td className="p-3 text-center text-gray-600">
                        {mairie.population_estimee?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          mairie.statut === 'active' 
                            ? 'bg-green-100 text-green-600' 
                            : mairie.statut === 'suspendue'
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {mairie.statut || 'active'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(mairie)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Modifier"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => toggleStatut(mairie.id, mairie.statut || 'active')}
                            className={`p-1 rounded ${
                              mairie.statut === 'active'
                                ? 'text-gray-600 hover:bg-gray-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={mairie.statut === 'active' ? 'Désactiver' : 'Activer'}
                          >
                            <Power size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredMairies.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Building2 size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Aucune mairie trouvée</p>
                </div>
              )}
            </div>
          </Card>

          {/* Modal Formulaire */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
              <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingId ? 'Modifier la Mairie' : 'Nouvelle Mairie'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                    <Input
                      label="Nom de la Mairie"
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({...formData, nom: e.target.value})}
                      placeholder="Ex: Mairie de Cocody"
                    />

                    <Input
                      label="Ville"
                      type="text"
                      required
                      value={formData.ville}
                      onChange={(e) => setFormData({...formData, ville: e.target.value})}
                      placeholder="Ex: Abidjan"
                    />

                    <Select
                      label="Région"
                      required
                      value={formData.region}
                      onChange={(e) => setFormData({...formData, region: e.target.value})}
                      options={[
                        { value: '', label: 'Sélectionner une région' },
                        ...regions.map(r => ({ value: r.nom, label: r.nom }))
                      ]}
                    />

                    <Input
                      label="Département"
                      type="text"
                      value={formData.departement}
                      onChange={(e) => setFormData({...formData, departement: e.target.value})}
                      placeholder="Ex: Abidjan"
                    />

                    <Input
                      label="Latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                      placeholder="5.3599517"
                    />

                    <Input
                      label="Longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                      placeholder="-4.0082563"
                    />

                    <Input
                      label="Population Estimée"
                      type="number"
                      value={formData.population_estimee}
                      onChange={(e) => setFormData({...formData, population_estimee: e.target.value})}
                      placeholder="500000"
                    />

                    <Select
                      label="Statut"
                      required
                      value={formData.statut}
                      onChange={(e) => setFormData({...formData, statut: e.target.value})}
                      options={[
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' },
                        { value: 'suspendue', label: 'Suspendue' },
                      ]}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1 btn-ripple">
                      {editingId ? 'Modifier' : 'Créer'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="flex-1"
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
