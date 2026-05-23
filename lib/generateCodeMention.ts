import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

/**
 * Génère un code de suivi unique pour un avis de mention
 * Format : MEN-AAAA-XXX-XXXXX
 * Exemple : MEN-2026-ABJ-00001
 */
export async function generateCodeMention(mairieId: string): Promise<string> {
  const supabase = createClientComponentClient()
  
  // Récupérer l'année en cours
  const annee = new Date().getFullYear()
  
  // Récupérer le code de la mairie (3 lettres)
  const { data: mairie } = await supabase
    .from('mairies')
    .select('code_mairie, ville')
    .eq('id', mairieId)
    .single()
  
  // Générer le code mairie (3 premières lettres de la ville en majuscules)
  let codeMairie = 'XXX'
  if (mairie?.code_mairie && mairie.code_mairie.length <= 3) {
    codeMairie = mairie.code_mairie.toUpperCase().substring(0, 3)
  } else if (mairie?.ville) {
    codeMairie = mairie.ville.toUpperCase().substring(0, 3)
  }
  
  // Récupérer le dernier numéro séquentiel pour cette année et cette mairie
  const { data: avis } = await supabase
    .from('avis_mentions')
    .select('code_suivi')
    .like('code_suivi', `MEN-${annee}-${codeMairie}-%`)
    .order('created_at', { ascending: false })
    .limit(1)
  
  let numeroSequentiel = 1
  
  if (avis && avis.length > 0) {
    // Extraire le numéro séquentiel du dernier code
    const parts = avis[0].code_suivi.split('-')
    if (parts.length === 4) {
      const dernierNumero = parseInt(parts[3], 10)
      if (!isNaN(dernierNumero)) {
        numeroSequentiel = dernierNumero + 1
      }
    }
  }
  
  // Formater le numéro sur 5 chiffres (00001, 00002, etc.)
  const numeroFormate = numeroSequentiel.toString().padStart(5, '0')
  
  // Construire le code de suivi
  const codeSuivi = `MEN-${annee}-${codeMairie}-${numeroFormate}`
  
  console.log('✅ Code mention généré:', codeSuivi)
  
  return codeSuivi
}

/**
 * Valide le format d'un code de suivi de mention
 * @param code - Code à valider
 * @returns true si le format est valide
 */
export function validateCodeMention(code: string): boolean {
  // Format standard: MEN-2026-ABJ-00001
  const standardRegex = /^MEN-\d{4}-[A-Z]{2,3}-\d{5}$/
  
  // Format flexible pour codes existants plus longs
  const flexibleRegex = /^MEN-\d{4}-.+-\d+$/
  
  return standardRegex.test(code) || flexibleRegex.test(code)
}

/**
 * Parse un code de suivi pour extraire ses composants
 * @param code - Code à parser
 * @returns Objet avec les composants du code
 */
export function parseCodeMention(code: string) {
  const parts = code.split('-')
  
  if (parts.length !== 4) {
    return null
  }
  
  return {
    type: parts[0], // MEN
    annee: parseInt(parts[1], 10),
    mairie: parts[2],
    numero: parseInt(parts[3], 10)
  }
}

/**
 * Obtient le libellé d'un type de mention
 */
export function getTypeMentionLabel(type: string): string {
  const labels: Record<string, string> = {
    divorce: 'Divorce',
    reconnaissance_paternite: 'Reconnaissance de paternité',
    adoption: 'Adoption',
    changement_nom: 'Changement de nom',
    changement_prenom: 'Changement de prénom',
    deces: 'Décès',
    mariage: 'Mariage',
    annulation: 'Annulation',
    rectification: 'Rectification'
  }
  
  return labels[type] || type
}

/**
 * Obtient les types de mention disponibles selon le type d'acte
 */
export function getTypesMentionParActe(typeActe: string): Array<{ value: string; label: string }> {
  const mentionsParActe: Record<string, Array<{ value: string; label: string }>> = {
    naissance: [
      { value: 'reconnaissance_paternite', label: 'Reconnaissance de paternité' },
      { value: 'adoption', label: 'Adoption' },
      { value: 'changement_nom', label: 'Changement de nom' },
      { value: 'changement_prenom', label: 'Changement de prénom' },
      { value: 'deces', label: 'Décès' },
      { value: 'mariage', label: 'Mariage' },
      { value: 'rectification', label: 'Rectification' }
    ],
    mariage: [
      { value: 'divorce', label: 'Divorce' },
      { value: 'annulation', label: 'Annulation' },
      { value: 'rectification', label: 'Rectification' }
    ],
    deces: [
      { value: 'rectification', label: 'Rectification' }
    ]
  }
  
  return mentionsParActe[typeActe] || []
}
