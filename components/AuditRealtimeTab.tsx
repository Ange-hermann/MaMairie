'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Activity, Zap } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { AuditLog } from '@/types/audit'
import { AUDIT_ACTION_LABELS, AUDIT_ACTION_ICONS, AUDIT_STATUT_COLORS } from '@/types/audit'

export function AuditRealtimeTab() {
  const supabase = createClientComponentClient()
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    fetchRecentLogs()

    // Actualisation automatique toutes les 10 secondes
    const interval = setInterval(() => {
      fetchRecentLogs()
    }, 10000)

    // Supabase Realtime (si disponible)
    const channel = supabase
      .channel('audit_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs',
        },
        (payload) => {
          console.log('Nouveau log:', payload)
          setRecentLogs(prev => [payload.new as AuditLog, ...prev.slice(0, 19)])
          setLastUpdate(new Date())
        }
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchRecentLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      setRecentLogs(data || [])
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Erreur logs temps réel:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    
    if (seconds < 60) return `Il y a ${seconds}s`
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}min`
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`
    return new Date(date).toLocaleDateString('fr-FR')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec indicateur temps réel */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Activity className="text-green-600" size={32} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Activité en temps réel
              </h2>
              <p className="text-sm text-gray-600">
                Actualisation automatique toutes les 10 secondes
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Dernière mise à jour</p>
            <p className="text-sm font-semibold text-gray-700">
              {lastUpdate.toLocaleTimeString('fr-FR')}
            </p>
          </div>
        </div>
      </Card>

      {/* Liste des 20 dernières actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="text-orange-500" size={20} />
          20 dernières actions
        </h3>

        {recentLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune activité récente
          </div>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log, index) => (
              <div
                key={log.id}
                className={`p-3 rounded-lg border transition-all ${
                  index === 0 ? 'bg-orange-50 border-orange-300 animate-pulse' : 'bg-gray-50 border-gray-200'
                } hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Icône et action */}
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl flex-shrink-0">
                      {AUDIT_ACTION_ICONS[log.action_type]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 truncate">
                          {AUDIT_ACTION_LABELS[log.action_type]}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${AUDIT_STATUT_COLORS[log.statut].bg} ${AUDIT_STATUT_COLORS[log.statut].text}`}>
                          {log.statut}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                        {log.user_nom && (
                          <span className="flex items-center gap-1">
                            <span>👤</span>
                            <span className="font-medium">{log.user_nom}</span>
                          </span>
                        )}
                        {log.user_role && (
                          <span className="flex items-center gap-1">
                            {log.user_role === 'citoyen' && '🧑'}
                            {log.user_role === 'agent' && '👮'}
                            {log.user_role === 'ministere' && '🏛️'}
                            <span>{log.user_role}</span>
                          </span>
                        )}
                        {log.ip_address && (
                          <span className="flex items-center gap-1">
                            <span>🌐</span>
                            <span className="font-mono">{log.ip_address}</span>
                          </span>
                        )}
                        {log.entite_reference && (
                          <span className="flex items-center gap-1">
                            <span>📄</span>
                            <span className="font-mono">{log.entite_reference}</span>
                          </span>
                        )}
                      </div>

                      {log.message && (
                        <p className="text-sm text-gray-700 mt-1 truncate">
                          {log.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">
                      {getTimeAgo(log.created_at)}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      {new Date(log.created_at).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                </div>

                {/* Indicateur de fraude */}
                {log.action_type.startsWith('FRAUDE_') && (
                  <div className="mt-2 pt-2 border-t border-red-200">
                    <div className="flex items-center gap-2 text-red-700">
                      <span className="text-sm">🚨</span>
                      <span className="text-xs font-semibold">ALERTE DE SÉCURITÉ</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Statistiques temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <div className="text-center">
            <p className="text-sm text-blue-700 mb-1">Actions/minute</p>
            <p className="text-3xl font-bold text-blue-900">
              {Math.floor(recentLogs.length / 10)}
            </p>
          </div>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <div className="text-center">
            <p className="text-sm text-green-700 mb-1">Taux de succès</p>
            <p className="text-3xl font-bold text-green-900">
              {recentLogs.length > 0
                ? Math.round((recentLogs.filter(l => l.statut === 'SUCCESS').length / recentLogs.length) * 100)
                : 0}%
            </p>
          </div>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <div className="text-center">
            <p className="text-sm text-purple-700 mb-1">Utilisateurs actifs</p>
            <p className="text-3xl font-bold text-purple-900">
              {new Set(recentLogs.map(l => l.user_id).filter(Boolean)).size}
            </p>
          </div>
        </Card>
      </div>

      {/* Info */}
      <Card className="bg-gray-50">
        <p className="text-xs text-gray-600 text-center">
          💡 Les nouvelles actions apparaissent automatiquement en haut de la liste
          <br />
          Actualisation automatique toutes les 10 secondes + Supabase Realtime
        </p>
      </Card>
    </div>
  )
}
