// ═══════════════════════════════════════════════════════════════
// TYPES TYPESCRIPT - SYSTÈME D'AUDIT
// Plateforme MaMairie - République de Côte d'Ivoire
// ═══════════════════════════════════════════════════════════════

// Types d'actions d'audit
export type AuditActionType =
  // AUTHENTIFICATION
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILED'
  | 'AUTH_LOGOUT'
  | 'AUTH_PASSWORD_RESET'
  // CITOYENS
  | 'CITOYEN_DEMANDE_CREEE'
  | 'CITOYEN_DEMANDE_ANNULEE'
  | 'CITOYEN_DECLARATION_CREEE'
  | 'CITOYEN_MENTION_SOUMISE'
  | 'CITOYEN_PAIEMENT_EFFECTUE'
  // AGENTS
  | 'AGENT_DEMANDE_APPROUVEE'
  | 'AGENT_DEMANDE_REJETEE'
  | 'AGENT_ACTE_CREE'
  | 'AGENT_ACTE_MODIFIE'
  | 'AGENT_MENTION_APPROUVEE'
  | 'AGENT_MENTION_REJETEE'
  | 'AGENT_PDF_GENERE'
  | 'AGENT_DOCUMENTS_VERIFIES'
  // MINISTÈRE
  | 'MINISTERE_ACTE_VERIFIE'
  | 'MINISTERE_ALERTE_CREEE'
  | 'MINISTERE_RAPPORT_EXPORTE'
  | 'MINISTERE_MAIRIE_CREEE'
  | 'MINISTERE_AGENT_CREE'
  | 'MINISTERE_STATISTIQUES_CONSULTEES'
  // FRAUDE
  | 'FRAUDE_TENTATIVE_DETECTEE'
  | 'FRAUDE_ALERTE_DECLENCHEE'
  | 'FRAUDE_ACTE_INVALIDE'
  | 'FRAUDE_QR_INVALIDE'

// Statut d'une action
export type AuditStatut = 'SUCCESS' | 'FAILED' | 'WARNING'

// Rôle utilisateur
export type UserRole = 'citoyen' | 'agent' | 'ministere' | 'system'

// Détails de l'action (structure JSONB)
export interface AuditActionDetails {
  avant?: Record<string, any>
  apres?: Record<string, any>
  metadata?: Record<string, any>
}

// Paramètres pour créer un log d'audit
export interface AuditLogParams {
  actionType: AuditActionType
  userId?: string
  userEmail?: string
  userRole?: UserRole
  userNom?: string
  entiteType?: string
  entiteId?: string
  entiteReference?: string
  actionDetails?: AuditActionDetails
  statut?: AuditStatut
  message?: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
}

// Structure complète d'un log d'audit
export interface AuditLog {
  id: string
  action_type: AuditActionType
  user_id: string | null
  user_email: string | null
  user_role: UserRole | null
  user_nom: string | null
  ip_address: string | null
  user_agent: string | null
  session_id: string | null
  entite_type: string | null
  entite_id: string | null
  entite_reference: string | null
  action_details: AuditActionDetails
  statut: AuditStatut
  message: string | null
  created_at: string
}

// Session active
export interface SessionActive {
  id: string
  user_id: string
  user_email: string | null
  user_role: UserRole | null
  ip_address: string | null
  user_agent: string | null
  started_at: string
  last_activity: string
  ended_at: string | null
  statut: 'active' | 'expired' | 'terminated'
}

// IP bloquée
export interface IpBloquee {
  id: string
  ip_address: string
  raison: string
  bloque_par: string | null
  bloque_le: string
  expire_le: string | null
  statut: 'active' | 'expire'
}

// Filtres pour la recherche d'audit
export interface AuditFilters {
  dateDebut?: string
  dateFin?: string
  actionTypes?: AuditActionType[]
  userRole?: UserRole
  mairieId?: string
  statut?: AuditStatut
  searchTerm?: string
  ipAddress?: string
  limit?: number
  offset?: number
}

// Statistiques d'audit
export interface AuditStats {
  totalAujourdhui: number
  tentativesEchouees: number
  alertesFraude: number
  utilisateursConnectes: number
}

// Tentative suspecte détectée
export interface TentativeSuspecte {
  ip: string
  nb_tentatives: number
  nb_echecs: number
  derniere_tentative: string
}

// Labels pour affichage
export const AUDIT_ACTION_LABELS: Record<AuditActionType, string> = {
  // AUTHENTIFICATION
  AUTH_LOGIN_SUCCESS: 'Connexion réussie',
  AUTH_LOGIN_FAILED: 'Échec de connexion',
  AUTH_LOGOUT: 'Déconnexion',
  AUTH_PASSWORD_RESET: 'Réinitialisation mot de passe',
  // CITOYENS
  CITOYEN_DEMANDE_CREEE: 'Demande créée',
  CITOYEN_DEMANDE_ANNULEE: 'Demande annulée',
  CITOYEN_DECLARATION_CREEE: 'Déclaration créée',
  CITOYEN_MENTION_SOUMISE: 'Avis de mention soumis',
  CITOYEN_PAIEMENT_EFFECTUE: 'Paiement effectué',
  // AGENTS
  AGENT_DEMANDE_APPROUVEE: 'Demande approuvée',
  AGENT_DEMANDE_REJETEE: 'Demande rejetée',
  AGENT_ACTE_CREE: 'Acte créé',
  AGENT_ACTE_MODIFIE: 'Acte modifié',
  AGENT_MENTION_APPROUVEE: 'Mention approuvée',
  AGENT_MENTION_REJETEE: 'Mention rejetée',
  AGENT_PDF_GENERE: 'PDF généré',
  AGENT_DOCUMENTS_VERIFIES: 'Documents vérifiés',
  // MINISTÈRE
  MINISTERE_ACTE_VERIFIE: 'Acte vérifié',
  MINISTERE_ALERTE_CREEE: 'Alerte créée',
  MINISTERE_RAPPORT_EXPORTE: 'Rapport exporté',
  MINISTERE_MAIRIE_CREEE: 'Mairie créée',
  MINISTERE_AGENT_CREE: 'Agent créé',
  MINISTERE_STATISTIQUES_CONSULTEES: 'Statistiques consultées',
  // FRAUDE
  FRAUDE_TENTATIVE_DETECTEE: '⚠️ Tentative de fraude détectée',
  FRAUDE_ALERTE_DECLENCHEE: '🚨 Alerte fraude déclenchée',
  FRAUDE_ACTE_INVALIDE: '❌ Acte invalide',
  FRAUDE_QR_INVALIDE: '❌ QR Code invalide',
}

// Icônes pour chaque type d'action
export const AUDIT_ACTION_ICONS: Record<AuditActionType, string> = {
  // AUTHENTIFICATION
  AUTH_LOGIN_SUCCESS: '🔓',
  AUTH_LOGIN_FAILED: '🔒',
  AUTH_LOGOUT: '👋',
  AUTH_PASSWORD_RESET: '🔑',
  // CITOYENS
  CITOYEN_DEMANDE_CREEE: '📝',
  CITOYEN_DEMANDE_ANNULEE: '❌',
  CITOYEN_DECLARATION_CREEE: '👶',
  CITOYEN_MENTION_SOUMISE: '📋',
  CITOYEN_PAIEMENT_EFFECTUE: '💳',
  // AGENTS
  AGENT_DEMANDE_APPROUVEE: '✅',
  AGENT_DEMANDE_REJETEE: '❌',
  AGENT_ACTE_CREE: '📄',
  AGENT_ACTE_MODIFIE: '✏️',
  AGENT_MENTION_APPROUVEE: '✅',
  AGENT_MENTION_REJETEE: '❌',
  AGENT_PDF_GENERE: '📑',
  AGENT_DOCUMENTS_VERIFIES: '🔍',
  // MINISTÈRE
  MINISTERE_ACTE_VERIFIE: '🔍',
  MINISTERE_ALERTE_CREEE: '⚠️',
  MINISTERE_RAPPORT_EXPORTE: '📊',
  MINISTERE_MAIRIE_CREEE: '🏛️',
  MINISTERE_AGENT_CREE: '👤',
  MINISTERE_STATISTIQUES_CONSULTEES: '📈',
  // FRAUDE
  FRAUDE_TENTATIVE_DETECTEE: '⚠️',
  FRAUDE_ALERTE_DECLENCHEE: '🚨',
  FRAUDE_ACTE_INVALIDE: '❌',
  FRAUDE_QR_INVALIDE: '❌',
}

// Couleurs pour les statuts
export const AUDIT_STATUT_COLORS: Record<AuditStatut, { bg: string; text: string; border: string }> = {
  SUCCESS: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  FAILED: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  WARNING: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
  },
}
