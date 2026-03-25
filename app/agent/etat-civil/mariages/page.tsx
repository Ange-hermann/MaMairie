'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Heart, Plus, Search, Edit, Trash2, FileText } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function MariagesPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [mariages, setMariages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState({
    nom_epoux: '',
    prenom_epoux: '',
    date_naissance_epoux: '',
    lieu_naissance_epoux: '',
    nom_epouse: '',
    prenom_epouse: '',
    date_naissance_epouse: '',
    lieu_naissance_epouse: '',
    date_mariage: '',
    lieu_mariage: '',
    numero_acte: '',
    annee: new Date().getFullYear().toString(),
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

      if (profile) {
        setUserData(profile)
        
        const { data: mariagesData, error } = await supabase
          .from('mariages')
          .select('*')
          .eq('mairie_id', profile.mairie_id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erreur:', error)
        } else {
          setMariages(mariagesData || [])
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !userData) {
        throw new Error('Utilisateur non connecté')
      }

      const dataToSave = {
        ...formData,
        mairie_id: userData.mairie_id,
        agent_id: user.id,
        annee: parseInt(formData.annee),
      }

      if (editingId) {
        const { error } = await supabase
          .from('mariages')
          .update(dataToSave)
          .eq('id', editingId)

        if (error) throw error
        alert('✅ Mariage modifié avec succès!')
      } else {
        const { error } = await supabase
          .from('mariages')
          .insert([dataToSave])

        if (error) throw error
        alert('✅ Mariage enregistré avec succès!')
      }

      resetForm()
      fetchData()
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('❌ Erreur : ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (mariage: any) => {
    setFormData({
      nom_epoux: mariage.nom_epoux,
      prenom_epoux: mariage.prenom_epoux,
      date_naissance_epoux: mariage.date_naissance_epoux || '',
      lieu_naissance_epoux: mariage.lieu_naissance_epoux || '',
      nom_epouse: mariage.nom_epouse,
      prenom_epouse: mariage.prenom_epouse,
      date_naissance_epouse: mariage.date_naissance_epouse || '',
      lieu_naissance_epouse: mariage.lieu_naissance_epouse || '',
      date_mariage: mariage.date_mariage,
      lieu_mariage: mariage.lieu_mariage,
      numero_acte: mariage.numero_acte,
      annee: mariage.annee.toString(),
    })
    setEditingId(mariage.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce mariage ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('mariages')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      alert('✅ Mariage supprimé')
      fetchData()
    } catch (error: any) {
      alert('❌ Erreur : ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      nom_epoux: '',
      prenom_epoux: '',
      date_naissance_epoux: '',
      lieu_naissance_epoux: '',
      nom_epouse: '',
      prenom_epouse: '',
      date_naissance_epouse: '',
      lieu_naissance_epouse: '',
      date_mariage: '',
      lieu_mariage: '',
      numero_acte: '',
      annee: new Date().getFullYear().toString(),
    })
    setEditingId(null)
    setShowForm(false)
  }

  const filteredMariages = mariages.filter(m =>
    m.nom_epoux.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.nom_epouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.numero_acte.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="agent" />
      
      <div className="flex-1 w-full lg:w-auto">
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Chargement...'}
          userRole="agent" 
        />
        
        <main className="p-4 md:p-6">
          <div className="mb-4 md:mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2 md:gap-3">
                <Heart className="text-pink-500" size={36} />
                Gestion des Mariages
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Enregistrement et gestion des actes de mariage
              </p>
            </div>
            
            <Button
              variant="primary"
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2"
            >
              <Plus size={20} />
              {showForm ? 'Annuler' : 'Nouveau Mariage'}
            </Button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-6">
            <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Mariages</p>
                  <p className="text-4xl font-bold mt-2">{mariages.length}</p>
                </div>
                <Heart size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Cette Année</p>
                  <p className="text-4xl font-bold mt-2">
                    {mariages.filter(m => m.annee === new Date().getFullYear()).length}
                  </p>
                </div>
                <Heart size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Ce Mois</p>
                  <p className="text-4xl font-bold mt-2">
                    {mariages.filter(m => {
                      const date = new Date(m.date_mariage)
                      const now = new Date()
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                    }).length}
                  </p>
                </div>
                <Heart size={48} className="opacity-20" />
              </div>
            </Card>
          </div>

          {/* Formulaire */}
          {showForm && (
            <Card className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingId ? 'Modifier le Mariage' : 'Nouveau Mariage'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations Époux */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Informations de l'Époux</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Nom de l'époux"
                      value={formData.nom_epoux}
                      onChange={(e) => setFormData({ ...formData, nom_epoux: e.target.value })}
                      required
                    />
                    <Input
                      label="Prénom(s) de l'époux"
                      value={formData.prenom_epoux}
                      onChange={(e) => setFormData({ ...formData, prenom_epoux: e.target.value })}
                      required
                    />
                    <Input
                      label="Date de naissance"
                      type="date"
                      value={formData.date_naissance_epoux}
                      onChange={(e) => setFormData({ ...formData, date_naissance_epoux: e.target.value })}
                    />
                    <Input
                      label="Lieu de naissance"
                      value={formData.lieu_naissance_epoux}
                      onChange={(e) => setFormData({ ...formData, lieu_naissance_epoux: e.target.value })}
                    />
                  </div>
                </div>

                {/* Informations Épouse */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Informations de l'Épouse</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Nom de l'épouse"
                      value={formData.nom_epouse}
                      onChange={(e) => setFormData({ ...formData, nom_epouse: e.target.value })}
                      required
                    />
                    <Input
                      label="Prénom(s) de l'épouse"
                      value={formData.prenom_epouse}
                      onChange={(e) => setFormData({ ...formData, prenom_epouse: e.target.value })}
                      required
                    />
                    <Input
                      label="Date de naissance"
                      type="date"
                      value={formData.date_naissance_epouse}
                      onChange={(e) => setFormData({ ...formData, date_naissance_epouse: e.target.value })}
                    />
                    <Input
                      label="Lieu de naissance"
                      value={formData.lieu_naissance_epouse}
                      onChange={(e) => setFormData({ ...formData, lieu_naissance_epouse: e.target.value })}
                    />
                  </div>
                </div>

                {/* Informations Mariage */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Informations du Mariage</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Date du mariage"
                      type="date"
                      value={formData.date_mariage}
                      onChange={(e) => setFormData({ ...formData, date_mariage: e.target.value })}
                      required
                    />
                    <Input
                      label="Lieu du mariage"
                      value={formData.lieu_mariage}
                      onChange={(e) => setFormData({ ...formData, lieu_mariage: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Informations administratives */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Informations administratives</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Numéro d'acte"
                      value={formData.numero_acte}
                      onChange={(e) => setFormData({ ...formData, numero_acte: e.target.value })}
                      required
                    />
                    <Input
                      label="Année"
                      type="number"
                      value={formData.annee}
                      onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Enregistrement...' : editingId ? 'Modifier' : 'Enregistrer'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Liste des mariages */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                Liste des Mariages ({filteredMariages.length})
              </h2>
              
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Acte</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Époux</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Épouse</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lieu</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        Chargement...
                      </td>
                    </tr>
                  ) : filteredMariages.length > 0 ? (
                    filteredMariages.map((mariage) => (
                      <tr key={mariage.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {mariage.numero_acte}/{mariage.annee}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {mariage.prenom_epoux} {mariage.nom_epoux}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {mariage.prenom_epouse} {mariage.nom_epouse}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(mariage.date_mariage).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {mariage.lieu_mariage}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(mariage)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Modifier"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(mariage.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Supprimer"
                            >
                              <Trash2 size={18} />
                            </button>
                            <button
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Générer PDF"
                            >
                              <FileText size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        <Heart size={48} className="mx-auto mb-3 opacity-30" />
                        <p>Aucun mariage enregistré</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
