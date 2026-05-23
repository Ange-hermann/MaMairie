import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

/**
 * Génère un code de suivi unique pour une déclaration de naissance
 * Format : NAI-AAAA-XXX-XXXXX
 * Exemple : NAI-2026-ABJ-00412
 * 
 * @param mairieId - ID de la mairie pour récupérer le code
 * @returns Code de suivi unique
 */
export async function generateCodeSuivi(mairieId: string): Promise<string> {
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
  const { data: declarations } = await supabase
    .from('declarations_naissance')
    .select('code_suivi')
    .like('code_suivi', `NAI-${annee}-${codeMairie}-%`)
    .order('created_at', { ascending: false })
    .limit(1)
  
  let numeroSequentiel = 1
  
  if (declarations && declarations.length > 0) {
    // Extraire le numéro séquentiel du dernier code
    const parts = declarations[0].code_suivi.split('-')
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
  const codeSuivi = `NAI-${annee}-${codeMairie}-${numeroFormate}`
  
  console.log('✅ Code généré:', codeSuivi)
  
  return codeSuivi
}

/**
 * Valide le format d'un code de suivi
 * @param code - Code à valider
 * @returns true si le format est valide
 */
export function validateCodeSuivi(code: string): boolean {
  // Format standard: NAI-2026-ABJ-00001
  const standardRegex = /^NAI-\d{4}-[A-Z]{2,3}-\d{5}$/
  
  // Format flexible pour codes existants plus longs
  const flexibleRegex = /^NAI-\d{4}-.+-\d+$/
  
  return standardRegex.test(code) || flexibleRegex.test(code)
}

/**
 * Extrait les informations d'un code de suivi
 * @param code - Code de suivi
 * @returns Objet avec année, code mairie et numéro
 */
export function parseCodeSuivi(code: string): {
  type: string
  annee: number
  codeMairie: string
  numero: number
} | null {
  if (!validateCodeSuivi(code)) {
    return null
  }
  
  const parts = code.split('-')
  
  return {
    type: parts[0],
    annee: parseInt(parts[1], 10),
    codeMairie: parts[2],
    numero: parseInt(parts[3], 10)
  }
}
