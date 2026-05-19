'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Download, FileText, Loader, AlertCircle } from 'lucide-react'
import { generateActeNaissance, generateActeMariage, generateActeDeces } from '@/lib/pdfGenerator'

export default function ExtraitPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [acte, setActe] = useState<any>(null)
  const [mairie, setMairie] = useState<any>(null)
  const [downloading, setDownloading] = useState(false)

  const type = params.type as string
  const id = params.id as string

  useEffect(() => {
    fetchActe()
  }, [])

  const fetchActe = async () => {
    try {
      // Déterminer la table
      let tableName = ''
      switch (type) {
        case 'naissance':
          tableName = 'naissances'
          break
        case 'mariage':
          tableName = 'mariages'
          break
        case 'deces':
          tableName = 'deces'
          break
        default:
          setError('Type d\'acte invalide')
          setLoading(false)
          return
      }

      // Récupérer l'acte
      const { data: acteData, error: acteError } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (acteError || !acteData) {
        setError('Acte introuvable')
        setLoading(false)
        return
      }

      setActe(acteData)

      // Récupérer la mairie
      const { data: mairieData } = await supabase
        .from('mairies')
        .select('*')
        .eq('id', acteData.mairie_id)
        .single()

      setMairie(mairieData)

    } catch (err) {
      console.error('Erreur:', err)
      setError('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!acte || !mairie) return

    setDownloading(true)
    try {
      let pdfBlob: Blob

      // Générer le PDF selon le type
      switch (type) {
        case 'naissance':
          pdfBlob = await generateActeNaissance(acte, mairie, 'Agent')
          break
        case 'mariage':
          pdfBlob = await generateActeMariage(acte, mairie, 'Agent')
          break
        case 'deces':
          pdfBlob = await generateActeDeces(acte, mairie, 'Agent')
          break
        default:
          throw new Error('Type invalide')
      }

      // Télécharger
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `extrait_${type}_${acte.numero_acte}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (err) {
      console.error('Erreur téléchargement:', err)
      alert('Erreur lors du téléchargement')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-primary-600" size={48} />
          <p className="text-gray-600">Chargement de l'extrait...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/')}>
            Retour à l'accueil
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center mb-6">
            <FileText className="mx-auto mb-4 text-primary-600" size={64} />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Extrait d'Acte de {type.charAt(0).toUpperCase() + type.slice(1)}
            </h1>
            <p className="text-gray-600">N° {acte?.numero_acte}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Informations</h3>
            
            {type === 'naissance' && (
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Nom :</span> {acte.nom_enfant}</p>
                <p><span className="font-medium">Prénom :</span> {acte.prenom_enfant}</p>
                <p><span className="font-medium">Date de naissance :</span> {new Date(acte.date_naissance).toLocaleDateString('fr-FR')}</p>
                <p><span className="font-medium">Lieu :</span> {acte.lieu_naissance}</p>
              </div>
            )}

            {type === 'mariage' && (
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Époux :</span> {acte.nom_epoux} {acte.prenom_epoux}</p>
                <p><span className="font-medium">Épouse :</span> {acte.nom_epouse} {acte.prenom_epouse}</p>
                <p><span className="font-medium">Date :</span> {new Date(acte.date_mariage).toLocaleDateString('fr-FR')}</p>
              </div>
            )}

            {type === 'deces' && (
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Nom :</span> {acte.nom_defunt}</p>
                <p><span className="font-medium">Prénom :</span> {acte.prenom_defunt}</p>
                <p><span className="font-medium">Date de décès :</span> {new Date(acte.date_deces).toLocaleDateString('fr-FR')}</p>
                <p><span className="font-medium">Lieu :</span> {acte.lieu_deces}</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm"><span className="font-medium">Mairie :</span> {mairie?.nom_mairie}</p>
              <p className="text-sm"><span className="font-medium">Ville :</span> {mairie?.ville}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1"
            >
              {downloading ? (
                <>
                  <Loader className="animate-spin mr-2" size={18} />
                  Téléchargement...
                </>
              ) : (
                <>
                  <Download className="mr-2" size={18} />
                  Télécharger le PDF
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
            >
              Retour
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>ℹ️ Information :</strong> Ce document est un extrait officiel de l'acte d'état civil. 
              Il peut être utilisé pour toutes démarches administratives.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
