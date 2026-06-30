'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Heart, AlertTriangle, CheckCircle, Clock, XCircle, ChevronRight, ChevronLeft } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { agentFormStore } from '@/lib/voiceAgent/agentFormStore'

const ETAPES = ['Époux', 'Épouse', 'Mariage & Témoins', 'Récapitulatif']

const REGIMES = [
  'Droit commun',
  'Séparation de biens',
  'Communauté universelle',
  'Participation aux acquêts',
]

export default function ReservationMariagePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [userData, setUserData] = useState<any>(null)
  const [mairies, setMairies] = useState<any[]>([])
  const [etape, setEtape] = useState(0)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [succes, setSucces] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [mesReservations, setMesReservations] = useState<any[]>([])
  const [onglet, setOnglet] = useState<'nouvelle' | 'suivi'>('nouvelle')

  const [form, setForm] = useState({
    // Époux
    nom_epoux: '',
    prenom_epoux: '',
    date_naissance_epoux: '',
    lieu_naissance_epoux: '',
    nationalite_epoux: 'Ivoirienne',
    profession_epoux: '',
    domicile_epoux: '',
    numero_cni_epoux: '',
    // Épouse
    nom_epouse: '',
    prenom_epouse: '',
    date_naissance_epouse: '',
    lieu_naissance_epouse: '',
    nationalite_epouse: 'Ivoirienne',
    profession_epouse: '',
    domicile_epouse: '',
    numero_cni_epouse: '',
    // Mariage
    date_mariage_souhaitee: '',
    lieu_mariage: '',
    regime_matrimonial: 'Droit commun',
    mairie_id: '',
    // Témoins
    temoin1_nom: '',
    temoin1_prenom: '',
    temoin1_numero_cni: '',
    temoin1_nationalite: 'Ivoirienne',
    temoin1_profession: '',
    temoin1_adresse: '',
    temoin2_nom: '',
    temoin2_prenom: '',
    temoin2_numero_cni: '',
    temoin2_nationalite: 'Ivoirienne',
    temoin2_profession: '',
    temoin2_adresse: '',
  })

  // ─── Pré-remplissage depuis l'agent vocal ───────────────────────
  useEffect(() => {
    const applyPrefill = async () => {
      const p = agentFormStore.prefill
      if (!p) return
      setForm(prev => ({
        ...prev,
        nom_epoux: p.nom_epoux || prev.nom_epoux,
        prenom_epoux: p.prenom_epoux || prev.prenom_epoux,
        date_naissance_epoux: p.date_naissance_epoux || prev.date_naissance_epoux,
        lieu_naissance_epoux: p.lieu_naissance_epoux || prev.lieu_naissance_epoux,
        profession_epoux: p.profession_epoux || prev.profession_epoux,
        nom_epouse: p.nom_epouse || prev.nom_epouse,
        prenom_epouse: p.prenom_epouse || prev.prenom_epouse,
        date_naissance_epouse: p.date_naissance_epouse || prev.date_naissance_epouse,
        lieu_naissance_epouse: p.lieu_naissance_epouse || prev.lieu_naissance_epouse,
        profession_epouse: p.profession_epouse || prev.profession_epouse,
        date_mariage_souhaitee: p.date_mariage_souhaitee || prev.date_mariage_souhaitee,
      }))
      if (p.commune_nom) {
        const { data: mairie } = await supabase
          .from('mairies').select('id').ilike('nom_mairie', `%${p.commune_nom}%`).limit(1).single()
        if (mairie) setForm(prev => ({ ...prev, mairie_id: mairie.id }))
      }
      agentFormStore.clearPrefill()
    }
    applyPrefill()
  }, [])

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
      if (profile) setUserData(profile)

      const { data: mairiesData } = await supabase
        .from('mairies')
        .select('id, nom_mairie, ville')
        .order('nom_mairie')
      setMairies(mairiesData || [])

      const { data: reservs } = await supabase
        .from('reservations_mariage')
        .select('*')
        .eq('citoyen_id', user.id)
        .order('created_at', { ascending: false })
      setMesReservations(reservs || [])
    } catch (e) {
      console.error(e)
    } finally {
      setPageLoading(false)
    }
  }

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const validerEtape = () => {
    setErreur(null)
    if (etape === 0) {
      if (!form.nom_epoux || !form.prenom_epoux || !form.date_naissance_epoux || !form.numero_cni_epoux || !form.lieu_naissance_epoux)
        return setErreur('Veuillez remplir tous les champs obligatoires de l\'époux.')
    }
    if (etape === 1) {
      if (!form.nom_epouse || !form.prenom_epouse || !form.date_naissance_epouse || !form.numero_cni_epouse || !form.lieu_naissance_epouse)
        return setErreur('Veuillez remplir tous les champs obligatoires de l\'épouse.')
    }
    if (etape === 2) {
      if (!form.date_mariage_souhaitee || !form.mairie_id)
        return setErreur('Veuillez choisir une date et une mairie.')
      // Date au moins 3 mois dans le futur (délai légal)
      const dateMariage = new Date(form.date_mariage_souhaitee)
      const minDate = new Date()
      minDate.setMonth(minDate.getMonth() + 3)
      if (dateMariage < minDate)
        return setErreur('La réservation doit être faite au moins 3 mois avant la date du mariage.')
    }
    setEtape(e => e + 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setErreur(null)
    try {
      const response = await fetch('/api/etat-civil/reservation-mariage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setSucces(data.code_reservation)
      setOnglet('suivi')
      init()
    } catch (e: any) {
      setErreur(e.message || 'Erreur lors de la soumission')
    } finally {
      setLoading(false)
    }
  }

  const statutBadge = (statut: string) => {
    const map: Record<string, { label: string; className: string; icon: any }> = {
      en_attente: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      validee: { label: 'Validée', className: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      rejetee: { label: 'Rejetée', className: 'bg-red-100 text-red-800', icon: XCircle },
      acte_genere: { label: 'Acte généré', className: 'bg-green-100 text-green-800', icon: CheckCircle },
    }
    const s = map[statut] || { label: statut, className: 'bg-gray-100 text-gray-700', icon: Clock }
    const Icon = s.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${s.className}`}>
        <Icon size={12} /> {s.label}
      </span>
    )
  }

  if (pageLoading) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Chargement...</p>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="citoyen" />
      <div className="flex-1 w-full lg:w-auto">
        <Header
          userName={userData ? `${userData.prenom} ${userData.nom}` : ''}
          userRole="citoyen"
          avatarUrl={userData?.avatar_url}
        />
        <main className="p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* En-tête */}
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-pink-100 p-3 rounded-full">
                <Heart className="text-pink-500" size={32} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Réservation de Mariage</h1>
                <p className="text-gray-500 text-sm">Faites votre demande en ligne, l'agent traitera votre dossier</p>
              </div>
            </div>

            {/* Onglets */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setOnglet('nouvelle')}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${onglet === 'nouvelle' ? 'bg-pink-500 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
              >
                + Nouvelle Réservation
              </button>
              <button
                onClick={() => setOnglet('suivi')}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${onglet === 'suivi' ? 'bg-pink-500 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
              >
                Mes Réservations ({mesReservations.length})
              </button>
            </div>

            {/* =========== ONGLET SUIVI =========== */}
            {onglet === 'suivi' && (
              <div className="space-y-4">
                {succes && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-semibold text-green-800">Réservation soumise avec succès !</p>
                      <p className="text-sm text-green-700 mt-1">
                        Votre code de réservation : <span className="font-bold text-lg">{succes}</span>
                      </p>
                      <p className="text-xs text-green-600 mt-1">Conservez ce code, l'agent vous contactera.</p>
                    </div>
                  </div>
                )}

                {mesReservations.length === 0 ? (
                  <Card className="text-center py-12">
                    <Heart size={48} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">Aucune réservation pour l'instant</p>
                    <Button variant="primary" className="mt-4" onClick={() => setOnglet('nouvelle')}>
                      Faire une réservation
                    </Button>
                  </Card>
                ) : (
                  mesReservations.map(r => (
                    <Card key={r.id} className="border-l-4 border-l-pink-400">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800">{r.code_reservation}</span>
                            {statutBadge(r.statut)}
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">{r.prenom_epoux} {r.nom_epoux}</span>
                            <span className="mx-2 text-pink-400">♥</span>
                            <span className="font-medium">{r.prenom_epouse} {r.nom_epouse}</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Date souhaitée : {r.date_mariage_souhaitee ? new Date(r.date_mariage_souhaitee).toLocaleDateString('fr-FR') : '-'}
                          </p>
                        </div>
                        <div className="text-xs text-gray-400">
                          Déposée le {new Date(r.created_at).toLocaleDateString('fr-FR')}
                          {r.motif_rejet && (
                            <p className="text-red-500 mt-1">Motif rejet : {r.motif_rejet}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* =========== ONGLET FORMULAIRE =========== */}
            {onglet === 'nouvelle' && (
              <Card>
                {/* Stepper */}
                <div className="mb-8">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
                    {ETAPES.map((label, i) => (
                      <div key={i} className="flex flex-col items-center z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                          ${i < etape ? 'bg-pink-500 border-pink-500 text-white'
                            : i === etape ? 'bg-white border-pink-500 text-pink-500'
                            : 'bg-white border-gray-300 text-gray-400'}`}>
                          {i < etape ? '✓' : i + 1}
                        </div>
                        <span className={`text-xs mt-1 font-medium hidden md:block ${i === etape ? 'text-pink-600' : 'text-gray-400'}`}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {erreur && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
                    <AlertTriangle size={16} /> {erreur}
                  </div>
                )}

                {/* ---- Étape 0 : Époux ---- */}
                {etape === 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-4">👤 Informations de l'Époux</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input label="Nom *" value={form.nom_epoux} onChange={e => set('nom_epoux', e.target.value)} required />
                      <Input label="Prénom(s) *" value={form.prenom_epoux} onChange={e => set('prenom_epoux', e.target.value)} required />
                      <Input label="Date de naissance *" type="date" value={form.date_naissance_epoux} onChange={e => set('date_naissance_epoux', e.target.value)} required />
                      <Input label="Lieu de naissance *" value={form.lieu_naissance_epoux} onChange={e => set('lieu_naissance_epoux', e.target.value)} required />
                      <Input label="Numéro CNI *" value={form.numero_cni_epoux} onChange={e => set('numero_cni_epoux', e.target.value)} placeholder="Ex: CI1234567890" required />
                      <Input label="Nationalité" value={form.nationalite_epoux} onChange={e => set('nationalite_epoux', e.target.value)} />
                      <Input label="Profession" value={form.profession_epoux} onChange={e => set('profession_epoux', e.target.value)} />
                      <Input label="Domicile" value={form.domicile_epoux} onChange={e => set('domicile_epoux', e.target.value)} />
                    </div>
                  </div>
                )}

                {/* ---- Étape 1 : Épouse ---- */}
                {etape === 1 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-4">👤 Informations de l'Épouse</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input label="Nom *" value={form.nom_epouse} onChange={e => set('nom_epouse', e.target.value)} required />
                      <Input label="Prénom(s) *" value={form.prenom_epouse} onChange={e => set('prenom_epouse', e.target.value)} required />
                      <Input label="Date de naissance *" type="date" value={form.date_naissance_epouse} onChange={e => set('date_naissance_epouse', e.target.value)} required />
                      <Input label="Lieu de naissance *" value={form.lieu_naissance_epouse} onChange={e => set('lieu_naissance_epouse', e.target.value)} required />
                      <Input label="Numéro CNI *" value={form.numero_cni_epouse} onChange={e => set('numero_cni_epouse', e.target.value)} placeholder="Ex: CI0987654321" required />
                      <Input label="Nationalité" value={form.nationalite_epouse} onChange={e => set('nationalite_epouse', e.target.value)} />
                      <Input label="Profession" value={form.profession_epouse} onChange={e => set('profession_epouse', e.target.value)} />
                      <Input label="Domicile" value={form.domicile_epouse} onChange={e => set('domicile_epouse', e.target.value)} />
                    </div>
                  </div>
                )}

                {/* ---- Étape 2 : Mariage & Témoins ---- */}
                {etape === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-bold text-gray-800 mb-4">💒 Informations du Mariage</h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mairie *</label>
                          <select
                            value={form.mairie_id}
                            onChange={e => set('mairie_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 text-sm"
                            required
                          >
                            <option value="">-- Choisir une mairie --</option>
                            {mairies.map(m => (
                              <option key={m.id} value={m.id}>{m.nom_mairie} — {m.ville}</option>
                            ))}
                          </select>
                        </div>
                        <Input
                          label="Date souhaitée du mariage * (min. 3 mois)"
                          type="date"
                          value={form.date_mariage_souhaitee}
                          onChange={e => set('date_mariage_souhaitee', e.target.value)}
                          min={(() => { const d = new Date(); d.setMonth(d.getMonth() + 3); return d.toISOString().split('T')[0] })()}
                          required
                        />
                        <Input label="Lieu du mariage" value={form.lieu_mariage} onChange={e => set('lieu_mariage', e.target.value)} placeholder="Salle des fêtes, Mairie..." />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Régime matrimonial</label>
                          <select
                            value={form.regime_matrimonial}
                            onChange={e => set('regime_matrimonial', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 text-sm"
                          >
                            {REGIMES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Témoin 1 */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-3">👤 Témoin 1</h4>
                        <div className="space-y-3">
                          <Input label="Nom" value={form.temoin1_nom} onChange={e => set('temoin1_nom', e.target.value)} />
                          <Input label="Prénom(s)" value={form.temoin1_prenom} onChange={e => set('temoin1_prenom', e.target.value)} />
                          <Input label="N° CNI" value={form.temoin1_numero_cni} onChange={e => set('temoin1_numero_cni', e.target.value)} />
                          <Input label="Nationalité" value={form.temoin1_nationalite} onChange={e => set('temoin1_nationalite', e.target.value)} />
                          <Input label="Profession" value={form.temoin1_profession} onChange={e => set('temoin1_profession', e.target.value)} />
                          <Input label="Adresse" value={form.temoin1_adresse} onChange={e => set('temoin1_adresse', e.target.value)} />
                        </div>
                      </div>
                      {/* Témoin 2 */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-3">👤 Témoin 2</h4>
                        <div className="space-y-3">
                          <Input label="Nom" value={form.temoin2_nom} onChange={e => set('temoin2_nom', e.target.value)} />
                          <Input label="Prénom(s)" value={form.temoin2_prenom} onChange={e => set('temoin2_prenom', e.target.value)} />
                          <Input label="N° CNI" value={form.temoin2_numero_cni} onChange={e => set('temoin2_numero_cni', e.target.value)} />
                          <Input label="Nationalité" value={form.temoin2_nationalite} onChange={e => set('temoin2_nationalite', e.target.value)} />
                          <Input label="Profession" value={form.temoin2_profession} onChange={e => set('temoin2_profession', e.target.value)} />
                          <Input label="Adresse" value={form.temoin2_adresse} onChange={e => set('temoin2_adresse', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---- Étape 3 : Récapitulatif ---- */}
                {etape === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">📋 Récapitulatif de votre demande</h2>

                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                      <h3 className="font-semibold text-pink-900 mb-2">Époux</h3>
                      <p className="text-sm">{form.prenom_epoux} {form.nom_epoux} — né(e) le {form.date_naissance_epoux} à {form.lieu_naissance_epoux}</p>
                      <p className="text-sm text-gray-500">CNI : {form.numero_cni_epoux} | {form.profession_epoux}</p>
                    </div>

                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                      <h3 className="font-semibold text-rose-900 mb-2">Épouse</h3>
                      <p className="text-sm">{form.prenom_epouse} {form.nom_epouse} — née le {form.date_naissance_epouse} à {form.lieu_naissance_epouse}</p>
                      <p className="text-sm text-gray-500">CNI : {form.numero_cni_epouse} | {form.profession_epouse}</p>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Mariage</h3>
                      <p className="text-sm">Date souhaitée : <strong>{form.date_mariage_souhaitee ? new Date(form.date_mariage_souhaitee).toLocaleDateString('fr-FR') : '-'}</strong></p>
                      <p className="text-sm">Mairie : <strong>{mairies.find(m => m.id === form.mairie_id)?.nom_mairie || '-'}</strong></p>
                      <p className="text-sm">Régime : {form.regime_matrimonial}</p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                      <p className="font-semibold mb-1">⚠️ Engagement légal</p>
                      <p>En soumettant cette demande, je certifie que les informations fournies sont exactes. Toute fausse déclaration est passible de sanctions pénales conformément à la législation ivoirienne.</p>
                    </div>
                  </div>
                )}

                {/* Boutons navigation */}
                <div className="flex justify-between mt-6">
                  {etape > 0 ? (
                    <Button type="button" variant="outline" onClick={() => setEtape(e => e - 1)} className="flex items-center gap-2">
                      <ChevronLeft size={16} /> Précédent
                    </Button>
                  ) : <div />}

                  {etape < 3 ? (
                    <Button type="button" variant="primary" onClick={validerEtape} className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600">
                      Suivant <ChevronRight size={16} />
                    </Button>
                  ) : (
                    <Button type="button" variant="primary" onClick={handleSubmit} disabled={loading} className="bg-pink-500 hover:bg-pink-600">
                      {loading ? 'Envoi en cours...' : '✅ Soumettre la réservation'}
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
