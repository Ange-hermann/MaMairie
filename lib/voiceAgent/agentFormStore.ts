// Store global partagé entre l'agent vocal et les formulaires
// L'agent écrit ici, les pages lisent et pré-remplissent les champs

type FormPrefill = {
  // Commun
  service?: 'demande_extrait' | 'declaration_naissance' | 'reservation_mariage'
  commune_nom?: string

  // Demande extrait
  type_acte?: 'naissance' | 'mariage' | 'deces'
  numero_acte?: string
  nom?: string
  prenom?: string
  date_naissance?: string
  lieu_naissance?: string
  nom_pere?: string
  nom_mere?: string
  telephone?: string
  nom_conjoint?: string
  prenom_conjoint?: string
  date_mariage?: string
  lieu_mariage?: string
  date_deces?: string
  lieu_deces?: string
  cause_deces?: string

  // Déclaration de naissance
  nom_enfant?: string
  prenom_enfant?: string
  heure_naissance?: string
  sexe?: string
  nom_pere_decl?: string
  prenom_pere?: string
  date_naissance_pere?: string
  nationalite_pere?: string
  profession_pere?: string
  nom_mere_decl?: string
  prenom_mere?: string
  date_naissance_mere?: string
  nationalite_mere?: string
  profession_mere?: string

  // Réservation mariage
  nom_epoux?: string
  prenom_epoux?: string
  date_naissance_epoux?: string
  lieu_naissance_epoux?: string
  profession_epoux?: string
  nom_epouse?: string
  prenom_epouse?: string
  date_naissance_epouse?: string
  lieu_naissance_epouse?: string
  profession_epouse?: string
  date_mariage_souhaitee?: string
}

type AgentFormStore = {
  prefill: FormPrefill | null
  setPrefill: (data: FormPrefill) => void
  clearPrefill: () => void
  listeners: Set<() => void>
  subscribe: (fn: () => void) => () => void
}

// Singleton global — survit aux navigations client
const store: AgentFormStore = {
  prefill: null,
  listeners: new Set(),

  setPrefill(data: FormPrefill) {
    this.prefill = data
    this.listeners.forEach(fn => fn())
  },

  clearPrefill() {
    this.prefill = null
  },

  subscribe(fn: () => void) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }
}

export const agentFormStore = store
