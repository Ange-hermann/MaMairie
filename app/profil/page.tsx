'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { User, Mail, Phone, MapPin, Camera, Save, Lock } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ProfilPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/login')
        return
      }

      // Récupérer le profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Erreur profil:', profileError)
      } else {
        setUserData(profile)
        setFormData({
          nom: profile.nom || '',
          prenom: profile.prenom || '',
          email: profile.email || '',
          telephone: profile.telephone || '',
          adresse: profile.adresse || '',
        })
        
        // Charger l'avatar si existe
        if (profile.avatar_url) {
          setAvatarUrl(profile.avatar_url)
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return
      }

      const file = e.target.files[0]
      
      // Vérifier la taille (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('❌ La taille de l\'image ne doit pas dépasser 2MB')
        return
      }

      // Vérifier le type
      if (!file.type.startsWith('image/')) {
        alert('❌ Veuillez sélectionner une image')
        return
      }

      setUploadingAvatar(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non connecté')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar.${fileExt}`

      // Supprimer l'ancien avatar s'il existe
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').slice(-2).join('/')
        await supabase.storage.from('avatars').remove([oldPath])
      }

      // Upload le nouveau fichier
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Mettre à jour le profil avec la nouvelle URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      alert('✅ Photo de profil mise à jour avec succès !')
    } catch (error: any) {
      console.error('Erreur upload avatar:', error)
      alert('❌ Erreur lors de l\'upload : ' + error.message)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non connecté')

      // Mettre à jour le profil
      const { error } = await supabase
        .from('users')
        .update({
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone,
          adresse: formData.adresse,
        })
        .eq('id', user.id)

      if (error) throw error

      alert('✅ Profil mis à jour avec succès !')
      fetchUserData()
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de la mise à jour : ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('❌ Les mots de passe ne correspondent pas')
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert('❌ Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      alert('✅ Mot de passe modifié avec succès !')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors du changement de mot de passe : ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={userData?.role || 'citoyen'} />
      
      <div className="flex-1 w-full lg:w-auto">
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Chargement...'}
          userRole={userData?.role || 'citoyen'} 
          avatarUrl={avatarUrl}
        />
        
        <main className="p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 md:mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Mon Profil
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Gérez vos informations personnelles
              </p>
            </div>

            {/* Photo de profil */}
            <Card className="mb-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={48} className="text-gray-400" />
                    )}
                  </div>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full cursor-pointer hover:bg-primary-600 transition-colors"
                  >
                    <Camera size={20} />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                  </label>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {userData?.prenom} {userData?.nom}
                  </h3>
                  <p className="text-gray-600 capitalize">{userData?.role}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {uploadingAvatar ? 'Upload en cours...' : 'Cliquez sur l\'icône pour changer votre photo'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Informations personnelles */}
            <Card className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <User size={24} className="text-primary-500" />
                Informations Personnelles
              </h2>
              
              <form onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                  <Input
                    label="Prénom"
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    required
                  />
                  
                  <Input
                    label="Nom"
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    disabled
                    icon={<Mail size={20} />}
                  />
                  
                  <Input
                    label="Téléphone"
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    icon={<Phone size={20} />}
                  />
                </div>

                <Input
                  label="Adresse"
                  type="text"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  icon={<MapPin size={20} />}
                  className="mb-6"
                />

                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                  className="w-full md:w-auto"
                >
                  <Save size={20} className="mr-2" />
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </form>
            </Card>

            {/* Changer le mot de passe */}
            <Card>
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Lock size={24} className="text-primary-500" />
                Changer le Mot de Passe
              </h2>
              
              <form onSubmit={handleChangePassword}>
                <Input
                  label="Nouveau Mot de Passe"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Minimum 6 caractères"
                  className="mb-4"
                />

                <Input
                  label="Confirmer le Mot de Passe"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Retapez le mot de passe"
                  className="mb-6"
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full md:w-auto"
                >
                  <Lock size={20} className="mr-2" />
                  Changer le Mot de Passe
                </Button>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
