'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { AuditFiltersComponent } from '@/components/AuditFilters'
import { AuditTable } from '@/components/AuditTable'
import { AuditDetailModal } from '@/components/AuditDetailModal'
import { Shield, Activity } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import type { AuditLog, AuditFilters } from '@/types/audit'

export default function AuditAgentPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<AuditFilters>({
    limit: 50,
    offset: 0,
  })
  const [stats, setStats] = useState({
    mesActions: 0,
    actionsMairie: 0,
  })

  useEffect(() => {
    fetchUserData()
  }, [])

  useEffect(() => {
    if (userData) {
      fetchLogs()
      fetchStats()
    }
  }, [userData, filters, currentPage])

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'agent') {
        router.push('/dashboard-citoyen')
        return
      }

      setUserData(profile)
    } catch (error) {
      console.error('Erreur:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .eq('user_id', userData.id) // Agent voit uniquement ses propres logs
        .order('created_at', { ascending: false })
        .range(
          (currentPage - 1) * (filters.limit || 50),
          currentPage * (filters.limit || 50) - 1
        )

      // Appliquer les filtres
      if (filters.dateDebut) {
        query = query.gte('created_at', filters.dateDebut)
      }
      if (filters.dateFin) {
        query = query.lte('created_at', filters.dateFin)
      }
      if (filters.statut) {
        query = query.eq('statut', filters.statut)
      }
      if (filters.actionTypes && filters.actionTypes.length > 0) {
        query = query.in('action_type', filters.actionTypes)
      }
      if (filters.searchTerm) {
        query = query.or(`entite_reference.ilike.%${filters.searchTerm}%,message.ilike.%${filters.searchTerm}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      setLogs(data || [])
      setTotalPages(Math.ceil((count || 0) / (filters.limit || 50)))
    } catch (error) {
      console.error('Erreur chargement logs:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const aujourdhui = new Date()
      aujourdhui.setHours(0, 0, 0, 0)

      // Mes actions
      const { count: mesActions } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.id)
        .gte('created_at', aujourdhui.toISOString())

      // Actions de ma mairie
      const { data: usersData } = await supabase
        .from('users')
        .select('id')
        .eq('mairie_id', userData.mairie_id)

      const userIds = usersData?.map(u => u.id) || []

      const { count: actionsMairie } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .in('user_id', userIds)
        .gte('created_at', aujourdhui.toISOString())

      setStats({
        mesActions: mesActions || 0,
        actionsMairie: actionsMairie || 0,
      })
    } catch (error) {
      console.error('Erreur stats:', error)
    }
  }

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setShowDetailModal(true)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="agent" />
      
      <div className="flex-1 w-full lg:w-auto">
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Agent'}
          userRole="agent"
          avatarUrl={userData?.avatar_url}
        />
        
        <main className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* En-tête */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Shield className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Mon Journal d'Audit
                  </h1>
                  <p className="text-gray-600">
                    Historique de mes actions
                  </p>
                </div>
              </div>

              {/* Badge info */}
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  ℹ️ Vous visualisez uniquement vos propres actions. Ces données sont non modifiables.
                </p>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Mes actions aujourd'hui</p>
                    <p className="text-4xl font-bold mt-2">{stats.mesActions}</p>
                  </div>
                  <Activity size={48} className="opacity-20" />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Actions de ma mairie</p>
                    <p className="text-4xl font-bold mt-2">{stats.actionsMairie}</p>
                  </div>
                  <Shield size={48} className="opacity-20" />
                </div>
              </Card>
            </div>

            {/* Filtres */}
            <AuditFiltersComponent
              filters={filters}
              onFiltersChange={(newFilters) => {
                setFilters(newFilters)
                setCurrentPage(1)
              }}
              showMairieFilter={false}
            />

            {/* Table */}
            <div className="mt-6">
              <AuditTable
                logs={logs}
                loading={loading}
                onViewDetails={handleViewDetails}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </main>
      </div>

      <AuditDetailModal
        log={selectedLog}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  )
}
