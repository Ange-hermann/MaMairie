'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { ModalAvertissementsLegaux } from '@/components/ModalAvertissementsLegaux'
import { 
  FileText, 
  CheckCircle, 
  Upload, 
  X, 
  AlertCircle,
  Copy,
  Download
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { generateCodeMention, getTypesMentionParActe, getTypeMentionLabel } from '@/lib/generateCodeMention'
import type { AvisMentionFormData } from '@/types/mention'

export function AvisMentionForm() {
  const supabase = createClientComponentClient()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [verifyingActe, setVerifyingActe] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [codeSuivi, setCodeSuivi] = useState('')
  const [error, setError] = useState('')
  const [showModalAvertissements, setShowModalAvertissements] = useState(false)
  
  const [formData, setFormData] = useState<AvisMentionFormData>({
    type_acte_cible: '',
    numero_acte_cible: '',
    mairie_id: '',
    annee_acte_cible: new Date().getFullYear().toString(),
    type_mention: '',
    description_mention: '',
    date_evenement: '',
    pieces_justificatives: [],
    acte_verifie: false,
    acte_info: null
  })
  
  const [mairies, setMairies] = useState<any[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [acceptTerms, setAcceptTerms] = useState(false)

  // Charger les mairies
  const fetchMairies = async () => {
    const { data } = await supabase
      .from('mairies')
      .select('id, nom_mairie, ville')
      .order('ville')
    
    if (data) {
      setMairies(data)
    }
  }

  // Vérifier l'existence de l'acte
  const handleVerifierActe = async () => {
    if (!formData.type_acte_cible || !formData.numero_acte_cible || !formData.annee_acte_cible) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }

    setVerifyingActe(true)
    setError('')

    try {
      const tableName = formData.type_acte_cible === 'naissance' ? 'naissances' :
                       formData.type_acte_cible === 'mariage' ? 'mariages' : 'deces'

      const { data, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .eq('numero_acte', formData.numero_acte_cible)
        .eq('annee', parseInt(formData.annee_acte_cible))
        .single()

      if (fetchError || !data) {
        setError('Acte non trouvé. Vérifiez le numéro et l\'année.')
        setFormData({ ...formData, acte_verifie: false, acte_info: null })
        return
      }

      setFormData({ ...formData, acte_verifie: true, acte_info: data, mairie_id: data.mairie_id })
      alert('✅ Acte trouvé et vérifié !')
    } catch (err) {
      console.error('Erreur:', err)
      setError('Erreur lors de la vérification')
    } finally {
      setVerifyingActe(false)
    }
  }

  // Upload des fichiers
  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return
    
    if (uploadedFiles.length + files.length > 5) {
      alert('Maximum 5 fichiers autorisés')
      return
    }

    setUploadingFiles(true)
    const newUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${i}.${fileExt}`
        const filePath = `mentions/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath)

        newUrls.push(publicUrl)
      }

      setUploadedFiles([...uploadedFiles, ...newUrls])
    } catch (err: any) {
      console.error('Erreur upload:', err)
      alert('Erreur lors de l\'upload: ' + err.message)
    } finally {
      setUploadingFiles(false)
    }
  }

  // Supprimer un fichier
  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
  }

  // Ouvrir la modale d'avertissements
  const handleSubmit = () => {
    if (!acceptTerms) {
      alert('Veuillez accepter la certification')
      return
    }
    setShowModalAvertissements(true)
  }

  // Soumettre après acceptation des conditions
  const handleAcceptConditions = async () => {
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      // Générer le code de suivi
      const code = await generateCodeMention(formData.mairie_id)

      // Insérer l'avis de mention
      const { error: insertError } = await supabase
        .from('avis_mentions')
        .insert([{
          code_suivi: code,
          citoyen_id: user.id,
          type_acte_cible: formData.type_acte_cible,
          numero_acte_cible: formData.numero_acte_cible,
          mairie_id: formData.mairie_id,
          annee_acte_cible: parseInt(formData.annee_acte_cible),
          type_mention: formData.type_mention,
          description_mention: formData.description_mention,
          date_evenement: formData.date_evenement,
          pieces_justificatives: uploadedFiles,
          statut: 'en_attente',
          conditions_acceptees: true,
          date_acceptation_conditions: new Date().toISOString()
        }])

      if (insertError) throw insertError

      setShowModalAvertissements(false)
      setCodeSuivi(code)
      setSubmitted(true)
    } catch (err: any) {
      console.error('Erreur:', err)
      setError('Erreur lors de la soumission: ' + err.message)
      setShowModalAvertissements(false)
    } finally {
      setLoading(false)
    }
  }

  // Copier le code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSuivi)
    alert('✅ Code copié !')
  }

  // Validation par étape
  const canGoToStep2 = formData.acte_verifie && formData.type_acte_cible && formData.numero_acte_cible
  const canGoToStep3 = canGoToStep2 && formData.type_mention && formData.description_mention && formData.date_evenement

  // Si soumis, afficher la confirmation
  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={48} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ✅ Avis de mention soumis !
          </h2>
          
          <p className="text-gray-600 mb-6">
            Votre demande d'avis de mention a été enregistrée avec succès.
          </p>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">Votre code de suivi :</p>
            <div className="flex items-center justify-center gap-3">
              <p className="text-2xl font-mono font-bold text-orange-600">
                {codeSuivi}
              </p>
              <button
                onClick={handleCopyCode}
                className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
                title="Copier le code"
              >
                <Copy size={20} className="text-orange-600" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Conservez ce code pour suivre votre demande
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => window.location.href = `/suivi-mention?code=${codeSuivi}`}
            >
              🔍 Suivre ma demande
            </Button>
            <Button
              variant="primary"
              onClick={() => window.location.href = '/citoyen/mes-mentions'}
            >
              📋 Voir mes demandes
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex-1">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= step 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? 'bg-orange-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
              <p className="text-xs mt-2 text-center">
                {step === 1 && 'Identifier l\'acte'}
                {step === 2 && 'Détails mention'}
                {step === 3 && 'Confirmation'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Contenu des étapes */}
      <Card>
        {/* ÉTAPE 1 */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              📄 Identifier l'acte à annoter
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'acte *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'naissance', label: '👶 Naissance', icon: '👶' },
                    { value: 'mariage', label: '💑 Mariage', icon: '💑' },
                    { value: 'deces', label: '⚰️ Décès', icon: '⚰️' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => {
                        setFormData({ ...formData, type_acte_cible: type.value as any, acte_verifie: false })
                        fetchMairies()
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.type_acte_cible === type.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{type.icon}</div>
                      <div className="text-sm font-medium">{type.label.replace(type.icon + ' ', '')}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Numéro de l'acte"
                value={formData.numero_acte_cible}
                onChange={(e) => setFormData({ ...formData, numero_acte_cible: e.target.value, acte_verifie: false })}
                placeholder="Ex: 1234567890"
                required
              />

              <Input
                label="Année de l'acte"
                type="number"
                value={formData.annee_acte_cible}
                onChange={(e) => setFormData({ ...formData, annee_acte_cible: e.target.value, acte_verifie: false })}
                required
              />

              <Button
                onClick={handleVerifierActe}
                disabled={verifyingActe || !formData.type_acte_cible || !formData.numero_acte_cible}
                className="w-full"
              >
                {verifyingActe ? 'Vérification...' : '🔍 Vérifier l\'acte'}
              </Button>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {formData.acte_verifie && formData.acte_info && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="text-green-600" size={20} />
                    <p className="font-semibold text-green-900">Acte trouvé et vérifié</p>
                  </div>
                  <div className="text-sm text-gray-700 space-y-1">
                    {formData.type_acte_cible === 'naissance' && (
                      <>
                        <p><strong>Nom :</strong> {formData.acte_info.nom_enfant}</p>
                        <p><strong>Prénom :</strong> {formData.acte_info.prenom_enfant}</p>
                        <p><strong>Date naissance :</strong> {new Date(formData.acte_info.date_naissance).toLocaleDateString('fr-FR')}</p>
                      </>
                    )}
                    {formData.type_acte_cible === 'mariage' && (
                      <>
                        <p><strong>Époux :</strong> {formData.acte_info.prenom_epoux} {formData.acte_info.nom_epoux}</p>
                        <p><strong>Épouse :</strong> {formData.acte_info.prenom_epouse} {formData.acte_info.nom_epouse}</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!canGoToStep2}
              >
                Suivant →
              </Button>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              📝 Détails de la mention
            </h2>

            <Select
              label="Type de mention"
              value={formData.type_mention}
              onChange={(e) => setFormData({ ...formData, type_mention: e.target.value as any })}
              options={[
                { value: '', label: 'Sélectionnez un type' },
                ...getTypesMentionParActe(formData.type_acte_cible)
              ]}
              required
            />

            <Input
              label="Date de l'événement"
              type="date"
              value={formData.date_evenement}
              onChange={(e) => setFormData({ ...formData, date_evenement: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description / Détails *
              </label>
              <textarea
                value={formData.description_mention}
                onChange={(e) => setFormData({ ...formData, description_mention: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                rows={4}
                placeholder="Décrivez les détails de la mention à apposer..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pièces justificatives (max 5 fichiers)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto mb-3 text-gray-400" size={48} />
                <p className="text-sm text-gray-600 mb-3">
                  Glissez vos fichiers ici ou cliquez pour sélectionner
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <span className="inline-block">
                    <Button
                      variant="outline"
                      disabled={uploadingFiles}
                    >
                      {uploadingFiles ? 'Upload en cours...' : 'Sélectionner des fichiers'}
                    </Button>
                  </span>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((url, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText size={20} className="text-gray-600" />
                        <span className="text-sm text-gray-700">Fichier {index + 1}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                ← Précédent
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!canGoToStep3}
              >
                Suivant →
              </Button>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              ✅ Récapitulatif et confirmation
            </h2>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">📄 Acte à annoter</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Type :</strong> {formData.type_acte_cible}</p>
                  <p><strong>Numéro :</strong> {formData.numero_acte_cible}</p>
                  <p><strong>Année :</strong> {formData.annee_acte_cible}</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">📝 Mention</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Type :</strong> {getTypeMentionLabel(formData.type_mention)}</p>
                  <p><strong>Date événement :</strong> {new Date(formData.date_evenement).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Description :</strong> {formData.description_mention}</p>
                  <p><strong>Pièces jointes :</strong> {uploadedFiles.length} fichier(s)</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  Je certifie l'exactitude des informations fournies et comprends que toute fausse déclaration peut entraîner des poursuites judiciaires.
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
              >
                ← Précédent
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !acceptTerms}
                variant="primary"
              >
                Soumettre l'avis de mention
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modale d'avertissements légaux */}
      <ModalAvertissementsLegaux
        isOpen={showModalAvertissements}
        onClose={() => setShowModalAvertissements(false)}
        onAccept={handleAcceptConditions}
        loading={loading}
      />
    </div>
  )
}
