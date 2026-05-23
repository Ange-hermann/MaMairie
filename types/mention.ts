export type TypeActeMention = 'naissance' | 'mariage' | 'deces'

export type TypeMention = 
  | 'divorce'
  | 'reconnaissance_paternite'
  | 'adoption'
  | 'changement_nom'
  | 'changement_prenom'
  | 'deces'
  | 'mariage'
  | 'annulation'
  | 'rectification'

export type StatutMention = 'en_attente' | 'en_traitement' | 'approuvee' | 'rejetee'

export interface AvisMention {
  id: string
  code_suivi: string
  
  // Demandeur
  citoyen_id: string
  
  // Acte cible
  type_acte_cible: TypeActeMention
  numero_acte_cible: string
  mairie_id: string
  annee_acte_cible: number
  
  // Détails de la mention
  type_mention: TypeMention
  description_mention: string
  date_evenement: string
  
  // Pièces justificatives
  pieces_justificatives: string[]
  
  // Gestion
  statut: StatutMention
  motif_rejet?: string
  agent_id?: string
  date_traitement?: string
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface MentionApposee {
  id: string
  avis_mention_id: string
  
  // Acte annoté
  type_acte: TypeActeMention
  acte_id: string
  
  // Mention
  type_mention: TypeMention
  texte_mention: string
  date_mention: string
  
  // Agent
  agent_id: string
  date_apposition: string
  
  created_at: string
}

export interface AvisMentionFormData {
  // Étape 1
  type_acte_cible: TypeActeMention | ''
  numero_acte_cible: string
  mairie_id: string
  annee_acte_cible: string
  
  // Étape 2
  type_mention: TypeMention | ''
  description_mention: string
  date_evenement: string
  pieces_justificatives: File[]
  
  // Validation
  acte_verifie: boolean
  acte_info?: any
}
