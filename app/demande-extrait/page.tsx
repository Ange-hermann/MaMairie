'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { FileUpload } from '@/components/ui/FileUpload'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function DemandeExtraitPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [documentName, setDocumentName] = useState<string | null>(null)
  const [mairies, setMairies] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    date_naissance: '',
    lieu_naissance: '',
    nom_pere: '',
    nom_mere: '',
    telephone: '',
    mairie_id: '',
  })

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
          label: `${m.nom_mairie} - ${m.ville}`
        })))
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Vous devez être connecté')
      }

      // Créer la demande dans Supabase
      const { data, error } = await supabase
        .from('requests')
        .insert([
          {
            user_id: user.id,
            type_acte: 'naissance',
            nom: formData.nom,
            prenom: formData.prenom,
            date_naissance: formData.date_naissance,
            lieu_naissance: formData.lieu_naissance,
            nom_pere: formData.nom_pere,
            nom_mere: formData.nom_mere,
            telephone: formData.telephone,
            mairie_id: formData.mairie_id || null,
            document_url: documentUrl,
            document_name: documentName,
            statut: 'en_attente',
          }
        ])
        .select()

      if (error) throw error

      // Afficher un message de succès
      alert('✅ Demande soumise avec succès!')
      router.push('/mes-demandes')
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de la soumission : ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="citoyen" />
      
      <div className="flex-1">
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Chargement...'}
          userRole="citoyen"
          avatarUrl={userData?.avatar_url}
        />
        
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Demander un Extrait d'Acte de Naissance
              </h1>
              <p className="text-gray-600">
                Remplissez le formulaire ci-dessous pour faire votre demande
              </p>
            </div>

            <Card>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
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

                <div className="grid md:grid-cols-2 gap-6">
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

                <Input
                  label="Téléphone"
                  type="tel"
                  placeholder="+225 07 XX XX XX XX"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  required
                />

                <Select
                  label="Mairie"
                  options={mairies}
                  value={formData.mairie_id}
                  onChange={(e) => setFormData({ ...formData, mairie_id: e.target.value })}
                  required
                />

                {/* Composant Upload de Document */}
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
                  label="Ancien Acte (Optionnel)"
                  helpText="Téléchargez une photo de votre ancien acte ou un PDF (max 5MB)"
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">
                    📋 Informations importantes
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Assurez-vous que toutes les informations sont correctes</li>
                    <li>• Le traitement de votre demande prendra 2-5 jours ouvrables</li>
                    <li>• Vous recevrez une notification par email et SMS</li>
                    <li>• Frais de traitement : 1,000 FCFA</li>
                    <li>• L'upload d'un ancien acte peut accélérer le traitement</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
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
