'use client'

import { X, User, Globe, Monitor, FileText, Clock, AlertTriangle } from 'lucide-react'
import type { AuditLog } from '@/types/audit'
import { AUDIT_ACTION_LABELS, AUDIT_ACTION_ICONS, AUDIT_STATUT_COLORS } from '@/types/audit'

interface AuditDetailModalProps {
  log: AuditLog | null
  isOpen: boolean
  onClose: () => void
}

export function AuditDetailModal({ log, isOpen, onClose }: AuditDetailModalProps) {
  if (!isOpen || !log) return null

  const formatJSON = (obj: any) => {
    if (!obj || Object.keys(obj).length === 0) return null
    return JSON.stringify(obj, null, 2)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <span className="text-2xl">{AUDIT_ACTION_ICONS[log.action_type]}</span>
              <div>
                <h2 className="text-xl font-bold">
                  Détails du Log d'Audit
                </h2>
                <p className="text-sm opacity-90">
                  {AUDIT_ACTION_LABELS[log.action_type]}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Statut */}
            <div className={`mb-6 p-4 rounded-lg border-2 ${AUDIT_STATUT_COLORS[log.statut].bg} ${AUDIT_STATUT_COLORS[log.statut].border}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {log.statut === 'SUCCESS' && <span className="text-2xl">✅</span>}
                  {log.statut === 'FAILED' && <span className="text-2xl">❌</span>}
                  {log.statut === 'WARNING' && <span className="text-2xl">⚠️</span>}
                  <div>
                    <p className={`font-bold ${AUDIT_STATUT_COLORS[log.statut].text}`}>
                      {log.statut === 'SUCCESS' && 'Action réussie'}
                      {log.statut === 'FAILED' && 'Action échouée'}
                      {log.statut === 'WARNING' && 'Avertissement'}
                    </p>
                    {log.message && (
                      <p className="text-sm text-gray-700 mt-1">{log.message}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {new Date(log.created_at).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.created_at).toLocaleTimeString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Grille d'informations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Utilisateur */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="text-blue-600" size={20} />
                  <h3 className="font-semibold text-blue-900">Utilisateur</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Nom :</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {log.user_nom || 'Anonyme'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email :</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {log.user_email || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Rôle :</span>
                    <span className="ml-2">
                      {log.user_role === 'citoyen' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          👤 Citoyen
                        </span>
                      )}
                      {log.user_role === 'agent' && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          👮 Agent
                        </span>
                      )}
                      {log.user_role === 'ministere' && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                          🏛️ Ministère
                        </span>
                      )}
                    </span>
                  </div>
                  {log.user_id && (
                    <div>
                      <span className="text-gray-600">ID :</span>
                      <span className="ml-2 font-mono text-xs text-gray-700">
                        {log.user_id.substring(0, 8)}...
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Connexion */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="text-green-600" size={20} />
                  <h3 className="font-semibold text-green-900">Connexion</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Adresse IP :</span>
                    <span className="ml-2 font-mono text-xs font-medium text-gray-900">
                      {log.ip_address || '-'}
                    </span>
                  </div>
                  {log.user_agent && (
                    <div>
                      <span className="text-gray-600">Navigateur :</span>
                      <div className="mt-1 p-2 bg-white rounded text-xs font-mono text-gray-700 break-all">
                        {log.user_agent}
                      </div>
                    </div>
                  )}
                  {log.session_id && (
                    <div>
                      <span className="text-gray-600">Session ID :</span>
                      <span className="ml-2 font-mono text-xs text-gray-700">
                        {log.session_id}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Entité concernée */}
              {(log.entite_type || log.entite_reference) && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="text-purple-600" size={20} />
                    <h3 className="font-semibold text-purple-900">Entité concernée</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    {log.entite_type && (
                      <div>
                        <span className="text-gray-600 text-xs uppercase font-semibold">Type de document :</span>
                        <div className="mt-1 bg-white px-3 py-2 rounded border border-purple-200">
                          <span className="font-medium text-gray-900">
                            {log.entite_type === 'declaration_naissance' && '👶 Déclaration de Naissance'}
                            {log.entite_type === 'avis_mention' && '📝 Avis de Mention'}
                            {log.entite_type === 'extrait_acte' && '📄 Extrait d\'Acte'}
                            {!['declaration_naissance', 'avis_mention', 'extrait_acte'].includes(log.entite_type) && log.entite_type}
                          </span>
                        </div>
                      </div>
                    )}
                    {log.entite_reference && (
                      <div>
                        <span className="text-gray-600 text-xs uppercase font-semibold">Numéro de référence :</span>
                        <div className="mt-1 bg-gradient-to-r from-purple-100 to-purple-50 px-4 py-3 rounded-lg border-2 border-purple-400">
                          <span className="font-mono font-bold text-xl text-purple-900 tracking-wide">
                            {log.entite_reference}
                          </span>
                        </div>
                      </div>
                    )}
                    {log.entite_id && (
                      <div>
                        <span className="text-gray-600">ID :</span>
                        <span className="ml-2 font-mono text-xs text-gray-700">
                          {log.entite_id.substring(0, 8)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Horodatage */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="text-orange-600" size={20} />
                  <h3 className="font-semibold text-orange-900">Horodatage</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Date :</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {new Date(log.created_at).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Heure :</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {new Date(log.created_at).toLocaleTimeString('fr-FR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Timestamp :</span>
                    <span className="ml-2 font-mono text-xs text-gray-700">
                      {new Date(log.created_at).getTime()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Détails de l'action (JSON) */}
            {log.action_details && Object.keys(log.action_details).length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText size={20} />
                  Détails de l'action
                </h3>
                
                {/* Avant / Après */}
                {(log.action_details.avant || log.action_details.apres) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {log.action_details.avant && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          📋 État AVANT
                        </h4>
                        <pre className="bg-gray-100 border border-gray-300 rounded p-3 text-xs overflow-x-auto">
                          {formatJSON(log.action_details.avant)}
                        </pre>
                      </div>
                    )}
                    {log.action_details.apres && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          ✅ État APRÈS
                        </h4>
                        <pre className="bg-green-50 border border-green-300 rounded p-3 text-xs overflow-x-auto">
                          {formatJSON(log.action_details.apres)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Metadata */}
                {log.action_details.metadata && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      ℹ️ Métadonnées
                    </h4>
                    <pre className="bg-blue-50 border border-blue-300 rounded p-3 text-xs overflow-x-auto">
                      {formatJSON(log.action_details.metadata)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Avertissement si fraude */}
            {log.action_type.startsWith('FRAUDE_') && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-red-600 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-bold text-red-900 mb-1">
                      🚨 Alerte de Sécurité
                    </h3>
                    <p className="text-sm text-red-800">
                      Cette action a été marquée comme suspecte ou frauduleuse.
                      Une investigation peut être nécessaire.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Note immuabilité */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                🔒 Ce log d'audit est <strong>immuable</strong> et ne peut être modifié ou supprimé
                <br />
                Conformité gouvernementale - République de Côte d'Ivoire
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
