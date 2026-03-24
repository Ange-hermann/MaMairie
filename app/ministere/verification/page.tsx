'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { 
  Shield, 
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  QrCode,
  FileText,
  Building2,
  Calendar,
  User,
  Hash,
  Eye,
  Download,
  History
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function VerificationActesPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  
  const [searchType, setSearchType] = useState('numero')
  const [searchValue, setSearchValue] = useState('')
  const [typeActe, setTypeActe] = useState('naissance')
  
  const [resultat, setResultat] = useState<any>(null)
  const [historique, setHistorique] = useState<any[]>([])

  const [stats, setStats] = useState({
    total_verifications: 0,
    valides: 0,
    invalides: 0,
    suspects: 0,
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

      if (profile && profile.role !== 'ministere') {
        router.push('/dashboard-citoyen')
        return
      }

      setUserData(profile)
      await fetchStatistiques()
      await fetchHistorique()

    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistiques = async () => {
    try {
      const { data: verifications } = await supabase
        .from('verifications_actes')
        .select('statut_verification')

      if (verifications) {
        const statsData = {
          total_verifications: verifications.length,
          valides: verifications.filter(v => v.statut_verification === 'valide').length,
          invalides: verifications.filter(v => v.statut_verification === 'invalide').length,
          suspects: verifications.filter(v => v.statut_verification === 'suspect').length,
        }
        setStats(statsData)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const fetchHistorique = async () => {
    try {
      const { data: historiqueData } = await supabase
        .from('verifications_actes')
        .select(`
          *,
          mairies (
            nom,
            ville
          )
        `)
        .order('derniere_verification', { ascending: false })
        .limit(10)

      setHistorique(historiqueData || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const verifierActe = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifying(true)
    setResultat(null)

    try {
      let acte = null
      let tableName = ''

      // Déterminer la table selon le type d'acte
      switch (typeActe) {
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
          throw new Error('Type d\'acte invalide')
      }

      // Rechercher l'acte
      if (searchType === 'numero') {
        const { data } = await supabase
          .from(tableName)
          .select(`
            *,
            mairies (
              id,
              nom,
              ville,
              region
            )
          `)
          .eq('numero_acte', searchValue)
          .single()

        acte = data
      } else if (searchType === 'qr') {
        // Rechercher par hash QR code
        const { data: verification } = await supabase
          .from('verifications_actes')
          .select(`
            *,
            mairies (
              nom,
              ville
            )
          `)
          .eq('qr_code_hash', searchValue)
          .single()

        if (verification) {
          // Récupérer l'acte complet
          const { data } = await supabase
            .from(tableName)
            .select(`
              *,
              mairies (
                id,
                nom,
                ville,
                region
              )
            `)
            .eq('id', verification.acte_id)
            .single()

          acte = data
        }
      }

      if (!acte) {
        setResultat({
          statut: 'invalide',
          message: 'Acte introuvable dans la base de données nationale',
          details: null,
        })
      } else {
        // Acte trouvé - Vérifier son authenticité
        const statut = verifierAuthenticite(acte)

        setResultat({
          statut: statut,
          message: statut === 'valide' 
            ? 'Document authentique et valide' 
            : statut === 'suspect'
            ? 'Document suspect - Vérification manuelle requise'
            : 'Document invalide ou falsifié',
          details: acte,
        })

        // Enregistrer la vérification
        await enregistrerVerification(acte, statut)
      }

      // Rafraîchir les stats et l'historique
      await fetchStatistiques()
      await fetchHistorique()

    } catch (error: any) {
      console.error('Erreur:', error)
      setResultat({
        statut: 'erreur',
        message: 'Erreur lors de la vérification : ' + error.message,
        details: null,
      })
    } finally {
      setVerifying(false)
    }
  }

  const verifierAuthenticite = (acte: any) => {
    // Logique de vérification
    // Pour l'instant, on considère tous les actes comme valides
    // À améliorer avec des règles métier spécifiques

    // Vérifier si l'acte a une mairie valide
    if (!acte.mairies) {
      return 'suspect'
    }

    // Vérifier si l'acte a un numéro
    if (!acte.numero_acte) {
      return 'suspect'
    }

    // Vérifier si l'acte n'est pas trop ancien (> 100 ans pour naissance)
    if (typeActe === 'naissance' && acte.date_naissance) {
      const dateNaissance = new Date(acte.date_naissance)
      const age = (new Date().getTime() - dateNaissance.getTime()) / (1000 * 60 * 60 * 24 * 365)
      if (age > 120) {
        return 'suspect'
      }
    }

    return 'valide'
  }

  const enregistrerVerification = async (acte: any, statut: string) => {
    try {
      // Vérifier si une entrée existe déjà
      const { data: existing } = await supabase
        .from('verifications_actes')
        .select('id, nombre_verifications')
        .eq('numero_acte', acte.numero_acte)
        .eq('type_acte', typeActe)
        .single()

      if (existing) {
        // Mettre à jour
        await supabase
          .from('verifications_actes')
          .update({
            nombre_verifications: existing.nombre_verifications + 1,
            derniere_verification: new Date().toISOString(),
            statut_verification: statut,
          })
          .eq('id', existing.id)
      } else {
        // Créer nouvelle entrée
        await supabase
          .from('verifications_actes')
          .insert([{
            numero_acte: acte.numero_acte,
            type_acte: typeActe,
            acte_id: acte.id,
            mairie_id: acte.mairie_id,
            qr_code_hash: generateQRHash(acte),
            statut_verification: statut,
            nombre_verifications: 1,
            derniere_verification: new Date().toISOString(),
          }])
      }
    } catch (error) {
      console.error('Erreur enregistrement:', error)
    }
  }

  const generateQRHash = (acte: any) => {
    // Générer un hash simple pour le QR code
    // En production, utiliser un vrai algorithme de hash
    return `${typeActe}-${acte.numero_acte}-${acte.id}`.replace(/[^a-zA-Z0-9]/g, '')
  }

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'valide':
        return <CheckCircle className="text-green-600" size={48} />
      case 'invalide':
        return <XCircle className="text-red-600" size={48} />
      case 'suspect':
        return <AlertTriangle className="text-yellow-600" size={48} />
      default:
        return <Shield className="text-gray-600" size={48} />
    }
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'valide':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'invalide':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'suspect':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="ministere" />
      
      <div className="flex-1">
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Ministère'}
          userRole="ministere"
          avatarUrl={userData?.avatar_url}
        />
        
        <main className="p-6">
          {/* En-tête */}
          <div className="mb-6 animate-fadeIn">
            <h1 className="text-3xl font-bold text-gradient mb-2 flex items-center gap-3">
              <Shield className="text-primary-500" size={36} />
              Vérification d'Actes
            </h1>
            <p className="text-gray-600">
              Vérifiez l'authenticité des actes d'état civil au niveau national
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Vérifications</p>
                  <p className="text-4xl font-bold mt-2">{stats.total_verifications}</p>
                </div>
                <Search size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Valides</p>
                  <p className="text-4xl font-bold mt-2">{stats.valides}</p>
                </div>
                <CheckCircle size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Invalides</p>
                  <p className="text-4xl font-bold mt-2">{stats.invalides}</p>
                </div>
                <XCircle size={48} className="opacity-20" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white hover-lift animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Suspects</p>
                  <p className="text-4xl font-bold mt-2">{stats.suspects}</p>
                </div>
                <AlertTriangle size={48} className="opacity-20" />
              </div>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Formulaire de Vérification */}
            <Card className="animate-scaleIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Search className="text-primary-500" />
                Vérifier un Acte
              </h2>

              <form onSubmit={verifierActe} className="space-y-4">
                <Select
                  label="Type d'Acte"
                  required
                  value={typeActe}
                  onChange={(e) => setTypeActe(e.target.value)}
                  options={[
                    { value: 'naissance', label: 'Acte de Naissance' },
                    { value: 'mariage', label: 'Acte de Mariage' },
                    { value: 'deces', label: 'Acte de Décès' },
                  ]}
                />

                <Select
                  label="Méthode de Recherche"
                  required
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  options={[
                    { value: 'numero', label: 'Numéro d\'Acte' },
                    { value: 'qr', label: 'QR Code / Hash' },
                  ]}
                />

                <Input
                  label={searchType === 'numero' ? 'Numéro d\'Acte' : 'Hash QR Code'}
                  type="text"
                  required
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={searchType === 'numero' ? 'Ex: N-2024-001234' : 'Ex: naissance-N2024001234-abc123'}
                  icon={searchType === 'numero' ? Hash : QrCode}
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Astuce :</strong> Le numéro d'acte se trouve en haut du document officiel. 
                    Le QR code peut être scanné avec un lecteur QR.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-ripple"
                  disabled={verifying}
                >
                  {verifying ? (
                    <>
                      <div className="spinner mr-2" style={{width: 20, height: 20}}></div>
                      Vérification en cours...
                    </>
                  ) : (
                    <>
                      <Shield size={20} className="mr-2" />
                      Vérifier l'Authenticité
                    </>
                  )}
                </Button>
              </form>
            </Card>

            {/* Résultat de la Vérification */}
            <Card className="animate-scaleIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Eye className="text-primary-500" />
                Résultat de la Vérification
              </h2>

              {!resultat ? (
                <div className="text-center py-12 text-gray-500">
                  <Shield size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">En attente de vérification</p>
                  <p className="text-sm mt-2">Entrez les informations et cliquez sur "Vérifier"</p>
                </div>
              ) : (
                <div className={`border-2 rounded-lg p-6 ${getStatutColor(resultat.statut)}`}>
                  <div className="flex flex-col items-center text-center mb-6">
                    {getStatutIcon(resultat.statut)}
                    <h3 className="text-2xl font-bold mt-4 mb-2 capitalize">
                      {resultat.statut === 'valide' ? 'Document Authentique' :
                       resultat.statut === 'invalide' ? 'Document Invalide' :
                       resultat.statut === 'suspect' ? 'Document Suspect' :
                       'Erreur'}
                    </h3>
                    <p className="text-sm">{resultat.message}</p>
                  </div>

                  {resultat.details && (
                    <div className="space-y-3 bg-white/50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-700 mb-3">Détails de l'Acte</h4>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Numéro</p>
                          <p className="font-semibold">{resultat.details.numero_acte}</p>
                        </div>

                        <div>
                          <p className="text-gray-600">Type</p>
                          <p className="font-semibold capitalize">{typeActe}</p>
                        </div>

                        {resultat.details.mairies && (
                          <>
                            <div>
                              <p className="text-gray-600">Mairie</p>
                              <p className="font-semibold">{resultat.details.mairies.nom}</p>
                            </div>

                            <div>
                              <p className="text-gray-600">Région</p>
                              <p className="font-semibold">{resultat.details.mairies.region}</p>
                            </div>
                          </>
                        )}

                        <div>
                          <p className="text-gray-600">Date d'émission</p>
                          <p className="font-semibold">
                            {new Date(resultat.details.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>

                        {typeActe === 'naissance' && resultat.details.nom_enfant && (
                          <div>
                            <p className="text-gray-600">Nom</p>
                            <p className="font-semibold">
                              {resultat.details.prenom_enfant} {resultat.details.nom_enfant}
                            </p>
                          </div>
                        )}
                      </div>

                      {resultat.statut === 'valide' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle size={16} />
                            <span className="text-sm font-semibold">
                              Ce document est authentique et enregistré dans la base nationale
                            </span>
                          </div>
                        </div>
                      )}

                      {resultat.statut === 'suspect' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-yellow-700">
                            <AlertTriangle size={16} />
                            <span className="text-sm font-semibold">
                              Une vérification manuelle est recommandée
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Historique des Vérifications */}
          <Card className="mt-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <History className="text-primary-500" />
              Historique Récent
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-700">Numéro Acte</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Type</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Mairie</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Vérifications</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Dernière Vérif.</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {historique.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-medium">{item.numero_acte}</td>
                      <td className="p-3 capitalize">{item.type_acte}</td>
                      <td className="p-3">{item.mairies?.nom || 'N/A'}</td>
                      <td className="p-3 text-center">{item.nombre_verifications}</td>
                      <td className="p-3 text-center text-sm text-gray-600">
                        {new Date(item.derniere_verification).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.statut_verification === 'valide' ? 'bg-green-100 text-green-600' :
                          item.statut_verification === 'invalide' ? 'bg-red-100 text-red-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {item.statut_verification}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {historique.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <History size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Aucune vérification récente</p>
                </div>
              )}
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
