'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FileText, Download, Search, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import jsPDF from 'jspdf'

export default function MesDemandesPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [requests, setRequests] = useState<any[]>([])
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer l'utilisateur connecté
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
        }

        // Récupérer toutes les demandes de l'utilisateur avec les infos de la mairie
        const { data: userRequests, error: requestsError } = await supabase
          .from('requests')
          .select(`
            *,
            mairies (
              nom_mairie,
              ville
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (requestsError) {
          console.error('Erreur demandes:', requestsError)
        } else {
          setRequests(userRequests || [])
        }
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusBadge = (statut: string) => {
    const badges = {
      en_attente: 'bg-orange-100 text-orange-600',
      en_traitement: 'bg-blue-100 text-blue-600',
      validee: 'bg-green-100 text-green-600',
      prete: 'bg-green-100 text-green-600',
      rejetee: 'bg-red-100 text-red-600',
    }
    
    const labels = {
      en_attente: 'En attente',
      en_traitement: 'En traitement',
      validee: 'Validée',
      prete: 'Prête',
      rejetee: 'Rejetée',
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[statut as keyof typeof badges] || 'bg-gray-100 text-gray-600'}`}>
        {labels[statut as keyof typeof labels] || statut}
      </span>
    )
  }

  const getTypeLabel = (typeActe: string) => {
    const types = {
      naissance: 'Extrait de Naissance',
      mariage: 'Extrait de Mariage',
      deces: 'Extrait de Décès',
    }
    return types[typeActe as keyof typeof types] || typeActe
  }

  const downloadPDF = (request: any) => {
    try {
      const doc = new jsPDF()
      
      // En-tête
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('RÉPUBLIQUE DE CÔTE D\'IVOIRE', 105, 20, { align: 'center' })
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text('Union - Discipline - Travail', 105, 28, { align: 'center' })
      
      // Ligne de séparation
      doc.setLineWidth(0.5)
      doc.line(20, 35, 190, 35)
      
      // Titre du document
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text(getTypeLabel(request.type_acte).toUpperCase(), 105, 50, { align: 'center' })
      
      // Informations de la mairie
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      const mairieNom = request.mairies?.nom_mairie || 'Mairie'
      const mairieVille = request.mairies?.ville || ''
      doc.text(`${mairieNom} - ${mairieVille}`, 105, 60, { align: 'center' })
      
      // Corps du document
      doc.setFontSize(12)
      let yPos = 80
      
      doc.text('Le Maire certifie que :', 20, yPos)
      yPos += 15
      
      doc.setFont('helvetica', 'bold')
      doc.text(`${request.prenom} ${request.nom}`, 20, yPos)
      yPos += 10
      
      doc.setFont('helvetica', 'normal')
      if (request.date_naissance) {
        doc.text(`Né(e) le : ${formatDate(request.date_naissance)}`, 20, yPos)
        yPos += 8
      }
      
      if (request.lieu_naissance) {
        doc.text(`À : ${request.lieu_naissance}`, 20, yPos)
        yPos += 8
      }
      
      if (request.nom_pere) {
        doc.text(`Père : ${request.nom_pere}`, 20, yPos)
        yPos += 8
      }
      
      if (request.nom_mere) {
        doc.text(`Mère : ${request.nom_mere}`, 20, yPos)
        yPos += 8
      }
      
      // Informations administratives
      yPos += 15
      doc.setFontSize(10)
      doc.text(`Numéro de demande : ${request.id.substring(0, 8)}`, 20, yPos)
      yPos += 6
      doc.text(`Date de délivrance : ${formatDate(new Date().toISOString())}`, 20, yPos)
      yPos += 6
      doc.text(`Statut : ${request.statut === 'validee' ? 'Validé' : 'Prêt'}`, 20, yPos)
      
      // Signature
      yPos += 30
      doc.setFontSize(11)
      doc.text('Fait à ' + (mairieVille || 'Abidjan'), 120, yPos)
      yPos += 6
      doc.text('Le ' + formatDate(new Date().toISOString()), 120, yPos)
      yPos += 15
      doc.text('Le Maire', 120, yPos)
      
      // Pied de page
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text('Document officiel délivré par MaMairie - République de Côte d\'Ivoire', 105, 280, { align: 'center' })
      
      // Télécharger le PDF
      const fileName = `${getTypeLabel(request.type_acte).replace(/ /g, '_')}_${request.nom}_${request.prenom}.pdf`
      doc.save(fileName)
      
      alert('✅ PDF téléchargé avec succès !')
    } catch (error) {
      console.error('Erreur génération PDF:', error)
      alert('❌ Erreur lors de la génération du PDF')
    }
  }

  const filteredRequests = requests.filter(request =>
    (request.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.type_acte?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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
          <div className="mb-4 md:mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Mes Demandes
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Suivez l'état de vos demandes d'actes
            </p>
          </div>

          <Card className="mb-4 md:mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Rechercher par nom ou type d'acte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          <Card>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type d'Acte
                    </th>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mairie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date de Demande
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        Chargement des demandes...
                      </td>
                    </tr>
                  ) : filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FileText className="text-primary-500" size={20} />
                            <span className="font-medium text-gray-900">
                              {getTypeLabel(request.type_acte)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {request.prenom} {request.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {request.mairies?.nom_mairie ? `${request.mairies.nom_mairie} - ${request.mairies.ville}` : 'Non spécifiée'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {formatDate(request.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {request.document_url ? (
                            <a
                              href={request.document_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                              title={request.document_name || 'Voir le document'}
                            >
                              <Eye size={16} />
                              Voir
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(request.statut)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {(request.statut === 'validee' || request.statut === 'prete') && (
                              <Button 
                                variant="success" 
                                size="sm"
                                onClick={() => downloadPDF(request)}
                              >
                                <Download size={16} className="mr-1" />
                                Télécharger PDF
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <Eye size={16} className="mr-1" />
                              Détails
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="font-medium">Aucune demande trouvée</p>
                        <p className="text-sm mt-2">
                          {searchTerm ? 'Essayez une autre recherche' : 'Créez votre première demande pour commencer'}
                        </p>
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
