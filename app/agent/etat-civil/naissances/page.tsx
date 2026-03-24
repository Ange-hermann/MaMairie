'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Baby, Plus, Search, Edit, Trash2, FileText, Download } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { generateActeNaissance, downloadPDF } from '@/lib/pdfGenerator'

export default function NaissancesPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [mairieData, setMairieData] = useState<any>(null)
  const [naissances, setNaissances] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState({
    nom_enfant: '',
    prenom_enfant: '',
    date_naissance: '',
    heure_naissance: '',
    lieu_naissance: '',
    sexe: '',
    nom_pere: '',
    prenom_pere: '',
    nom_mere: '',
    prenom_mere: '',
    numero_registre: '',
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

      // Récupérer le profil
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUserData(profile)
        
        // Récupérer les infos de la mairie
        const { data: mairie } = await supabase
          .from('mairies')
          .select('*')
          .eq('id', profile.mairie_id)
          .single()
        
        setMairieData(mairie)
        
        // Récupérer les naissances de la mairie
        const { data: naissancesData, error } = await supabase
          .from('naissances')
          .select('*')
          .eq('mairie_id', profile.mairie_id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erreur:', error)
        } else {
          setNaissances(naissancesData || [])
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
        // Modification
        const { error } = await supabase
          .from('naissances')
          .update(dataToSave)
          .eq('id', editingId)

        if (error) throw error
        alert('✅ Naissance modifiée avec succès!')
      } else {
        // Création
        const { error } = await supabase
          .from('naissances')
          .insert([dataToSave])

        if (error) throw error
        alert('✅ Naissance enregistrée avec succès!')
      }

      // Réinitialiser le formulaire
      resetForm()
      fetchData()
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('❌ Erreur : ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (naissance: any) => {
    setFormData({
      nom_enfant: naissance.nom_enfant,
      prenom_enfant: naissance.prenom_enfant,
      date_naissance: naissance.date_naissance,
      heure_naissance: naissance.heure_naissance || '',
      lieu_naissance: naissance.lieu_naissance,
      sexe: naissance.sexe,
      nom_pere: naissance.nom_pere || '',
      prenom_pere: naissance.prenom_pere || '',
      nom_mere: naissance.nom_mere || '',
      prenom_mere: naissance.prenom_mere || '',
      numero_registre: naissance.numero_registre || '',
      numero_acte: naissance.numero_acte,
      annee: naissance.annee.toString(),
    })
    setEditingId(naissance.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette naissance ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('naissances')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      alert('✅ Naissance supprimée')
      fetchData()
    } catch (error: any) {
      alert('❌ Erreur : ' + error.message)
    }
  }

  const handleGeneratePDF = async (naissanceId: string) => {
    setGenerating(true)
    try {
      const naissance = naissances.find(n => n.id === naissanceId)
      
      if (!naissance || !mairieData || !userData) {
        throw new Error('Données manquantes')
      }
      
      const pdfBlob = await generateActeNaissance(
        naissance,
        mairieData,
        `${userData.prenom} ${userData.nom}`
      )
      
      const filename = `Acte_Naissance_${naissance.nom_enfant}_${naissance.numero_acte}.pdf`
      downloadPDF(pdfBlob, filename)
      
      alert('✅ PDF généré avec succès !')
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('❌ Erreur : ' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nom_enfant: '',
      prenom_enfant: '',
      date_naissance: '',
      heure_naissance: '',
      lieu_naissance: '',
      sexe: '',
      nom_pere: '',
      prenom_pere: '',
      nom_mere: '',
      prenom_mere: '',
      numero_registre: '',
      numero_acte: '',
      annee: new Date().getFullYear().toString(),
    })
    setEditingId(null)
    setShowForm(false)
  }

  const filteredNaissances = naissances.filter(n =>
    n.nom_enfant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.prenom_enfant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.numero_acte.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="agent" />
      
      <div className="flex-1">
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Chargement...'}
          userRole="agent" 
        />
        
        <main className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <Baby className="text-primary-500" size={36} />
                Gestion des Naissances
              </h1>
              <p className="text-gray-600">
                Enregistrement et gestion des actes de naissance
              </p>
            </div>
            
            <Button
              variant="primary"
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2"
            >
              <Plus size={20} />
              {showForm ? 'Annuler' : 'Nouvelle Naissance'}
            </Button>
          </div>

          {/* Statistiques */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Naissances</p>
                  <p className="text-4xl font-bold mt-2">{naissances.length}</p>
                </div>
                <Baby size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Filles</p>
                  <p className="text-4xl font-bold mt-2">
                    {naissances.filter(n => n.sexe === 'Féminin').length}
                  </p>
                </div>
                <Baby size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Garçons</p>
                  <p className="text-4xl font-bold mt-2">
                    {naissances.filter(n => n.sexe === 'Masculin').length}
                  </p>
                </div>
                <Baby size={48} className="opacity-20" />
              </div>
            </Card>
          </div>

          {/* Formulaire */}
          {showForm && (
            <Card className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingId ? 'Modifier la Naissance' : 'Nouvelle Naissance'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations enfant */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Informations de l'enfant</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Nom de l'enfant"
                      value={formData.nom_enfant}
                      onChange={(e) => setFormData({ ...formData, nom_enfant: e.target.value })}
                      required
                    />
                    <Input
                      label="Prénom(s)"
                      value={formData.prenom_enfant}
                      onChange={(e) => setFormData({ ...formData, prenom_enfant: e.target.value })}
                      required
                    />
                    <Input
                      label="Date de naissance"
                      type="date"
                      value={formData.date_naissance}
                      onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                      required
                    />
                    <Input
                      label="Heure de naissance"
                      type="time"
                      value={formData.heure_naissance}
                      onChange={(e) => setFormData({ ...formData, heure_naissance: e.target.value })}
                    />
                    <Input
                      label="Lieu de naissance"
                      value={formData.lieu_naissance}
                      onChange={(e) => setFormData({ ...formData, lieu_naissance: e.target.value })}
                      required
                    />
                    <Select
                      label="Sexe"
                      value={formData.sexe}
                      onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
                      options={[
                        { value: 'Masculin', label: 'Masculin' },
                        { value: 'Féminin', label: 'Féminin' },
                      ]}
                      required
                    />
                  </div>
                </div>

                {/* Informations parents */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Informations des parents</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Nom du père"
                      value={formData.nom_pere}
                      onChange={(e) => setFormData({ ...formData, nom_pere: e.target.value })}
                    />
                    <Input
                      label="Prénom du père"
                      value={formData.prenom_pere}
                      onChange={(e) => setFormData({ ...formData, prenom_pere: e.target.value })}
                    />
                    <Input
                      label="Nom de la mère"
                      value={formData.nom_mere}
                      onChange={(e) => setFormData({ ...formData, nom_mere: e.target.value })}
                    />
                    <Input
                      label="Prénom de la mère"
                      value={formData.prenom_mere}
                      onChange={(e) => setFormData({ ...formData, prenom_mere: e.target.value })}
                    />
                  </div>
                </div>

                {/* Informations administratives */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Informations administratives</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Input
                      label="Numéro de registre"
                      value={formData.numero_registre}
                      onChange={(e) => setFormData({ ...formData, numero_registre: e.target.value })}
                    />
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

          {/* Liste des naissances */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                Liste des Naissances ({filteredNaissances.length})
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sexe</th>
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
                  ) : filteredNaissances.length > 0 ? (
                    filteredNaissances.map((naissance) => (
                      <tr key={naissance.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {naissance.numero_acte}/{naissance.annee}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {naissance.prenom_enfant} {naissance.nom_enfant}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(naissance.date_naissance).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            naissance.sexe === 'Masculin' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-pink-100 text-pink-700'
                          }`}>
                            {naissance.sexe}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {naissance.lieu_naissance}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(naissance)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Modifier"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(naissance.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Supprimer"
                            >
                              <Trash2 size={18} />
                            </button>
                            <button
                              onClick={() => handleGeneratePDF(naissance.id)}
                              disabled={generating}
                              className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
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
                        <Baby size={48} className="mx-auto mb-3 opacity-30" />
                        <p>Aucune naissance enregistrée</p>
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
