'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, Ban, Eye } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { AuditLog } from '@/types/audit'

interface TentativeSuspecte {
  ip_address: string
  nb_tentatives: number
  nb_echecs: number
  derniere_tentative: string
  logs: AuditLog[]
}

export function AuditAlertesTab() {
  const supabase = createClientComponentClient()
  const [tentativesSuspectes, setTentativesSuspectes] = useState<TentativeSuspecte[]>([])
  const [fraudeLogs, setFraudeLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTentativesSuspectes()
    fetchFraudeLogs()
  }, [])

  const fetchTentativesSuspectes = async () => {
    try {
      // Récupérer les IPs avec plus de 5 échecs dans la dernière heure
      const uneHeureAvant = new Date(Date.now() - 60 * 60 * 1000).toISOString()

      const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('statut', 'FAILED')
        .gte('created_at', uneHeureAvant)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Grouper par IP
      const groupedByIp: Record<string, AuditLog[]> = {}
      logs?.forEach(log => {
        if (log.ip_address) {
          if (!groupedByIp[log.ip_address]) {
            groupedByIp[log.ip_address] = []
          }
          groupedByIp[log.ip_address].push(log)
        }
      })

      // Filtrer les IPs suspectes (>= 5 échecs)
      const suspectes: TentativeSuspecte[] = Object.entries(groupedByIp)
        .filter(([_, logs]) => logs.length >= 5)
        .map(([ip, logs]) => ({
          ip_address: ip,
          nb_tentatives: logs.length,
          nb_echecs: logs.filter(l => l.statut === 'FAILED').length,
          derniere_tentative: logs[0].created_at,
          logs,
        }))
        .sort((a, b) => b.nb_echecs - a.nb_echecs)

      setTentativesSuspectes(suspectes)
    } catch (error) {
      console.error('Erreur tentatives suspectes:', error)
    }
  }

  const fetchFraudeLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .like('action_type', 'FRAUDE_%')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setFraudeLogs(data || [])
    } catch (error) {
      console.error('Erreur fraude logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBloquerIp = async (ipAddress: string) => {
    if (!confirm(`Voulez-vous bloquer l'IP ${ipAddress} ?`)) return

    try {
      const { error } = await supabase
        .from('ip_bloquees')
        .insert({
          ip_address: ipAddress,
          raison: 'Blocage manuel depuis le journal d\'audit',
          expire_le: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
          statut: 'active',
        })

      if (error) throw error

      alert(`✅ IP ${ipAddress} bloquée avec succès`)
      fetchTentativesSuspectes()
    } catch (error: any) {
      console.error('Erreur blocage IP:', error)
      alert(`❌ Erreur: ${error.message}`)
    }
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
      {/* Tentatives de connexion suspectes */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="text-red-600" size={24} />
            Tentatives de connexion suspectes (dernière heure)
          </h2>
          <Button
            variant="outline"
            onClick={fetchTentativesSuspectes}
            className="text-sm"
          >
            🔄 Actualiser
          </Button>
        </div>

        {tentativesSuspectes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            ✅ Aucune tentative suspecte détectée
          </div>
        ) : (
          <div className="space-y-3">
            {tentativesSuspectes.map((tentative) => (
              <div
                key={tentative.ip_address}
                className="bg-red-50 border-2 border-red-300 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🚨</span>
                      <div>
                        <p className="font-bold text-red-900">
                          IP: <span className="font-mono">{tentative.ip_address}</span>
                        </p>
                        <p className="text-sm text-red-700">
                          {tentative.nb_echecs} tentatives échouées
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>
                        <strong>Dernière tentative:</strong>{' '}
                        {new Date(tentative.derniere_tentative).toLocaleString('fr-FR')}
                      </p>
                      <p>
                        <strong>Types d'actions:</strong>{' '}
                        {Array.from(new Set(tentative.logs.map(l => l.action_type))).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleBloquerIp(tentative.ip_address)}
                      className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
                    >
                      <Ban size={18} />
                      Bloquer IP
                    </Button>
                  </div>
                </div>

                {/* Détails des tentatives */}
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-red-700 hover:text-red-900">
                    Voir les {tentative.logs.length} tentatives
                  </summary>
                  <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                    {tentative.logs.map((log) => (
                      <div key={log.id} className="text-xs bg-white p-2 rounded border border-red-200">
                        <span className="font-mono">{new Date(log.created_at).toLocaleTimeString('fr-FR')}</span>
                        {' - '}
                        <span>{log.action_type}</span>
                        {log.user_email && (
                          <>
                            {' - '}
                            <span className="text-gray-600">{log.user_email}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Alertes de fraude */}
      <Card>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="text-orange-600" size={24} />
          Alertes de fraude (dernières 24h)
        </h2>

        {fraudeLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            ✅ Aucune alerte de fraude
          </div>
        ) : (
          <div className="space-y-2">
            {fraudeLogs.map((log) => (
              <div
                key={log.id}
                className="bg-orange-50 border border-orange-300 rounded-lg p-3 hover:bg-orange-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">⚠️</span>
                      <p className="font-semibold text-orange-900">
                        {log.action_type.replace('FRAUDE_', '').replace(/_/g, ' ')}
                      </p>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{log.message}</p>
                    <div className="flex gap-4 text-xs text-gray-600">
                      <span>
                        📅 {new Date(log.created_at).toLocaleString('fr-FR')}
                      </span>
                      {log.ip_address && (
                        <span className="font-mono">🌐 {log.ip_address}</span>
                      )}
                      {log.user_email && (
                        <span>👤 {log.user_email}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {/* Ouvrir modal détail */}}
                    className="px-3 py-1"
                  >
                    <Eye size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recommandations */}
      <Card className="bg-blue-50 border-blue-300">
        <h3 className="font-semibold text-blue-900 mb-3">
          💡 Recommandations de sécurité
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✓ Bloquez les IPs avec plus de 10 tentatives échouées</li>
          <li>✓ Vérifiez régulièrement les alertes de fraude</li>
          <li>✓ Contactez les agents concernés en cas d'activité suspecte</li>
          <li>✓ Exportez les rapports d'audit mensuellement</li>
        </ul>
      </Card>
    </div>
  )
}
