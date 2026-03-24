export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      mairies: {
        Row: {
          id: string
          nom_mairie: string
          ville: string
          pays: string
          code_mairie: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nom_mairie: string
          ville: string
          pays: string
          code_mairie: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nom_mairie?: string
          ville?: string
          pays?: string
          code_mairie?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          nom: string
          prenom: string
          email: string
          telephone: string
          role: 'citoyen' | 'agent' | 'admin'
          mairie_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nom: string
          prenom: string
          email: string
          telephone: string
          role: 'citoyen' | 'agent' | 'admin'
          mairie_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nom?: string
          prenom?: string
          email?: string
          telephone?: string
          role?: 'citoyen' | 'agent' | 'admin'
          mairie_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      birth_records: {
        Row: {
          id: string
          nom: string
          prenom: string
          date_naissance: string
          lieu_naissance: string
          pere: string
          mere: string
          numero_registre: string
          mairie_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nom: string
          prenom: string
          date_naissance: string
          lieu_naissance: string
          pere: string
          mere: string
          numero_registre: string
          mairie_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nom?: string
          prenom?: string
          date_naissance?: string
          lieu_naissance?: string
          pere?: string
          mere?: string
          numero_registre?: string
          mairie_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      requests: {
        Row: {
          id: string
          citizen_id: string
          mairie_id: string
          nom: string
          prenom: string
          date_naissance: string
          lieu_naissance: string
          nom_pere: string
          nom_mere: string
          telephone: string
          statut: 'en_attente' | 'en_cours' | 'validee' | 'rejetee'
          date_demande: string
          pdf_url: string | null
          numero_document: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          citizen_id: string
          mairie_id: string
          nom: string
          prenom: string
          date_naissance: string
          lieu_naissance: string
          nom_pere: string
          nom_mere: string
          telephone: string
          statut?: 'en_attente' | 'en_cours' | 'validee' | 'rejetee'
          date_demande?: string
          pdf_url?: string | null
          numero_document?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          citizen_id?: string
          mairie_id?: string
          nom?: string
          prenom?: string
          date_naissance?: string
          lieu_naissance?: string
          nom_pere?: string
          nom_mere?: string
          telephone?: string
          statut?: 'en_attente' | 'en_cours' | 'validee' | 'rejetee'
          date_demande?: string
          pdf_url?: string | null
          numero_document?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          request_id: string
          montant: number
          mode_paiement: 'mobile_money' | 'carte_bancaire'
          statut_paiement: 'en_attente' | 'valide' | 'echoue'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          request_id: string
          montant: number
          mode_paiement: 'mobile_money' | 'carte_bancaire'
          statut_paiement?: 'en_attente' | 'valide' | 'echoue'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          montant?: number
          mode_paiement?: 'mobile_money' | 'carte_bancaire'
          statut_paiement?: 'en_attente' | 'valide' | 'echoue'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'citoyen' | 'agent' | 'admin'
      request_status: 'en_attente' | 'en_cours' | 'validee' | 'rejetee'
      payment_status: 'en_attente' | 'valide' | 'echoue'
      payment_method: 'mobile_money' | 'carte_bancaire'
    }
  }
}
