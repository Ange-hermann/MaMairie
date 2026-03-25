'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { FileText, Download, Eye, Search, Plus } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { generateActeNaissance, generateActeMariage, generateActeDeces, downloadPDF } from '@/lib/pdfGenerator'

export default function DocumentsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [mairieData, setMairieData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('tous')
  const [generating, setGenerating] = useState(false)
  
  const [stats, setStats] = useState({
    total: 0,
    naissances: 0,
    mariages: 0,
    deces: 0,
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
        
        // Récupérer les infos de la mairie
        const { data: mairie } = await supabase
          .from('mairies')
          .select('*')
          .eq('id', profile.mairie_id)
          .single()
        
        setMairieData(mairie)
        
        // Calculer les statistiques
        const { data: naissances } = await supabase
          .from('naissances')
          .select('id')
          .eq('mairie_id', profile.mairie_id)
        
        const { data: mariages } = await supabase
          .from('mariages')
          .select('id')
          .eq('mairie_id', profile.mairie_id)
        
        const { data: deces } = await supabase
          .from('deces')
          .select('id')
          .eq('mairie_id', profile.mairie_id)
        
        setStats({
          total: (naissances?.length || 0) + (mariages?.length || 0) + (deces?.length || 0),
          naissances: naissances?.length || 0,
          mariages: mariages?.length || 0,
          deces: deces?.length || 0,
        })
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateNaissance = async (naissanceId: string) => {
    setGenerating(true)
    try {
      const { data: naissance } = await supabase
        .from('naissances')
        .select('*')
        .eq('id', naissanceId)
        .single()
      
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

  const handleGenerateMariage = async (mariageId: string) => {
    setGenerating(true)
    try {
      const { data: mariage } = await supabase
        .from('mariages')
        .select('*')
        .eq('id', mariageId)
        .single()
      
      if (!mariage || !mairieData || !userData) {
        throw new Error('Données manquantes')
      }
      
      const pdfBlob = await generateActeMariage(
        mariage,
        mairieData,
        `${userData.prenom} ${userData.nom}`
      )
      
      const filename = `Acte_Mariage_${mariage.nom_epoux}_${mariage.numero_acte}.pdf`
      downloadPDF(pdfBlob, filename)
      
      alert('✅ PDF généré avec succès !')
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('❌ Erreur : ' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleGenerateDeces = async (decesId: string) => {
    setGenerating(true)
    try {
      const { data: dece } = await supabase
        .from('deces')
        .select('*')
        .eq('id', decesId)
        .single()
      
      if (!dece || !mairieData || !userData) {
        throw new Error('Données manquantes')
      }
      
      const pdfBlob = await generateActeDeces(
        dece,
        mairieData,
        `${userData.prenom} ${userData.nom}`
      )
      
      const filename = `Acte_Deces_${dece.nom_defunt}_${dece.numero_acte}.pdf`
      downloadPDF(pdfBlob, filename)
      
      alert('✅ PDF généré avec succès !')
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('❌ Erreur : ' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="agent" />
      
      <div className="flex-1 w-full lg:w-auto">
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Chargement...'}
          userRole="agent" 
        />
        
        <main className="p-4 md:p-6">
          <div className="mb-4 md:mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2 md:gap-3">
              <FileText className="text-primary-500" size={28} />
              Gestion des Documents
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Générer et gérer les actes officiels en PDF
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Documents</p>
                  <p className="text-4xl font-bold mt-2">{stats.total}</p>
                </div>
                <FileText size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Naissances</p>
                  <p className="text-4xl font-bold mt-2">{stats.naissances}</p>
                </div>
                <FileText size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Mariages</p>
                  <p className="text-4xl font-bold mt-2">{stats.mariages}</p>
                </div>
                <FileText size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-gray-600 to-gray-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Décès</p>
                  <p className="text-4xl font-bold mt-2">{stats.deces}</p>
                </div>
                <FileText size={48} className="opacity-20" />
              </div>
            </Card>
          </div>

          {/* Actions Rapides */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/agent/etat-civil/naissances')}>
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-blue-600" size={32} />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Générer Acte de Naissance</h3>
                <p className="text-sm text-gray-600">Créer un extrait d'acte de naissance</p>
              </div>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/agent/etat-civil/mariages')}>
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-pink-600" size={32} />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Générer Acte de Mariage</h3>
                <p className="text-sm text-gray-600">Créer un extrait d'acte de mariage</p>
              </div>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/agent/etat-civil/deces')}>
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-gray-600" size={32} />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Générer Acte de Décès</h3>
                <p className="text-sm text-gray-600">Créer un extrait d'acte de décès</p>
              </div>
            </Card>
          </div>

          {/* Guide d'utilisation */}
          <Card>
            <h2 className="text-xl font-bold text-gray-800 mb-4">📖 Comment Générer un Document</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Accéder à l'État Civil</h3>
                  <p className="text-sm text-gray-600">
                    Allez dans le menu État Civil → Naissances, Mariages ou Décès
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Trouver l'Acte</h3>
                  <p className="text-sm text-gray-600">
                    Recherchez l'acte dans la liste ou créez-en un nouveau
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Générer le PDF</h3>
                  <p className="text-sm text-gray-600">
                    Cliquez sur l'icône 📄 pour générer automatiquement le PDF officiel
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Télécharger</h3>
                  <p className="text-sm text-gray-600">
                    Le PDF est généré avec logo, QR code et signature. Téléchargez-le immédiatement.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">✨ Fonctionnalités du PDF</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Logo officiel de la mairie</li>
                <li>• QR Code pour vérification d'authenticité</li>
                <li>• Signature numérique de l'agent</li>
                <li>• Numéro de référence unique</li>
                <li>• Filigrane "DOCUMENT OFFICIEL"</li>
                <li>• Format PDF professionnel</li>
              </ul>
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
