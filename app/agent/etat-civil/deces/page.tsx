'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Cross, Plus, Search, Edit, Trash2, FileText } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function DecesPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [deces, setDeces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState({
    nom_defunt: '',
    prenom_defunt: '',
    date_deces: '',
    heure_deces: '',
    lieu_deces: '',
    cause_deces: '',
    nom_declarant: '',
    prenom_declarant: '',
    relation_declarant: '',
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
        
        const { data: decesData, error } = await supabase
          .from('deces')
          .select('*')
          .eq('mairie_id', profile.mairie_id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erreur:', error)
        } else {
          setDeces(decesData || [])
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
          .from('deces')
          .update(dataToSave)
          .eq('id', editingId)

        if (error) throw error
        alert('✅ Décès modifié avec succès!')
      } else {
        const { error } = await supabase
          .from('deces')
          .insert([dataToSave])

        if (error) throw error
        alert('✅ Décès enregistré avec succès!')
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

  const handleEdit = (dece: any) => {
    setFormData({
      nom_defunt: dece.nom_defunt,
      prenom_defunt: dece.prenom_defunt,
      date_deces: dece.date_deces,
      heure_deces: dece.heure_deces || '',
      lieu_deces: dece.lieu_deces,
      cause_deces: dece.cause_deces || '',
      nom_declarant: dece.nom_declarant || '',
      prenom_declarant: dece.prenom_declarant || '',
      relation_declarant: dece.relation_declarant || '',
      numero_acte: dece.numero_acte,
      annee: dece.annee.toString(),
    })
    setEditingId(dece.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce décès ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('deces')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      alert('✅ Décès supprimé')
      fetchData()
    } catch (error: any) {
      alert('❌ Erreur : ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      nom_defunt: '',
      prenom_defunt: '',
      date_deces: '',
      heure_deces: '',
      lieu_deces: '',
      cause_deces: '',
      nom_declarant: '',
      prenom_declarant: '',
      relation_declarant: '',
      numero_acte: '',
      annee: new Date().getFullYear().toString(),
    })
    setEditingId(null)
    setShowForm(false)
  }

  const filteredDeces = deces.filter(d =>
    d.nom_defunt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.prenom_defunt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.numero_acte.toLowerCase().includes(searchTerm.toLowerCase())
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
                <Cross className="text-gray-600" size={36} />
                Gestion des Décès
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Enregistrement et gestion des actes de décès
              </p>
            </div>
            
            <Button
              variant="primary"
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2"
            >
              <Plus size={20} />
              {showForm ? 'Annuler' : 'Nouveau Décès'}
            </Button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-6">
            <Card className="bg-gradient-to-br from-gray-600 to-gray-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Décès</p>
                  <p className="text-4xl font-bold mt-2">{deces.length}</p>
                </div>
                <Cross size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-slate-600 to-slate-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Cette Année</p>
                  <p className="text-4xl font-bold mt-2">
                    {deces.filter(d => d.annee === new Date().getFullYear()).length}
                  </p>
                </div>
                <Cross size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-zinc-600 to-zinc-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Ce Mois</p>
                  <p className="text-4xl font-bold mt-2">
                    {deces.filter(d => {
                      const date = new Date(d.date_deces)
                      const now = new Date()
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                    }).length}
                  </p>
                </div>
                <Cross size={48} className="opacity-20" />
              </div>
            </Card>
          </div>

          {/* Formulaire */}
          {showForm && (
            <Card className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingId ? 'Modifier le Décès' : 'Nouveau Décès'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations Défunt */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Informations du Défunt</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Nom du défunt"
                      value={formData.nom_defunt}
                      onChange={(e) => setFormData({ ...formData, nom_defunt: e.target.value })}
                      required
                    />
                    <Input
                      label="Prénom(s) du défunt"
                      value={formData.prenom_defunt}
                      onChange={(e) => setFormData({ ...formData, prenom_defunt: e.target.value })}
                      required
                    />
                    <Input
                      label="Date du décès"
                      type="date"
                      value={formData.date_deces}
                      onChange={(e) => setFormData({ ...formData, date_deces: e.target.value })}
                      required
                    />
                    <Input
                      label="Heure du décès"
                      type="time"
                      value={formData.heure_deces}
                      onChange={(e) => setFormData({ ...formData, heure_deces: e.target.value })}
                    />
                    <Input
                      label="Lieu du décès"
                      value={formData.lieu_deces}
                      onChange={(e) => setFormData({ ...formData, lieu_deces: e.target.value })}
                      required
                    />
                    <Input
                      label="Cause du décès (optionnel)"
                      value={formData.cause_deces}
                      onChange={(e) => setFormData({ ...formData, cause_deces: e.target.value })}
                    />
                  </div>
                </div>

                {/* Informations Déclarant */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Informations du Déclarant</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Input
                      label="Nom du déclarant"
                      value={formData.nom_declarant}
                      onChange={(e) => setFormData({ ...formData, nom_declarant: e.target.value })}
                    />
                    <Input
                      label="Prénom du déclarant"
                      value={formData.prenom_declarant}
                      onChange={(e) => setFormData({ ...formData, prenom_declarant: e.target.value })}
                    />
                    <Input
                      label="Relation avec le défunt"
                      value={formData.relation_declarant}
                      onChange={(e) => setFormData({ ...formData, relation_declarant: e.target.value })}
                      placeholder="Ex: Fils, Épouse, Frère..."
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

          {/* Liste des décès */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                Liste des Décès ({filteredDeces.length})
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom & Prénom</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lieu</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Déclarant</th>
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
                  ) : filteredDeces.length > 0 ? (
                    filteredDeces.map((dece) => (
                      <tr key={dece.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {dece.numero_acte}/{dece.annee}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {dece.prenom_defunt} {dece.nom_defunt}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(dece.date_deces).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {dece.lieu_deces}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {dece.prenom_declarant} {dece.nom_declarant}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(dece)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Modifier"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(dece.id)}
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
                        <Cross size={48} className="mx-auto mb-3 opacity-30" />
                        <p>Aucun décès enregistré</p>
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
