'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { DeclarationNaissanceForm } from '@/components/DeclarationNaissanceForm'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function DeclarationNaissancePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

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
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Chargement...</p>
      </div>
    )
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
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                📝 Déclarer une Naissance
              </h1>
              <p className="text-gray-600">
                Remplissez le formulaire ci-dessous pour déclarer une naissance. 
                Vous recevrez un code de suivi pour suivre l'évolution de votre déclaration.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                ℹ️ Informations importantes
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• La déclaration doit être faite dans les 30 jours suivant la naissance</li>
                <li>• Assurez-vous d'avoir tous les documents nécessaires</li>
                <li>• Les informations doivent être exactes et complètes</li>
                <li>• Vous recevrez un code de suivi à conserver précieusement</li>
                <li>• Le traitement prend généralement 5 à 10 jours ouvrables</li>
              </ul>
            </div>

            <DeclarationNaissanceForm />
          </div>
        </main>
      </div>
    </div>
  )
}
