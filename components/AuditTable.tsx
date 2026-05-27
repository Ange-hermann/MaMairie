'use client'

import { useState } from 'react'
import type { AuditLog } from '@/types/audit'
import { AUDIT_ACTION_LABELS, AUDIT_ACTION_ICONS, AUDIT_STATUT_COLORS } from '@/types/audit'
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface AuditTableProps {
  logs: AuditLog[]
  loading?: boolean
  onViewDetails: (log: AuditLog) => void
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

export function AuditTable({ 
  logs, 
  loading = false,
  onViewDetails,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}: AuditTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof AuditLog>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (column: keyof AuditLog) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const sortedLogs = [...logs].sort((a, b) => {
    const aVal = a[sortColumn]
    const bVal = b[sortColumn]
    
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }
    
    return sortDirection === 'asc'
      ? (aVal > bVal ? 1 : -1)
      : (bVal > aVal ? 1 : -1)
  })

  const getRowClassName = (log: AuditLog) => {
    if (log.action_type.startsWith('FRAUDE_')) {
      return 'bg-orange-50 hover:bg-orange-100 border-l-4 border-orange-500'
    }
    if (log.statut === 'FAILED') {
      return 'bg-red-50 hover:bg-red-100 border-l-4 border-red-500'
    }
    return 'hover:bg-gray-50'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Chargement des logs...</span>
        </div>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Aucun log d'audit trouvé</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('created_at')}
              >
                Date/Heure {sortColumn === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('user_email')}
              >
                Utilisateur {sortColumn === 'user_email' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('user_role')}
              >
                Rôle {sortColumn === 'user_role' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('action_type')}
              >
                Action {sortColumn === 'action_type' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entité
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('statut')}
              >
                Statut {sortColumn === 'statut' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedLogs.map((log) => (
              <tr 
                key={log.id} 
                className={`${getRowClassName(log)} transition-colors cursor-pointer`}
                onClick={() => onViewDetails(log)}
              >
                {/* Date/Heure */}
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <div className="text-gray-900">
                    {new Date(log.created_at).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {new Date(log.created_at).toLocaleTimeString('fr-FR')}
                  </div>
                </td>

                {/* Utilisateur */}
                <td className="px-4 py-3 text-sm">
                  <div className="text-gray-900 font-medium">
                    {log.user_nom || 'Anonyme'}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {log.user_email || '-'}
                  </div>
                </td>

                {/* Rôle */}
                <td className="px-4 py-3 whitespace-nowrap text-sm">
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
                  {!log.user_role && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      System
                    </span>
                  )}
                </td>

                {/* Action */}
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span>{AUDIT_ACTION_ICONS[log.action_type]}</span>
                    <span className="text-gray-900">
                      {AUDIT_ACTION_LABELS[log.action_type]}
                    </span>
                  </div>
                </td>

                {/* Entité */}
                <td className="px-4 py-3 text-sm">
                  {log.entite_reference ? (
                    <div>
                      <div className="text-gray-900 font-mono text-xs">
                        {log.entite_reference}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {log.entite_type}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>

                {/* IP */}
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className="font-mono text-xs text-gray-600">
                    {log.ip_address || '-'}
                  </span>
                </td>

                {/* Statut */}
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${AUDIT_STATUT_COLORS[log.statut].bg} ${AUDIT_STATUT_COLORS[log.statut].text}`}>
                    {log.statut === 'SUCCESS' && '✅ Succès'}
                    {log.statut === 'FAILED' && '❌ Échec'}
                    {log.statut === 'WARNING' && '⚠️ Avertissement'}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewDetails(log)
                    }}
                    className="text-orange-600 hover:text-orange-800"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> sur{' '}
            <span className="font-medium">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1"
            >
              <ChevronLeft size={18} />
            </Button>
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
