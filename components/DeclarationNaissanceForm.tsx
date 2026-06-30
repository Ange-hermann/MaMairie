'use client'

import { useState, useEffect } from 'react'
import { Card } from './ui/Card'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Button } from './ui/Button'
import { ModalAvertissementsLegaux } from './ModalAvertissementsLegaux'
import { Check, ChevronRight, ChevronLeft, Copy, Download } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { agentFormStore } from '@/lib/voiceAgent/agentFormStore'

interface FormData {
  // Enfant
  nom_enfant: string
  prenom_enfant: string
  date_naissance: string
  heure_naissance: string
  lieu_naissance: string
  sexe: 'masculin' | 'feminin' | ''
  mairie_id: string
  
  // Père
  nom_pere: string
  prenom_pere: string
  date_naissance_pere: string
  nationalite_pere: string
  profession_pere: string
  
  // Mère
  nom_mere: string
  prenom_mere: string
  date_naissance_mere: string
  nationalite_mere: string
  profession_mere: string
}

export function DeclarationNaissanceForm() {
  const supabase = createClientComponentClient()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [mairies, setMairies] = useState<any[]>([])
  const [codeSuivi, setCodeSuivi] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [accepteConditions, setAccepteConditions] = useState(false)
  const [showModalAvertissements, setShowModalAvertissements] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    nom_enfant: '',
    prenom_enfant: '',
    date_naissance: '',
    heure_naissance: '',
    lieu_naissance: '',
    sexe: '',
    mairie_id: '',
    nom_pere: '',
    prenom_pere: '',
    date_naissance_pere: '',
    nationalite_pere: 'Ivoirienne',
    profession_pere: '',
    nom_mere: '',
    prenom_mere: '',
    date_naissance_mere: '',
    nationalite_mere: 'Ivoirienne',
    profession_mere: ''
  })

  // ─── Pré-remplissage depuis l'agent vocal ─────────────────────
  useEffect(() => {
    const applyPrefill = async () => {
      const p = agentFormStore.prefill
      if (!p) return
      setFormData(prev => ({
        ...prev,
        nom_enfant: p.nom_enfant || prev.nom_enfant,
        prenom_enfant: p.prenom_enfant || prev.prenom_enfant,
        date_naissance: p.date_naissance || prev.date_naissance,
        heure_naissance: p.heure_naissance || prev.heure_naissance,
        lieu_naissance: p.lieu_naissance || prev.lieu_naissance,
        sexe: (p.sexe as any) || prev.sexe,
        nom_pere: p.nom_pere_decl || prev.nom_pere,
        prenom_pere: p.prenom_pere || prev.prenom_pere,
        profession_pere: p.profession_pere || prev.profession_pere,
        nom_mere: p.nom_mere_decl || prev.nom_mere,
        prenom_mere: p.prenom_mere || prev.prenom_mere,
        profession_mere: p.profession_mere || prev.profession_mere,
      }))
      if (p.commune_nom) {
        const { data: mairie } = await supabase
          .from('mairies').select('id').ilike('nom_mairie', `%${p.commune_nom}%`).limit(1).single()
        if (mairie) setFormData(prev => ({ ...prev, mairie_id: mairie.id }))
      }
      agentFormStore.clearPrefill()
    }
    applyPrefill()
  }, [])

  useEffect(() => {
    fetchMairies()
  }, [])

  const fetchMairies = async () => {
    const { data } = await supabase
      .from('mairies')
      .select('id, nom_mairie, ville')
      .order('nom_mairie')
    
    if (data) {
      setMairies(data.map(m => ({
        value: m.id,
        label: `${m.nom_mairie} - ${m.ville}`
      })))
    }
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.nom_enfant &&
          formData.prenom_enfant &&
          formData.date_naissance &&
          formData.heure_naissance &&
          formData.lieu_naissance &&
          formData.sexe &&
          formData.mairie_id
        )
      case 2:
        return !!(
          formData.nom_pere &&
          formData.prenom_pere &&
          formData.date_naissance_pere &&
          formData.nationalite_pere &&
          formData.profession_pere
        )
      case 3:
        return !!(
          formData.nom_mere &&
          formData.prenom_mere &&
          formData.date_naissance_mere &&
          formData.nationalite_mere &&
          formData.profession_mere
        )
      case 4:
        return accepteConditions
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Utiliser l'API pour créer la déclaration (avec audit automatique)
      const response = await fetch('/api/declarations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création de la déclaration')
      }

      const { codeSuivi } = await response.json()

      // Fermer la modale
      setShowModalAvertissements(false)

      setCodeSuivi(codeSuivi)
      setShowConfirmation(true)
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('Erreur lors de la soumission : ' + error.message)
      setShowModalAvertissements(false)
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(codeSuivi)
    alert('✅ Code copié !')
  }

  if (showConfirmation) {
    return (
      <Card className="max-w-2xl mx-auto">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="text-green-600" size={48} />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Déclaration Enregistrée !
          </h2>
          
          <p className="text-gray-600 mb-8">
            Votre déclaration de naissance a été enregistrée avec succès
          </p>

          <div className="bg-gradient-to-r from-orange-50 to-green-50 border-2 border-orange-300 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">Votre code de suivi</p>
            <p className="text-4xl font-bold text-orange-600 mb-4 tracking-wider">
              {codeSuivi}
            </p>
            <p className="text-sm text-gray-500">
              Conservez ce code précieusement. Il vous permettra de suivre l'évolution de votre déclaration.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={copyCode}
              variant="outline"
              className="w-full"
            >
              <Copy size={18} className="mr-2" />
              Copier le code
            </Button>
            
            <Button
              onClick={() => window.location.href = `/suivi?code=${codeSuivi}`}
              variant="primary"
              className="w-full"
            >
              Suivre ma déclaration
            </Button>
            
            <Button
              onClick={() => window.location.href = '/citoyen/mes-declarations'}
              variant="outline"
              className="w-full"
            >
              Voir mes déclarations
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  const steps = [
    { number: 1, title: 'Informations sur l\'enfant' },
    { number: 2, title: 'Informations sur le père' },
    { number: 3, title: 'Informations sur la mère' },
    { number: 4, title: 'Récapitulatif' }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= step.number
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step.number ? <Check size={20} /> : step.number}
                </div>
                <p className="text-xs mt-2 text-center hidden md:block">{step.title}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 ${
                  currentStep > step.number ? 'bg-orange-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card>
        {/* ÉTAPE 1 : Informations sur l'enfant */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              👶 Informations sur l'enfant
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom de l'enfant"
                value={formData.nom_enfant}
                onChange={(e) => handleChange('nom_enfant', e.target.value)}
                required
              />
              
              <Input
                label="Prénom de l'enfant"
                value={formData.prenom_enfant}
                onChange={(e) => handleChange('prenom_enfant', e.target.value)}
                required
              />
              
              <Input
                type="date"
                label="Date de naissance"
                value={formData.date_naissance}
                onChange={(e) => handleChange('date_naissance', e.target.value)}
                required
              />
              
              <Input
                type="time"
                label="Heure de naissance"
                value={formData.heure_naissance}
                onChange={(e) => handleChange('heure_naissance', e.target.value)}
                required
              />
            </div>

            <Input
              label="Lieu de naissance"
              value={formData.lieu_naissance}
              onChange={(e) => handleChange('lieu_naissance', e.target.value)}
              placeholder="Ex: Hôpital Général d'Abidjan"
              required
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sexe <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sexe"
                    value="masculin"
                    checked={formData.sexe === 'masculin'}
                    onChange={(e) => handleChange('sexe', e.target.value)}
                    className="w-4 h-4 text-orange-600"
                  />
                  <span>Masculin</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sexe"
                    value="feminin"
                    checked={formData.sexe === 'feminin'}
                    onChange={(e) => handleChange('sexe', e.target.value)}
                    className="w-4 h-4 text-orange-600"
                  />
                  <span>Féminin</span>
                </label>
              </div>
            </div>

            <Select
              label="Mairie de déclaration"
              value={formData.mairie_id}
              onChange={(e) => handleChange('mairie_id', e.target.value)}
              options={[
                { value: '', label: 'Sélectionner une mairie' },
                ...mairies
              ]}
              required
            />
          </div>
        )}

        {/* ÉTAPE 2 : Informations sur le père */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              👨 Informations sur le père
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom du père"
                value={formData.nom_pere}
                onChange={(e) => handleChange('nom_pere', e.target.value)}
                required
              />
              
              <Input
                label="Prénom du père"
                value={formData.prenom_pere}
                onChange={(e) => handleChange('prenom_pere', e.target.value)}
                required
              />
              
              <Input
                type="date"
                label="Date de naissance du père"
                value={formData.date_naissance_pere}
                onChange={(e) => handleChange('date_naissance_pere', e.target.value)}
                required
              />
              
              <Input
                label="Nationalité du père"
                value={formData.nationalite_pere}
                onChange={(e) => handleChange('nationalite_pere', e.target.value)}
                required
              />
              
              <Input
                label="Profession du père"
                value={formData.profession_pere}
                onChange={(e) => handleChange('profession_pere', e.target.value)}
                placeholder="Ex: Enseignant"
                required
                className="md:col-span-2"
              />
            </div>
          </div>
        )}

        {/* ÉTAPE 3 : Informations sur la mère */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              👩 Informations sur la mère
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom de la mère"
                value={formData.nom_mere}
                onChange={(e) => handleChange('nom_mere', e.target.value)}
                required
              />
              
              <Input
                label="Prénom de la mère"
                value={formData.prenom_mere}
                onChange={(e) => handleChange('prenom_mere', e.target.value)}
                required
              />
              
              <Input
                type="date"
                label="Date de naissance de la mère"
                value={formData.date_naissance_mere}
                onChange={(e) => handleChange('date_naissance_mere', e.target.value)}
                required
              />
              
              <Input
                label="Nationalité de la mère"
                value={formData.nationalite_mere}
                onChange={(e) => handleChange('nationalite_mere', e.target.value)}
                required
              />
              
              <Input
                label="Profession de la mère"
                value={formData.profession_mere}
                onChange={(e) => handleChange('profession_mere', e.target.value)}
                placeholder="Ex: Commerçante"
                required
                className="md:col-span-2"
              />
            </div>
          </div>
        )}

        {/* ÉTAPE 4 : Récapitulatif */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              📋 Récapitulatif de la déclaration
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">👶 Enfant</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><strong>Nom:</strong> {formData.nom_enfant}</p>
                <p><strong>Prénom:</strong> {formData.prenom_enfant}</p>
                <p><strong>Date:</strong> {new Date(formData.date_naissance).toLocaleDateString('fr-FR')}</p>
                <p><strong>Heure:</strong> {formData.heure_naissance}</p>
                <p><strong>Lieu:</strong> {formData.lieu_naissance}</p>
                <p><strong>Sexe:</strong> {formData.sexe === 'masculin' ? 'Masculin' : 'Féminin'}</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-3">👨 Père</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><strong>Nom:</strong> {formData.nom_pere}</p>
                <p><strong>Prénom:</strong> {formData.prenom_pere}</p>
                <p><strong>Date naissance:</strong> {new Date(formData.date_naissance_pere).toLocaleDateString('fr-FR')}</p>
                <p><strong>Nationalité:</strong> {formData.nationalite_pere}</p>
                <p className="col-span-2"><strong>Profession:</strong> {formData.profession_pere}</p>
              </div>
            </div>

            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <h3 className="font-semibold text-pink-900 mb-3">👩 Mère</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><strong>Nom:</strong> {formData.nom_mere}</p>
                <p><strong>Prénom:</strong> {formData.prenom_mere}</p>
                <p><strong>Date naissance:</strong> {new Date(formData.date_naissance_mere).toLocaleDateString('fr-FR')}</p>
                <p><strong>Nationalité:</strong> {formData.nationalite_mere}</p>
                <p className="col-span-2"><strong>Profession:</strong> {formData.profession_mere}</p>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accepteConditions}
                  onChange={(e) => setAccepteConditions(e.target.checked)}
                  className="mt-1 w-5 h-5 text-orange-600"
                />
                <span className="text-sm text-gray-700">
                  Je certifie sur l'honneur que les informations fournies sont exactes et complètes. 
                  Je comprends que toute fausse déclaration peut entraîner des poursuites judiciaires.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Boutons de navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
            >
              <ChevronLeft size={18} className="mr-2" />
              Précédent
            </Button>
          )}
          
          <div className="flex-1" />
          
          {currentStep < 4 ? (
            <Button
              variant="primary"
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!isStepValid(currentStep)}
            >
              Suivant
              <ChevronRight size={18} className="ml-2" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => setShowModalAvertissements(true)}
              disabled={!isStepValid(4) || loading}
            >
              Soumettre la déclaration
            </Button>
          )}
        </div>
      </Card>

      {/* Modale d'avertissements légaux */}
      <ModalAvertissementsLegaux
        isOpen={showModalAvertissements}
        onClose={() => setShowModalAvertissements(false)}
        onAccept={handleSubmit}
        loading={loading}
      />
    </div>
  )
}
