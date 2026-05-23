'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { AvisMentionForm } from '@/components/AvisMentionForm'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function AvisMentionPage() {
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
                📝 Avis de Mention
              </h1>
              <p className="text-gray-600">
                Demandez l'apposition d'une mention sur un acte d'état civil existant
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                ℹ️ Qu'est-ce qu'un avis de mention ?
              </h3>
              <p className="text-sm text-blue-800 mb-2">
                Une mention est une annotation officielle apposée en marge d'un acte d'état civil 
                pour signaler un événement postérieur important.
              </p>
              <p className="text-sm text-blue-800 font-semibold mb-1">Exemples :</p>
              <ul className="text-sm text-blue-800 space-y-1 ml-4">
                <li>• Mention de divorce sur un acte de mariage</li>
                <li>• Mention de reconnaissance de paternité sur un acte de naissance</li>
                <li>• Mention de décès sur un acte de naissance</li>
                <li>• Mention de changement de nom ou prénom</li>
              </ul>
            </div>

            <AvisMentionForm />
          </div>
        </main>
      </div>
    </div>
  )
}
