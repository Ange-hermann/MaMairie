'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import {
  Heart, Search, FileText, CheckCircle, XCircle, Clock,
  AlertTriangle, ShieldCheck, Eye, Printer, ClipboardCheck
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { telechargerPdfActeMariage } from '@/lib/genererPdfActeMariage'

export default function MariagesPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [onglet, setOnglet] = useState<'reservations' | 'actes'>('reservations')

  // Réservations citoyens
  const [reservations, setReservations] = useState<any[]>([])
  // Actes de mariage finaux
  const [mariages, setMariages] = useState<any[]>([])

  // Détail / traitement
  const [selected, setSelected] = useState<any>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [motifRejet, setMotifRejet] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Vérification bigamie
  const [bigamieLoading, setBigamieLoading] = useState(false)
  const [bigamieResultat, setBigamieResultat] = useState<any>(null)

  // Checklist vérification documents physiques
  const [checklist, setChecklist] = useState({
    doc_cni_epoux: false,
    doc_cni_epouse: false,
    doc_extrait_naissance_epoux: false,
    doc_extrait_naissance_epouse: false,
    doc_certificat_celibat_epoux: false,
    doc_certificat_celibat_epouse: false,
    doc_temoins: false,
  })
  const [observationsVerification, setObservationsVerification] = useState('')
  const [attestationConfirmee, setAttestationConfirmee] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('users').select('*').eq('id', user.id).single()

      if (profile) {
        setUserData(profile)

        // Charger les réservations de mariage
        const { data: reservData } = await supabase
          .from('reservations_mariage')
          .select('*')
          .eq('mairie_id', profile.mairie_id)
          .order('created_at', { ascending: false })
        setReservations(reservData || [])

        // Charger les actes de mariage finaux
        const { data: mariagesData } = await supabase
          .from('mariages')
          .select('*')
          .eq('mairie_id', profile.mairie_id)
          .order('created_at', { ascending: false })
        setMariages(mariagesData || [])
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const verifierBigamie = async (reservation: any) => {
    setBigamieLoading(true)
    setBigamieResultat(null)
    try {
      const res = await fetch('/api/etat-civil/verifier-bigamie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero_cni_epoux: reservation.numero_cni_epoux,
          numero_cni_epouse: reservation.numero_cni_epouse,
          nom_epoux: reservation.nom_epoux,
          prenom_epoux: reservation.prenom_epoux,
          nom_epouse: reservation.nom_epouse,
          prenom_epouse: reservation.prenom_epouse,
        })
      })
      const data = await res.json()
      setBigamieResultat(data)

      // Mettre à jour le flag dans la réservation
      await supabase.from('reservations_mariage').update({
        verification_bigamie_effectuee: true,
        bigamie_detectee: data.bigamie_detectee
      }).eq('id', reservation.id)

      fetchData()
    } catch (e: any) {
      alert('Erreur vérification bigamie : ' + e.message)
    } finally {
      setBigamieLoading(false)
    }
  }

  const validerReservation = async (reservation: any) => {
    setActionLoading(true)
    try {
      const { error } = await supabase.from('reservations_mariage').update({
        statut: 'validee',
        agent_id: userData.id,
        date_traitement: new Date().toISOString()
      }).eq('id', reservation.id)
      if (error) throw error

      // Calculer la date limite de présentation (date mariage - 10 jours)
      const dateMariage = new Date(reservation.date_mariage_souhaitee)
      const dateLimite = new Date(dateMariage)
      dateLimite.setDate(dateLimite.getDate() - 10)
      const dateLimiteFR = dateLimite.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      const dateMariageFR = dateMariage.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

      // Envoyer la notification au citoyen
      await supabase.from('notifications').insert({
        user_id: reservation.citoyen_id,
        titre: '✅ Réservation de mariage validée',
        message: `Votre réservation de mariage (${reservation.code_reservation}) a été validée. Vous devez vous présenter à la mairie avec les documents originaux avant le ${dateLimiteFR}, soit au moins 10 jours avant votre mariage prévu le ${dateMariageFR}. Documents requis : CNI originaux des deux époux, extraits de naissance, certificats de célibat et pièces d'identité des deux témoins.`,
        type: 'reservation_mariage_validee',
        lue: false
      })

      alert('✅ Réservation validée ! Une notification a été envoyée au citoyen.')
      setShowDetail(false)
      fetchData()
    } catch (e: any) {
      alert('Erreur : ' + e.message)
    } finally {
      setActionLoading(false)
    }
  }

  const verifierDocuments = async (reservation: any) => {
    const tousDocuments = Object.values(checklist).every(v => v)
    if (!tousDocuments) {
      alert('⚠️ Veuillez cocher tous les documents reçus avant de valider.')
      return
    }
    setActionLoading(true)
    try {
      const { error } = await supabase.from('reservations_mariage').update({
        statut: 'documents_verifies',
        documents_verifies: true,
        date_verification_documents: new Date().toISOString(),
        agent_verification_id: userData.id,
        observations_verification: observationsVerification,
        ...checklist
      }).eq('id', reservation.id)
      if (error) throw error
      alert('✅ Documents vérifiés ! Vous pouvez maintenant générer l\'acte de mariage.')
      setShowDetail(false)
      fetchData()
    } catch (e: any) {
      alert('Erreur : ' + e.message)
    } finally {
      setActionLoading(false)
    }
  }

  const rejeterReservation = async (reservation: any) => {
    if (!motifRejet.trim()) {
      alert('Veuillez saisir un motif de rejet.')
      return
    }
    setActionLoading(true)
    try {
      const { error } = await supabase.from('reservations_mariage').update({
        statut: 'rejetee',
        motif_rejet: motifRejet,
        agent_id: userData.id,
        date_traitement: new Date().toISOString()
      }).eq('id', reservation.id)
      if (error) throw error
      alert('✅ Réservation rejetée.')
      setShowDetail(false)
      setMotifRejet('')
      fetchData()
    } catch (e: any) {
      alert('Erreur : ' + e.message)
    } finally {
      setActionLoading(false)
    }
  }

  const genererActe = async (reservation: any) => {
    if (!['validee', 'documents_verifies'].includes(reservation.statut)) {
      alert('Les documents doivent être vérifiés avant de générer l\'acte.')
      return
    }
    if (!confirm(`Confirmer la génération de l'acte de mariage pour ${reservation.prenom_epoux} ${reservation.nom_epoux} et ${reservation.prenom_epouse} ${reservation.nom_epouse} ?`)) return

    setActionLoading(true)
    try {
      const annee = new Date().getFullYear()
      const { count } = await supabase
        .from('mariages')
        .select('*', { count: 'exact', head: true })
        .eq('mairie_id', userData.mairie_id)
        .gte('created_at', `${annee}-01-01`)

      const numero = String((count || 0) + 1).padStart(4, '0')
      const numeroActe = `M-${annee}-${numero}`

      const { data: mariage, error } = await supabase
        .from('mariages')
        .insert({
          nom_epoux: reservation.nom_epoux,
          prenom_epoux: reservation.prenom_epoux,
          date_naissance_epoux: reservation.date_naissance_epoux,
          lieu_naissance_epoux: reservation.lieu_naissance_epoux,
          nom_epouse: reservation.nom_epouse,
          prenom_epouse: reservation.prenom_epouse,
          date_naissance_epouse: reservation.date_naissance_epouse,
          lieu_naissance_epouse: reservation.lieu_naissance_epouse,
          date_mariage: reservation.date_mariage_souhaitee,
          lieu_mariage: reservation.lieu_mariage || 'Mairie',
          temoin1_nom: reservation.temoin1_nom,
          temoin1_prenom: reservation.temoin1_prenom,
          temoin1_numero_cni: reservation.temoin1_numero_cni,
          temoin1_nationalite: reservation.temoin1_nationalite,
          temoin1_profession: reservation.temoin1_profession,
          temoin1_adresse: reservation.temoin1_adresse,
          temoin2_nom: reservation.temoin2_nom,
          temoin2_prenom: reservation.temoin2_prenom,
          temoin2_numero_cni: reservation.temoin2_numero_cni,
          temoin2_nationalite: reservation.temoin2_nationalite,
          temoin2_profession: reservation.temoin2_profession,
          temoin2_adresse: reservation.temoin2_adresse,
          numero_acte: numeroActe,
          annee,
          mairie_id: userData.mairie_id,
          agent_id: userData.id,
        })
        .select().single()

      if (error) throw error

      // Mettre à jour la réservation
      await supabase.from('reservations_mariage').update({
        statut: 'acte_genere',
        mariage_id: mariage.id
      }).eq('id', reservation.id)

      // Télécharger le PDF
      const { data: mairieData } = await supabase
        .from('mairies')
        .select('nom_mairie, ville, district')
        .eq('id', userData.mairie_id)
        .single()

      telechargerPdfActeMariage({
        numero_acte: numeroActe,
        date_acte: new Date().toLocaleDateString('fr-FR'),
        nom_epoux: mariage.nom_epoux,
        prenom_epoux: mariage.prenom_epoux,
        date_naissance_epoux: mariage.date_naissance_epoux ? new Date(mariage.date_naissance_epoux).toLocaleDateString('fr-FR') : '',
        nationalite_epoux: reservation.nationalite_epoux || 'Ivoirienne',
        profession_epoux: reservation.profession_epoux || 'Non renseigné',
        domicile_epoux: reservation.domicile_epoux || mariage.lieu_naissance_epoux || '',
        nom_epouse: mariage.nom_epouse,
        prenom_epouse: mariage.prenom_epouse,
        date_naissance_epouse: mariage.date_naissance_epouse ? new Date(mariage.date_naissance_epouse).toLocaleDateString('fr-FR') : '',
        nationalite_epouse: reservation.nationalite_epouse || 'Ivoirienne',
        profession_epouse: reservation.profession_epouse || 'Non renseigné',
        domicile_epouse: reservation.domicile_epouse || mariage.lieu_naissance_epouse || '',
        date_mariage: new Date(mariage.date_mariage).toLocaleDateString('fr-FR'),
        lieu_mariage: mariage.lieu_mariage,
        temoin1_nom: mariage.temoin1_nom || '',
        temoin1_prenom: mariage.temoin1_prenom || '',
        temoin1_profession: mariage.temoin1_profession || '',
        temoin1_domicile: mariage.temoin1_adresse || '',
        temoin2_nom: mariage.temoin2_nom || '',
        temoin2_prenom: mariage.temoin2_prenom || '',
        temoin2_profession: mariage.temoin2_profession || '',
        temoin2_domicile: mariage.temoin2_adresse || '',
        mairie: {
          nom: mairieData?.nom_mairie || '',
          commune: mairieData?.ville || '',
          district: mairieData?.district || "DISTRICT AUTONOME D'ABIDJAN"
        },
        officier: {
          nom: userData.nom,
          prenom: userData.prenom,
          fonction: 'Officier d\'État Civil'
        }
      })

      alert(`✅ Acte de mariage N° ${numeroActe} généré et téléchargé !`)
      setShowDetail(false)
      fetchData()
    } catch (e: any) {
      alert('Erreur : ' + e.message)
    } finally {
      setActionLoading(false)
    }
  }

  const statutBadge = (statut: string) => {
    const map: Record<string, { label: string; cls: string; Icon: any }> = {
      en_attente: { label: 'En attente', cls: 'bg-yellow-100 text-yellow-800', Icon: Clock },
      validee: { label: 'Validée — En attente du couple', cls: 'bg-blue-100 text-blue-800', Icon: CheckCircle },
      documents_verifies: { label: 'Documents vérifiés', cls: 'bg-purple-100 text-purple-800', Icon: ClipboardCheck },
      rejetee: { label: 'Rejetée', cls: 'bg-red-100 text-red-800', Icon: XCircle },
      acte_genere: { label: 'Acte généré', cls: 'bg-green-100 text-green-800', Icon: CheckCircle },
    }
    const s = map[statut] || { label: statut, cls: 'bg-gray-100 text-gray-600', Icon: Clock }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>
        <s.Icon size={11} /> {s.label}
      </span>
    )
  }

  const filteredReservations = reservations.filter(r =>
    `${r.nom_epoux} ${r.prenom_epoux} ${r.nom_epouse} ${r.prenom_epouse} ${r.code_reservation}`
      .toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredMariages = mariages.filter(m =>
    `${m.nom_epoux} ${m.nom_epouse} ${m.numero_acte}`.toLowerCase().includes(searchTerm.toLowerCase())
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
          {/* En-tête */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Heart className="text-pink-500" size={32} /> Mariages
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Traitez les réservations citoyens, vérifiez la bigamie et générez les actes officiels
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Card className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white p-4">
              <p className="text-xs opacity-80">En attente</p>
              <p className="text-3xl font-bold">{reservations.filter(r => r.statut === 'en_attente').length}</p>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4">
              <p className="text-xs opacity-80">Validées</p>
              <p className="text-3xl font-bold">{reservations.filter(r => r.statut === 'validee').length}</p>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4">
              <p className="text-xs opacity-80">Actes générés</p>
              <p className="text-3xl font-bold">{mariages.length}</p>
            </Card>
            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4">
              <p className="text-xs opacity-80">Alertes bigamie</p>
              <p className="text-3xl font-bold">{reservations.filter(r => r.bigamie_detectee).length}</p>
            </Card>
          </div>

          {/* Onglets */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setOnglet('reservations')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${onglet === 'reservations' ? 'bg-pink-500 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
            >
              Réservations ({reservations.length})
            </button>
            <button
              onClick={() => setOnglet('actes')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${onglet === 'actes' ? 'bg-pink-500 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
            >
              Actes officiels ({mariages.length})
            </button>
          </div>

          {/* Recherche */}
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* ======== ONGLET RÉSERVATIONS ======== */}
          {onglet === 'reservations' && (
            <div className="space-y-3">
              {loading ? (
                <Card className="text-center py-10 text-gray-400">Chargement...</Card>
              ) : filteredReservations.length === 0 ? (
                <Card className="text-center py-12">
                  <Heart size={48} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-gray-400">Aucune réservation reçue</p>
                </Card>
              ) : filteredReservations.map(r => (
                <Card key={r.id} className={`border-l-4 ${r.bigamie_detectee ? 'border-l-red-500' : r.statut === 'en_attente' ? 'border-l-yellow-400' : r.statut === 'validee' ? 'border-l-blue-500' : r.statut === 'acte_genere' ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-gray-700 text-sm">{r.code_reservation}</span>
                        {statutBadge(r.statut)}
                        {r.bigamie_detectee && (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                            <AlertTriangle size={11} /> BIGAMIE
                          </span>
                        )}
                        {r.verification_bigamie_effectuee && !r.bigamie_detectee && (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                            <ShieldCheck size={11} /> Vérifié
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-800">
                        {r.prenom_epoux} {r.nom_epoux}
                        <span className="mx-2 text-pink-400">♥</span>
                        {r.prenom_epouse} {r.nom_epouse}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Date souhaitée : {r.date_mariage_souhaitee ? new Date(r.date_mariage_souhaitee).toLocaleDateString('fr-FR') : '-'}
                        {' · '}Reçue le {new Date(r.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelected(r)
                        setShowDetail(true)
                        setBigamieResultat(null)
                        setMotifRejet('')
                        setObservationsVerification('')
                        setAttestationConfirmee(false)
                        setChecklist({ doc_cni_epoux: r.doc_cni_epoux || false, doc_cni_epouse: r.doc_cni_epouse || false, doc_extrait_naissance_epoux: r.doc_extrait_naissance_epoux || false, doc_extrait_naissance_epouse: r.doc_extrait_naissance_epouse || false, doc_certificat_celibat_epoux: r.doc_certificat_celibat_epoux || false, doc_certificat_celibat_epouse: r.doc_certificat_celibat_epouse || false, doc_temoins: r.doc_temoins || false })
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all"
                    >
                      <Eye size={16} /> Traiter
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* ======== ONGLET ACTES ======== */}
          {onglet === 'actes' && (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Acte</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Époux</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Épouse</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMariages.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Aucun acte généré</td></tr>
                    ) : filteredMariages.map(m => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-bold text-gray-800">{m.numero_acte}</td>
                        <td className="px-4 py-3 text-sm">{m.prenom_epoux} {m.nom_epoux}</td>
                        <td className="px-4 py-3 text-sm">{m.prenom_epouse} {m.nom_epouse}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{new Date(m.date_mariage).toLocaleDateString('fr-FR')}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={async () => {
                              const { data: mairieData } = await supabase.from('mairies').select('nom_mairie, ville, district').eq('id', userData.mairie_id).single()
                              telechargerPdfActeMariage({
                                numero_acte: m.numero_acte,
                                date_acte: new Date().toLocaleDateString('fr-FR'),
                                nom_epoux: m.nom_epoux, prenom_epoux: m.prenom_epoux,
                                date_naissance_epoux: m.date_naissance_epoux ? new Date(m.date_naissance_epoux).toLocaleDateString('fr-FR') : '',
                                nationalite_epoux: 'Ivoirienne', profession_epoux: 'Non renseigné', domicile_epoux: m.lieu_naissance_epoux || '',
                                nom_epouse: m.nom_epouse, prenom_epouse: m.prenom_epouse,
                                date_naissance_epouse: m.date_naissance_epouse ? new Date(m.date_naissance_epouse).toLocaleDateString('fr-FR') : '',
                                nationalite_epouse: 'Ivoirienne', profession_epouse: 'Non renseigné', domicile_epouse: m.lieu_naissance_epouse || '',
                                date_mariage: new Date(m.date_mariage).toLocaleDateString('fr-FR'),
                                lieu_mariage: m.lieu_mariage,
                                temoin1_nom: m.temoin1_nom || '', temoin1_prenom: m.temoin1_prenom || '',
                                temoin1_profession: m.temoin1_profession || '', temoin1_domicile: m.temoin1_adresse || '',
                                temoin2_nom: m.temoin2_nom || '', temoin2_prenom: m.temoin2_prenom || '',
                                temoin2_profession: m.temoin2_profession || '', temoin2_domicile: m.temoin2_adresse || '',
                                mairie: { nom: mairieData?.nom_mairie || '', commune: mairieData?.ville || '', district: mairieData?.district || "DISTRICT AUTONOME D'ABIDJAN" },
                                officier: { nom: userData.nom, prenom: userData.prenom, fonction: "Officier d'État Civil" }
                              })
                            }}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Télécharger PDF"
                          >
                            <Printer size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </main>
      </div>

      {/* ======== MODALE TRAITEMENT ======== */}
      {showDetail && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header modale */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Traitement de la réservation</h2>
                  <p className="text-sm text-gray-500">{selected.code_reservation}</p>
                </div>
                <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
              </div>

              {/* Identité */}
              <div className="grid md:grid-cols-2 gap-4 mb-5">
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-pink-700 mb-1">ÉPOUX</p>
                  <p className="font-bold">{selected.prenom_epoux} {selected.nom_epoux}</p>
                  <p className="text-xs text-gray-500">CNI : {selected.numero_cni_epoux}</p>
                  <p className="text-xs text-gray-500">Né le {selected.date_naissance_epoux ? new Date(selected.date_naissance_epoux).toLocaleDateString('fr-FR') : '-'} à {selected.lieu_naissance_epoux}</p>
                  {selected.profession_epoux && <p className="text-xs text-gray-500">Profession : {selected.profession_epoux}</p>}
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-rose-700 mb-1">ÉPOUSE</p>
                  <p className="font-bold">{selected.prenom_epouse} {selected.nom_epouse}</p>
                  <p className="text-xs text-gray-500">CNI : {selected.numero_cni_epouse}</p>
                  <p className="text-xs text-gray-500">Née le {selected.date_naissance_epouse ? new Date(selected.date_naissance_epouse).toLocaleDateString('fr-FR') : '-'} à {selected.lieu_naissance_epouse}</p>
                  {selected.profession_epouse && <p className="text-xs text-gray-500">Profession : {selected.profession_epouse}</p>}
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-5 text-sm">
                <p><span className="font-semibold">Date souhaitée :</span> {selected.date_mariage_souhaitee ? new Date(selected.date_mariage_souhaitee).toLocaleDateString('fr-FR') : '-'}</p>
                <p><span className="font-semibold">Lieu :</span> {selected.lieu_mariage || 'Non précisé'}</p>
                <p><span className="font-semibold">Régime :</span> {selected.regime_matrimonial}</p>
              </div>

              {/* Vérification bigamie désactivée temporairement */}

              {/* === ACTIONS === */}
              {selected.statut === 'en_attente' && (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      onClick={() => validerReservation(selected)}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle size={16} />
                      {actionLoading ? 'En cours...' : 'Valider la réservation'}
                    </Button>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-sm font-medium text-gray-600 mb-2">Motif de rejet :</p>
                    <textarea
                      value={motifRejet}
                      onChange={e => setMotifRejet(e.target.value)}
                      placeholder="Ex: Documents incomplets, dossier invalide..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 resize-none"
                    />
                    <Button
                      variant="outline"
                      onClick={() => rejeterReservation(selected)}
                      disabled={actionLoading || !motifRejet.trim()}
                      className="mt-2 w-full flex items-center justify-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <XCircle size={16} /> Rejeter
                    </Button>
                  </div>
                </div>
              )}

              {selected.statut === 'validee' && (
                <div className="space-y-4">
                  {/* Bannière info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    <p className="font-semibold mb-1">📋 Étape 2 : Vérification physique des documents</p>
                    <p>Le couple doit se présenter à la mairie avec les originaux. Cochez chaque document reçu et vérifié.</p>
                  </div>

                  {/* Checklist documents */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <ClipboardCheck size={18} className="text-purple-500" /> Documents à vérifier
                    </h4>
                    <div className="space-y-2">
                      {[
                        { key: 'doc_cni_epoux', label: "CNI de l'époux (original)" },
                        { key: 'doc_cni_epouse', label: "CNI de l'épouse (original)" },
                        { key: 'doc_extrait_naissance_epoux', label: "Extrait de naissance de l'époux" },
                        { key: 'doc_extrait_naissance_epouse', label: "Extrait de naissance de l'épouse" },
                        { key: 'doc_certificat_celibat_epoux', label: "Certificat de célibat de l'époux" },
                        { key: 'doc_certificat_celibat_epouse', label: "Certificat de célibat de l'épouse" },
                        { key: 'doc_temoins', label: "Pièces d'identité des 2 témoins" },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={checklist[key as keyof typeof checklist]}
                            onChange={e => setChecklist(c => ({ ...c, [key]: e.target.checked }))}
                            className="w-4 h-4 accent-purple-500"
                          />
                          <span className={`text-sm ${checklist[key as keyof typeof checklist] ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {label}
                          </span>
                          {checklist[key as keyof typeof checklist] && <CheckCircle size={14} className="text-green-500 ml-auto" />}
                        </label>
                      ))}
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Observations (optionnel)</label>
                      <textarea
                        value={observationsVerification}
                        onChange={e => setObservationsVerification(e.target.value)}
                        placeholder="Ex : Tous documents conformes, identités vérifiées..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>

                    <div className="mt-3 p-2 rounded bg-gray-50 text-xs text-gray-500">
                      {Object.values(checklist).filter(Boolean).length} / {Object.values(checklist).length} documents vérifiés
                    </div>
                  </div>

                  {/* Attestation obligatoire */}
                  <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${attestationConfirmee ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-50'}`}>
                    <input
                      type="checkbox"
                      checked={attestationConfirmee}
                      onChange={e => setAttestationConfirmee(e.target.checked)}
                      className="mt-0.5 w-5 h-5 accent-purple-600 flex-shrink-0"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      <span className="font-bold text-gray-800">Je soussigné(e), {userData ? `${userData.prenom} ${userData.nom}` : 'l\'agent'}, Officier d'État Civil,</span>
                      {' '}atteste avoir reçu, examiné et vérifié en main propre l'ensemble des documents originaux présentés par{' '}
                      <span className="font-semibold">{selected.prenom_epoux} {selected.nom_epoux}</span> et{' '}
                      <span className="font-semibold">{selected.prenom_epouse} {selected.nom_epouse}</span>,
                      {' '}et certifie leur conformité en vue de la célébration de leur mariage.
                    </span>
                  </label>

                  <Button
                    variant="primary"
                    onClick={() => verifierDocuments(selected)}
                    disabled={actionLoading || !Object.values(checklist).every(Boolean) || !attestationConfirmee}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <ClipboardCheck size={16} />
                    {actionLoading ? 'Enregistrement...' : 'Confirmer la vérification des documents'}
                  </Button>
                </div>
              )}

              {selected.statut === 'documents_verifies' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardCheck size={20} className="text-purple-500" />
                    <p className="font-semibold text-purple-800">Documents vérifiés ✅</p>
                  </div>
                  <p className="text-sm text-purple-700 mb-4">
                    Le couple s'est présenté et tous les documents ont été vérifiés. Vous pouvez maintenant générer et imprimer l'acte officiel.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => genererActe(selected)}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600"
                  >
                    <FileText size={16} />
                    {actionLoading ? 'Génération...' : '📄 Générer et imprimer l\'Acte de Mariage'}
                  </Button>
                </div>
              )}

              {selected.statut === 'acte_genere' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <CheckCircle size={40} className="mx-auto text-green-500 mb-2" />
                  <p className="font-bold text-green-700">Acte de mariage généré</p>
                  <p className="text-sm text-green-600">Ce dossier est clôturé.</p>
                </div>
              )}

              {selected.statut === 'rejetee' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="font-semibold text-red-700">Réservation rejetée</p>
                  <p className="text-sm text-red-600 mt-1">Motif : {selected.motif_rejet}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
