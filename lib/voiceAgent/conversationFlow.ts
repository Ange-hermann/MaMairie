// Gestionnaire de flux conversationnel guidé pour l'agent vocal

export type FlowType = 'DEMANDE_ACTE' | 'DECLARATION_NAISSANCE' | 'RESERVATION_MARIAGE' | 'SUIVI_DEMANDE' | null

// Convertir une date texte en YYYY-MM-DD
function parseDate(text: string): string {
  const mois: Record<string, string> = {
    janvier: '01', fevrier: '02', 'février': '02', mars: '03', avril: '04',
    mai: '05', juin: '06', juillet: '07', 'août': '08', aout: '08',
    septembre: '09', octobre: '10', novembre: '11', 'décembre': '12', decembre: '12'
  }
  // Format: "15 mars 1990" ou "15/03/1990" ou "1990-03-15"
  const matchTexte = text.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/i)
  if (matchTexte) {
    const jour = matchTexte[1].padStart(2, '0')
    const moisStr = matchTexte[2].toLowerCase()
    const annee = matchTexte[3]
    const moisNum = mois[moisStr] || '01'
    return `${annee}-${moisNum}-${jour}`
  }
  // Format: "15/03/1990" ou "15-03-1990"
  const matchSlash = text.match(/(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})/)
  if (matchSlash) {
    return `${matchSlash[3]}-${matchSlash[2].padStart(2,'0')}-${matchSlash[1].padStart(2,'0')}`
  }
  // Déjà au bon format
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text
  return text
}

export type FlowStep = {
  field: string
  question: string
  validate?: (value: string) => boolean
  errorMsg?: string
}

export type CollectedData = Record<string, string>

// Étapes communes (type non encore connu)
const STEP_TYPE_ACTE: FlowStep = {
  field: 'type_acte',
  question: 'Quel type d\'acte souhaitez-vous ? Dites "naissance", "mariage" ou "décès".',
  validate: (v) => /naissance|mariage|d[eé]c[eè]s/i.test(v),
  errorMsg: 'Dites "naissance", "mariage" ou "décès".'
}

const STEP_NOM: FlowStep = {
  field: 'nom',
  question: 'Quel est le nom de famille figurant sur l\'acte ?',
  validate: (v) => v.trim().length >= 2,
  errorMsg: 'Le nom doit contenir au moins 2 caractères.'
}

const STEP_PRENOM: FlowStep = {
  field: 'prenom',
  question: 'Et le prénom ?',
  validate: (v) => v.trim().length >= 2,
  errorMsg: 'Le prénom doit contenir au moins 2 caractères.'
}

const STEP_TEL: FlowStep = {
  field: 'telephone',
  question: 'Quel est votre numéro de téléphone pour être notifié ?',
  validate: (v) => v.replace(/\s/g, '').length >= 8,
  errorMsg: 'Veuillez donner un numéro valide.'
}

const STEP_COMMUNE: FlowStep = {
  field: 'commune_nom',
  question: 'Dans quelle commune souhaitez-vous déposer votre demande ? Par exemple : "Cocody", "Yopougon", "Abobo".',
  validate: (v) => v.trim().length >= 2,
  errorMsg: 'Veuillez préciser la commune.'
}

// Étapes déclaration de naissance
const STEPS_DECLARATION_NAISSANCE: FlowStep[] = [
  { field: 'nom_enfant', question: 'Quel est le nom de l\'enfant ?', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez le nom.' },
  { field: 'prenom_enfant', question: 'Et le prénom de l\'enfant ?', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez le prénom.' },
  { field: 'date_naissance', question: 'Quelle est la date de naissance ? Ex : "15 mars 2024".', validate: (v) => v.trim().length >= 4, errorMsg: 'Précisez la date.' },
  { field: 'heure_naissance', question: 'À quelle heure est-il né ? Ex : "14h30".', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez l\'heure.' },
  { field: 'lieu_naissance', question: 'Quel est le lieu de naissance ? Ex : "Hôpital Général d\'Abidjan".', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez le lieu.' },
  { field: 'sexe', question: 'Quel est le sexe de l\'enfant ? Dites "masculin" ou "féminin".', validate: (v) => /masculin|f[eé]minin/i.test(v), errorMsg: 'Dites "masculin" ou "féminin".' },
  { field: 'nom_pere_decl', question: 'Quel est le nom du père ?', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez le nom.' },
  { field: 'prenom_pere', question: 'Et le prénom du père ?', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez le prénom.' },
  { field: 'profession_pere', question: 'Quelle est la profession du père ?', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez la profession.' },
  { field: 'nom_mere_decl', question: 'Quel est le nom de la mère ?', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez le nom.' },
  { field: 'prenom_mere', question: 'Et le prénom de la mère ?', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez le prénom.' },
  { field: 'profession_mere', question: 'Quelle est la profession de la mère ?', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez la profession.' },
  STEP_COMMUNE
]

// Étapes réservation de mariage
const STEPS_RESERVATION_MARIAGE: FlowStep[] = [
  { field: 'nom_epoux', question: 'Quel est le nom de l\'époux ?', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez le nom.' },
  { field: 'prenom_epoux', question: 'Et le prénom de l\'époux ?', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez le prénom.' },
  { field: 'date_naissance_epoux', question: 'Quelle est la date de naissance de l\'époux ?', validate: (v) => v.trim().length >= 4, errorMsg: 'Précisez la date.' },
  { field: 'lieu_naissance_epoux', question: 'Quel est le lieu de naissance de l\'époux ?', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez le lieu.' },
  { field: 'profession_epoux', question: 'Quelle est la profession de l\'époux ?', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez la profession.' },
  { field: 'nom_epouse', question: 'Quel est le nom de l\'épouse ?', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez le nom.' },
  { field: 'prenom_epouse', question: 'Et le prénom de l\'épouse ?', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez le prénom.' },
  { field: 'date_naissance_epouse', question: 'Quelle est la date de naissance de l\'épouse ?', validate: (v) => v.trim().length >= 4, errorMsg: 'Précisez la date.' },
  { field: 'lieu_naissance_epouse', question: 'Quel est le lieu de naissance de l\'épouse ?', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez le lieu.' },
  { field: 'profession_epouse', question: 'Quelle est la profession de l\'épouse ?', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez la profession.' },
  { field: 'date_mariage_souhaitee', question: 'Quelle est la date souhaitée pour le mariage ?', validate: (v) => v.trim().length >= 4, errorMsg: 'Précisez la date.' },
  STEP_COMMUNE
]

const STEP_NUMERO_ACTE: FlowStep = {
  field: 'numero_acte',
  question: 'Quel est le numéro de l\'acte ? Il se trouve sur votre ancien document d\'état civil. Dites "inconnu" si vous ne l\'avez pas.',
  validate: (v) => v.trim().length >= 2,
  errorMsg: 'Veuillez préciser le numéro ou dire "inconnu".'
}

// Étapes selon le type d'acte
const STEPS_NAISSANCE: FlowStep[] = [
  STEP_NUMERO_ACTE, STEP_NOM, STEP_PRENOM,
  { field: 'date_naissance', question: 'Quelle est la date de naissance ? Ex : "15 mars 1990".', validate: (v) => v.trim().length >= 4, errorMsg: 'Précisez la date.' },
  { field: 'lieu_naissance', question: 'Quel est le lieu de naissance ?', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez le lieu.' },
  { field: 'nom_pere', question: 'Quel est le nom du père ? Dites "inconnu" si non disponible.', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez le nom du père.' },
  { field: 'nom_mere', question: 'Et le nom de la mère ?', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez le nom de la mère.' },
  STEP_TEL, STEP_COMMUNE
]

const STEPS_MARIAGE: FlowStep[] = [
  STEP_NUMERO_ACTE, STEP_NOM, STEP_PRENOM,
  { field: 'nom_conjoint', question: 'Quel est le nom du conjoint ou de la conjointe ?', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez le nom du conjoint.' },
  { field: 'prenom_conjoint', question: 'Et le prénom du conjoint ?', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez le prénom.' },
  { field: 'date_mariage', question: 'Quelle est la date du mariage ?', validate: (v) => v.trim().length >= 4, errorMsg: 'Précisez la date.' },
  { field: 'lieu_mariage', question: 'Quel est le lieu du mariage ?', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez le lieu.' },
  STEP_TEL, STEP_COMMUNE
]

const STEPS_DECES: FlowStep[] = [
  STEP_NUMERO_ACTE, STEP_NOM, STEP_PRENOM,
  { field: 'date_naissance', question: 'Quelle est la date de naissance du défunt ?', validate: (v) => v.trim().length >= 4, errorMsg: 'Précisez la date.' },
  { field: 'date_deces', question: 'Quelle est la date du décès ?', validate: (v) => v.trim().length >= 4, errorMsg: 'Précisez la date.' },
  { field: 'lieu_deces', question: 'Quel est le lieu du décès ?', validate: (v) => v.trim().length >= 2, errorMsg: 'Précisez le lieu.' },
  STEP_TEL, STEP_COMMUNE
]

// Étapes pour suivi d'une demande
const STEPS_SUIVI: FlowStep[] = [
  {
    field: 'code_suivi',
    question: 'Quel est votre code de suivi ?',
    validate: (v) => v.trim().length >= 4,
    errorMsg: 'Je n\'ai pas reconnu ce code.'
  }
]

export class ConversationFlowManager {
  private activeFlow: FlowType = null
  private currentStepIndex = 0
  private collectedData: CollectedData = {}
  private steps: FlowStep[] = []
  lastFlow: FlowType = null

  private getStepsForType(type: string): FlowStep[] {
    if (/mariage/i.test(type)) return STEPS_MARIAGE
    if (/d[eé]c[eè]s|deces/i.test(type)) return STEPS_DECES
    return STEPS_NAISSANCE
  }

  startFlow(flow: FlowType, prefilledType?: string): string {
    this.activeFlow = flow
    this.lastFlow = flow
    this.currentStepIndex = 0
    this.collectedData = {}

    if (flow === 'SUIVI_DEMANDE') {
      this.steps = STEPS_SUIVI
      return 'Je vais vérifier votre demande. ' + STEPS_SUIVI[0].question
    }

    if (flow === 'DECLARATION_NAISSANCE') {
      this.steps = STEPS_DECLARATION_NAISSANCE
      return 'Je vais vous aider à déclarer la naissance. ' + STEPS_DECLARATION_NAISSANCE[0].question
    }

    if (flow === 'RESERVATION_MARIAGE') {
      this.steps = STEPS_RESERVATION_MARIAGE
      return 'Je vais vous aider à réserver votre mariage. ' + STEPS_RESERVATION_MARIAGE[0].question
    }

    if (flow === 'DEMANDE_ACTE') {
      if (prefilledType) {
        this.collectedData['type_acte'] = prefilledType
        this.steps = this.getStepsForType(prefilledType)
        return `Je vais vous aider à faire votre demande d'extrait de ${prefilledType}. ${this.steps[0].question}`
      }
      this.steps = [STEP_TYPE_ACTE]
      return 'Je vais vous aider à faire votre demande d\'extrait d\'acte. ' + STEP_TYPE_ACTE.question
    }

    return ''
  }

  get isInFlow(): boolean {
    return this.activeFlow !== null
  }

  get data(): CollectedData {
    return this.collectedData
  }

  processAnswer(answer: string): { reply: string; completed: boolean; data?: CollectedData } {
    if (!this.activeFlow || this.steps.length === 0) {
      return { reply: '', completed: false }
    }

    const step = this.steps[this.currentStepIndex]

    if (step.validate && !step.validate(answer)) {
      return { reply: step.errorMsg || 'Je n\'ai pas compris. Pouvez-vous répéter ?', completed: false }
    }

    let value = answer.trim()

    // Si c'était la question du type d'acte, charger les vraies étapes
    if (step.field === 'type_acte') {
      if (/naissance/i.test(value)) value = 'naissance'
      else if (/mariage/i.test(value)) value = 'mariage'
      else value = 'deces'

      this.collectedData['type_acte'] = value
      // Remplacer les étapes par celles du bon type
      this.steps = this.getStepsForType(value)
      this.currentStepIndex = 0
      return { reply: this.steps[0].question, completed: false }
    }

    // Convertir les dates en format YYYY-MM-DD pour les champs date
    const dateFields = [
      'date_naissance', 'date_mariage', 'date_deces',
      'date_naissance_pere', 'date_naissance_mere',
      'date_naissance_epoux', 'date_naissance_epouse',
      'date_mariage_souhaitee'
    ]
    if (dateFields.includes(step.field)) {
      value = parseDate(value)
    }

    this.collectedData[step.field] = value
    this.currentStepIndex++

    if (this.currentStepIndex >= this.steps.length) {
      const data = { ...this.collectedData }
      const type = data.type_acte || 'naissance'
      const summary = `Parfait ! J'ouvre le formulaire pour ${data.prenom || ''} ${data.nom || ''}. Il ne reste plus qu'à joindre votre document et soumettre.`
      this.reset()
      return { reply: summary, completed: true, data }
    }

    return { reply: this.steps[this.currentStepIndex].question, completed: false }
  }

  cancelFlow(): string {
    this.reset()
    return 'D\'accord, j\'annule. Comment puis-je vous aider autrement ?'
  }

  reset(): void {
    this.activeFlow = null
    this.currentStepIndex = 0
    this.collectedData = {}
    this.steps = []
  }
}
