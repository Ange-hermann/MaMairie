'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AuditFiltersComponent } from '@/components/AuditFilters'
import { AuditTable } from '@/components/AuditTable'
import { AuditDetailModal } from '@/components/AuditDetailModal'
import { AuditAlertesTab } from '@/components/AuditAlertesTab'
import { AuditRealtimeTab } from '@/components/AuditRealtimeTab'
import { 
  Shield, 
  Download, 
  Activity, 
  AlertTriangle, 
  Users, 
  TrendingUp,
  FileText,
  Lock
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import type { AuditLog, AuditFilters, AuditStats } from '@/types/audit'

export default function AuditMinisterePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [tablesExist, setTablesExist] = useState(true)
  const [stats, setStats] = useState<AuditStats>({
    totalAujourdhui: 0,
    tentativesEchouees: 0,
    alertesFraude: 0,
    utilisateursConnectes: 0,
  })
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [currentTab, setCurrentTab] = useState<'logs' | 'alertes' | 'realtime'>('logs')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<AuditFilters>({
    limit: 50,
    offset: 0,
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

  // Actualisation automatique toutes les 30 secondes
  useEffect(() => {
    if (currentTab === 'realtime' && userData) {
      const interval = setInterval(() => {
        fetchLogs()
        fetchStats()
      }, 10000) // 10 secondes

      return () => clearInterval(interval)
    }
  }, [currentTab, userData])

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Erreur profil:', profileError)
        router.push('/login')
        return
      }

      if (!profile || profile.role !== 'ministere') {
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
      if (filters.userRole) {
        query = query.eq('user_role', filters.userRole)
      }
      if (filters.statut) {
        query = query.eq('statut', filters.statut)
      }
      if (filters.actionTypes && filters.actionTypes.length > 0) {
        query = query.in('action_type', filters.actionTypes)
      }
      if (filters.ipAddress) {
        query = query.eq('ip_address', filters.ipAddress)
      }
      if (filters.searchTerm) {
        query = query.or(`user_email.ilike.%${filters.searchTerm}%,entite_reference.ilike.%${filters.searchTerm}%,message.ilike.%${filters.searchTerm}%`)
      }

      const { data, error, count } = await query

      if (error) {
        console.error('Erreur chargement logs:', error)
        // Si la table n'existe pas, afficher un message
        if (error.message?.includes('does not exist')) {
          console.error('⚠️ Les tables d\'audit n\'existent pas encore. Exécutez la migration SQL.')
          setTablesExist(false)
        }
        setLogs([])
        return
      }

      setLogs(data || [])
      setTotalPages(Math.ceil((count || 0) / (filters.limit || 50)))
    } catch (error: any) {
      console.error('Erreur chargement logs:', error)
      setLogs([])
    }
  }

  const fetchStats = async () => {
    try {
      const aujourdhui = new Date()
      aujourdhui.setHours(0, 0, 0, 0)

      // Total actions aujourd'hui
      const { count: totalAujourdhui } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', aujourdhui.toISOString())

      // Tentatives échouées aujourd'hui
      const { count: tentativesEchouees } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'FAILED')
        .gte('created_at', aujourdhui.toISOString())

      // Alertes fraude actives (24h)
      const { count: alertesFraude } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .like('action_type', 'FRAUDE_%')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      // Utilisateurs connectés (connexions réussies uniques dans les dernières 24h)
      const { data: connexionsRecentes } = await supabase
        .from('audit_logs')
        .select('user_id')
        .eq('action_type', 'AUTH_LOGIN_SUCCESS')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      
      // Compter les utilisateurs uniques
      const utilisateursUniques = new Set(connexionsRecentes?.map(log => log.user_id) || [])
      const utilisateursConnectes = utilisateursUniques.size

      setStats({
        totalAujourdhui: totalAujourdhui || 0,
        tentativesEchouees: tentativesEchouees || 0,
        alertesFraude: alertesFraude || 0,
        utilisateursConnectes: utilisateursConnectes || 0,
      })
    } catch (error) {
      console.error('Erreur stats:', error)
      setStats({
        totalAujourdhui: 0,
        tentativesEchouees: 0,
        alertesFraude: 0,
        utilisateursConnectes: 0,
      })
    }
  }

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setShowDetailModal(true)
  }

  const handleExportPDF = async () => {
    try {
      const response = await fetch('/api/audit/export?format=pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters }),
      })

      if (!response.ok) throw new Error('Erreur export')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
    } catch (error) {
      console.error('Erreur export PDF:', error)
      alert('Erreur lors de l\'export PDF')
    }
  }

  const handleExportExcel = async () => {
    try {
      const response = await fetch('/api/audit/export?format=excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters }),
      })

      if (!response.ok) throw new Error('Erreur export')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
    } catch (error) {
      console.error('Erreur export Excel:', error)
      alert('Erreur lors de l\'export Excel')
    }
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
      <Sidebar role="ministere" />
      
      <div className="flex-1 w-full lg:w-auto">
        <Header 
          userName={userData ? `${userData.prenom} ${userData.nom}` : 'Ministère'}
          userRole="ministere"
          avatarUrl={userData?.avatar_url}
        />
        
        <main className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* En-tête */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Shield className="text-white" size={24} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                      Journal d'Audit National
                    </h1>
                    <p className="text-gray-600">
                      Traçabilité complète et non modifiable
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleExportPDF}
                    className="flex items-center gap-2"
                  >
                    <Download size={18} />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExportExcel}
                    className="flex items-center gap-2"
                  >
                    <Download size={18} />
                    Excel
                  </Button>
                </div>
              </div>

              {/* Badge conformité */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Lock className="text-green-600" size={20} />
                  <p className="text-sm font-semibold text-green-900">
                    🔒 Données non modifiables — Conformité gouvernementale République de Côte d'Ivoire
                  </p>
                </div>
              </div>

              {/* Avertissement si tables n'existent pas */}
              {!tablesExist && (
                <div className="mt-4 bg-red-50 border-2 border-red-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h3 className="font-bold text-red-900 mb-2">
                        ⚠️ Tables d'audit non créées
                      </h3>
                      <p className="text-sm text-red-800 mb-3">
                        Les tables d'audit n'existent pas encore dans votre base de données Supabase.
                      </p>
                      <div className="bg-white rounded p-3 text-sm">
                        <p className="font-semibold mb-2">Pour activer le système d'audit :</p>
                        <ol className="list-decimal list-inside space-y-1 text-gray-700">
                          <li>Ouvrez <strong>Supabase Dashboard</strong></li>
                          <li>Allez dans <strong>SQL Editor</strong></li>
                          <li>Copiez le contenu de <code className="bg-gray-100 px-1">supabase/create-audit-logs.sql</code></li>
                          <li>Collez et cliquez sur <strong>Run</strong></li>
                          <li>Rechargez cette page</li>
                        </ol>
                      </div>
                      <p className="text-xs text-red-600 mt-2">
                        📖 Consultez <strong>GUIDE_ACTIVATION_AUDIT.md</strong> pour plus de détails
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Actions aujourd'hui</p>
                    <p className="text-4xl font-bold mt-2">{stats.totalAujourdhui}</p>
                  </div>
                  <Activity size={48} className="opacity-20" />
                </div>
              </Card>

              <Card className={`bg-gradient-to-br ${stats.tentativesEchouees > 10 ? 'from-red-500 to-red-600' : 'from-orange-500 to-orange-600'} text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Tentatives échouées</p>
                    <p className="text-4xl font-bold mt-2">{stats.tentativesEchouees}</p>
                  </div>
                  <AlertTriangle size={48} className="opacity-20" />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Alertes fraude</p>
                    <p className="text-4xl font-bold mt-2">{stats.alertesFraude}</p>
                  </div>
                  <Shield size={48} className="opacity-20" />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Utilisateurs connectés</p>
                    <p className="text-4xl font-bold mt-2">{stats.utilisateursConnectes}</p>
                  </div>
                  <Users size={48} className="opacity-20" />
                </div>
              </Card>
            </div>

            {/* Onglets */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex gap-6">
                  <button
                    onClick={() => setCurrentTab('logs')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      currentTab === 'logs'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FileText size={18} className="inline mr-2" />
                    Journal complet
                  </button>
                  <button
                    onClick={() => setCurrentTab('alertes')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      currentTab === 'alertes'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <AlertTriangle size={18} className="inline mr-2" />
                    Alertes de sécurité
                    {stats.alertesFraude > 0 && (
                      <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                        {stats.alertesFraude}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setCurrentTab('realtime')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      currentTab === 'realtime'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Activity size={18} className="inline mr-2" />
                    Temps réel
                    <span className="ml-2 w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse"></span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Contenu selon l'onglet */}
            {currentTab === 'logs' && (
              <>
                <AuditFiltersComponent
                  filters={filters}
                  onFiltersChange={(newFilters) => {
                    setFilters(newFilters)
                    setCurrentPage(1)
                  }}
                  showMairieFilter={false}
                />

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
              </>
            )}

            {currentTab === 'alertes' && <AuditAlertesTab />}

            {currentTab === 'realtime' && <AuditRealtimeTab />}
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
