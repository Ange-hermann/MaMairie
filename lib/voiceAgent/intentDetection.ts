export type IntentType =
  | 'SALUTATION'
  | 'DEMANDE_ACTE_NAISSANCE'
  | 'DEMANDE_ACTE_MARIAGE'
  | 'DEMANDE_ACTE_DECES'
  | 'STATUT_DEMANDE'
  | 'DECLARATION_NAISSANCE'
  | 'RESERVATION_MARIAGE'
  | 'AVIS_MENTION'
  | 'AIDE_DOCUMENTS'
  | 'AU_REVOIR'
  | 'QUESTION_GENERALE'

export interface DetectedIntent {
  type: IntentType
  confidence: number
  entities: Record<string, string>
}

const PATTERNS: Record<IntentType, string[]> = {
  SALUTATION: [
    'bonjour', 'allô', 'salut', 'bonsoir', 'hey', 'hello', 'bonne journée'
  ],
  DEMANDE_ACTE_NAISSANCE: [
    'extrait de naissance', 'acte de naissance', 'certificat de naissance',
    'naissance', 'je suis né', 'né à', 'bulletin de naissance'
  ],
  DEMANDE_ACTE_MARIAGE: [
    'acte de mariage', 'extrait de mariage', 'certificat de mariage',
    'mariage', 'marié', 'union', 'époux', 'épouse'
  ],
  DEMANDE_ACTE_DECES: [
    'acte de décès', 'extrait de décès', 'certificat de décès',
    'décès', 'mort', 'décédé', 'disparu'
  ],
  STATUT_DEMANDE: [
    'statut', 'où en est', 'avancement', 'ma demande', 'code de suivi',
    'suivi', 'prête', 'terminée', 'validée', 'approuvée'
  ],
  DECLARATION_NAISSANCE: [
    'déclarer', 'déclaration', 'nouveau-né', 'bébé', 'vient de naître',
    'naissance à déclarer', 'enregistrer naissance'
  ],
  RESERVATION_MARIAGE: [
    'réserver', 'réservation mariage', 'se marier', 'cérémonie',
    'date de mariage', 'planifier mariage'
  ],
  AVIS_MENTION: [
    'mention', 'avis de mention', 'modifier acte', 'annotation',
    'divorce', 'séparation', 'adoption'
  ],
  AIDE_DOCUMENTS: [
    'document', 'pièce', 'justificatif', 'besoin de', 'apporter',
    'fournir', 'dossier', 'qu\'est-ce qu\'il faut'
  ],
  AU_REVOIR: [
    'au revoir', 'merci', 'bonne journée', 'à bientôt', 'bye',
    'c\'est tout', 'j\'ai fini', 'arrête', 'stop', 'ferme'
  ],
  QUESTION_GENERALE: []
}

export function detectIntent(text: string): DetectedIntent {
  const normalized = text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // supprimer accents pour comparaison

  let bestIntent: IntentType = 'QUESTION_GENERALE'
  let bestScore = 0

  for (const [intent, keywords] of Object.entries(PATTERNS)) {
    let score = 0
    for (const keyword of keywords) {
      const normalizedKeyword = keyword
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
      if (normalized.includes(normalizedKeyword)) {
        score += keyword.split(' ').length // mots multiples = score plus élevé
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestIntent = intent as IntentType
    }
  }

  // Extraire entités utiles
  const entities: Record<string, string> = {}

  // Chercher un code de suivi (format DEC-XXXX-XXXXXX)
  const codeMatch = text.match(/[A-Z]{2,4}-\d{4}-[A-Z0-9]+/i)
  if (codeMatch) entities.codeSuivi = codeMatch[0].toUpperCase()

  return {
    type: bestIntent,
    confidence: bestScore > 0 ? Math.min(bestScore / 3, 1) : 0,
    entities
  }
}
