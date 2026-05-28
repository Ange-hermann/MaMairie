import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Génère un code de suivi unique pour une déclaration de naissance (version serveur)
 * Format : NAI-AAAA-XXX-XXXXX
 * Exemple : NAI-2026-ABJ-00412
 * 
 * @param mairieId - ID de la mairie pour récupérer le code
 * @returns Code de suivi unique
 */
export async function generateCodeSuiviServer(mairieId: string): Promise<string> {
  const supabase = createRouteHandlerClient({ cookies })
  
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
