'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from './Logo'
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Building2,
  Baby,
  Heart,
  Cross,
  ChevronDown,
  ChevronRight,
  FileCheck,
  Users,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  role: 'citoyen' | 'agent' | 'admin' | 'ministere'
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [etatCivilOpen, setEtatCivilOpen] = useState(
    pathname.includes('/etat-civil')
  )
  
  const citizenLinks = [
    { href: '/dashboard-citoyen', label: 'Tableau de Bord', icon: LayoutDashboard },
    { href: '/mes-demandes', label: 'Mes Demandes', icon: FileText },
    { href: '/demande-extrait', label: 'Nouvelle Demande', icon: FileText },
  ]
  
  const agentLinks = [
    { href: '/dashboard-agent', label: 'Tableau de Bord', icon: LayoutDashboard },
    { href: '/agent/demandes', label: 'Demandes', icon: FileText },
  ]

  const etatCivilLinks = [
    { href: '/agent/etat-civil/naissances', label: 'Naissances', icon: Baby },
    { href: '/agent/etat-civil/mariages', label: 'Mariages', icon: Heart },
    { href: '/agent/etat-civil/deces', label: 'Décès', icon: Cross },
  ]

  const agentLinksBottom = [
    { href: '/agent/documents', label: 'Documents', icon: FileCheck },
    { href: '/agent/statistiques', label: 'Statistiques', icon: BarChart3 },
  ]
  
  const adminLinks = [
    { href: '/admin', label: 'Tableau de Bord', icon: LayoutDashboard },
    { href: '/admin/mairies', label: 'Mairies', icon: Building2 },
    { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
    { href: '/admin/demandes', label: 'Demandes', icon: FileText },
    { href: '/admin/statistiques', label: 'Statistiques', icon: BarChart3 },
  ]
  
  const ministereLinks = [
    { href: '/ministere/dashboard', label: 'Tableau de Bord National', icon: LayoutDashboard },
    { href: '/ministere/mairies', label: 'Toutes les Mairies', icon: Building2 },
    { href: '/ministere/agents', label: 'Agents Municipaux', icon: Users },
    { href: '/ministere/statistiques', label: 'Statistiques Nationales', icon: BarChart3 },
    { href: '/ministere/alertes', label: 'Alertes & Anomalies', icon: FileText },
    { href: '/ministere/verification', label: 'Vérification Actes', icon: FileCheck },
  ]
  
  const links = role === 'citoyen' ? citizenLinks : role === 'admin' ? adminLinks : role === 'ministere' ? ministereLinks : []
  
  return (
    <>
      {/* Bouton Hamburger Mobile */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary-500 text-white p-3 rounded-lg shadow-lg"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay Mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-orange-500 via-orange-600 to-green-600 text-white min-h-screen flex flex-col shadow-2xl transition-transform duration-300",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 border-b border-white/10">
          <Logo variant="light" />
        </div>
        
        <nav className="flex-1 px-4 overflow-y-auto">
        <ul className="space-y-2">
          {/* Menu Citoyen ou Admin */}
          {role !== 'agent' && links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                    isActive 
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon size={20} />
                  <span>{link.label}</span>
                </Link>
              </li>
            )
          })}

          {/* Menu Agent */}
          {role === 'agent' && (
            <>
              {/* Liens principaux */}
              {agentLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                        isActive 
                          ? 'bg-primary-500 text-white' 
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      )}
                    >
                      <Icon size={20} />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                )
              })}

              {/* Menu État Civil avec sous-menus */}
              <li>
                <button
                  onClick={() => setEtatCivilOpen(!etatCivilOpen)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Building2 size={20} />
                    <span>État Civil</span>
                  </div>
                  {etatCivilOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {/* Sous-menus */}
                {etatCivilOpen && (
                  <ul className="mt-2 ml-4 space-y-1">
                    {etatCivilLinks.map((link) => {
                      const Icon = link.icon
                      const isActive = pathname === link.href
                      
                      return (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className={cn(
                              'flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm',
                              isActive 
                                ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm' 
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                            )}
                          >
                            <Icon size={18} />
                            <span>{link.label}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>

              {/* Autres liens */}
              {agentLinksBottom.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                        isActive 
                          ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm' 
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <Icon size={20} />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                )
              })}
            </>
          )}
        </ul>
      </nav>
    </aside>
    </>
  )
}
