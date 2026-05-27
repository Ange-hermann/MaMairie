'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Search, Filter, X, Calendar } from 'lucide-react'
import type { AuditFilters, AuditActionType, UserRole, AuditStatut } from '@/types/audit'
import { AUDIT_ACTION_LABELS } from '@/types/audit'

interface AuditFiltersProps {
  filters: AuditFilters
  onFiltersChange: (filters: AuditFilters) => void
  showMairieFilter?: boolean
  mairies?: Array<{ id: string; nom_mairie: string; ville: string }>
}

export function AuditFiltersComponent({ 
  filters, 
  onFiltersChange,
  showMairieFilter = false,
  mairies = []
}: AuditFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handlePeriodeChange = (periode: string) => {
    const now = new Date()
    let dateDebut = new Date()

    switch (periode) {
      case 'aujourdhui':
        dateDebut.setHours(0, 0, 0, 0)
        break
      case '7jours':
        dateDebut.setDate(now.getDate() - 7)
        break
      case '30jours':
        dateDebut.setDate(now.getDate() - 30)
        break
      case 'tout':
        dateDebut = new Date(0)
        break
      default:
        return
    }

    onFiltersChange({
      ...filters,
      dateDebut: dateDebut.toISOString(),
      dateFin: now.toISOString(),
    })
  }

  const handleReset = () => {
    onFiltersChange({
      limit: 50,
      offset: 0,
    })
    setShowAdvanced(false)
  }

  const actionTypeOptions = Object.entries(AUDIT_ACTION_LABELS).map(([value, label]) => ({
    value,
    label,
  }))

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      {/* Ligne 1 : Recherche et période */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Barre de recherche */}
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par email, IP, numéro d'acte..."
              value={filters.searchTerm || ''}
              onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Période rapide */}
        <div className="flex gap-2">
          <button
            onClick={() => handlePeriodeChange('aujourdhui')}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Aujourd'hui
          </button>
          <button
            onClick={() => handlePeriodeChange('7jours')}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            7 jours
          </button>
          <button
            onClick={() => handlePeriodeChange('30jours')}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            30 jours
          </button>
        </div>
      </div>

      {/* Ligne 2 : Filtres rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Rôle */}
        <Select
          label=""
          value={filters.userRole || ''}
          onChange={(e) => onFiltersChange({ ...filters, userRole: e.target.value as UserRole })}
          options={[
            { value: '', label: 'Tous les rôles' },
            { value: 'citoyen', label: '👤 Citoyens' },
            { value: 'agent', label: '👮 Agents' },
            { value: 'ministere', label: '🏛️ Ministère' },
          ]}
        />

        {/* Statut */}
        <Select
          label=""
          value={filters.statut || ''}
          onChange={(e) => onFiltersChange({ ...filters, statut: e.target.value as AuditStatut })}
          options={[
            { value: '', label: 'Tous les statuts' },
            { value: 'SUCCESS', label: '✅ Succès' },
            { value: 'FAILED', label: '❌ Échec' },
            { value: 'WARNING', label: '⚠️ Avertissement' },
          ]}
        />

        {/* Mairie (si applicable) */}
        {showMairieFilter && (
          <Select
            label=""
            value={filters.mairieId || ''}
            onChange={(e) => onFiltersChange({ ...filters, mairieId: e.target.value })}
            options={[
              { value: '', label: 'Toutes les mairies' },
              ...mairies.map(m => ({
                value: m.id,
                label: `${m.nom_mairie} - ${m.ville}`,
              })),
            ]}
          />
        )}

        {/* Boutons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex-1"
          >
            <Filter size={18} className="mr-2" />
            {showAdvanced ? 'Masquer' : 'Avancé'}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="px-3"
          >
            <X size={18} />
          </Button>
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvanced && (
        <div className="pt-4 border-t border-gray-200 space-y-4">
          <h3 className="font-semibold text-gray-700">Filtres avancés</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar size={16} className="inline mr-1" />
                Date début
              </label>
              <input
                type="datetime-local"
                value={filters.dateDebut ? new Date(filters.dateDebut).toISOString().slice(0, 16) : ''}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  dateDebut: e.target.value ? new Date(e.target.value).toISOString() : undefined 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Date fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar size={16} className="inline mr-1" />
                Date fin
              </label>
              <input
                type="datetime-local"
                value={filters.dateFin ? new Date(filters.dateFin).toISOString().slice(0, 16) : ''}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  dateFin: e.target.value ? new Date(e.target.value).toISOString() : undefined 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Type d'action */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d'action
              </label>
              <select
                multiple
                value={filters.actionTypes || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value) as AuditActionType[]
                  onFiltersChange({ ...filters, actionTypes: selected })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 h-32"
              >
                {actionTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Maintenez Ctrl (Cmd sur Mac) pour sélectionner plusieurs
              </p>
            </div>

            {/* Adresse IP */}
            <Input
              label="Adresse IP"
              value={filters.ipAddress || ''}
              onChange={(e) => onFiltersChange({ ...filters, ipAddress: e.target.value })}
              placeholder="Ex: 192.168.1.1"
            />
          </div>
        </div>
      )}

      {/* Résumé des filtres actifs */}
      {(filters.searchTerm || filters.userRole || filters.statut || filters.actionTypes?.length) && (
        <div className="pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Filtres actifs :</span>
            {filters.searchTerm && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                Recherche: {filters.searchTerm}
              </span>
            )}
            {filters.userRole && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Rôle: {filters.userRole}
              </span>
            )}
            {filters.statut && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                Statut: {filters.statut}
              </span>
            )}
            {filters.actionTypes && filters.actionTypes.length > 0 && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                {filters.actionTypes.length} type(s) d'action
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
