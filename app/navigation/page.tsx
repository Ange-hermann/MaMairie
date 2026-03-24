'use client'

import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'
import { Home, LogIn, UserPlus, LayoutDashboard, FileText, Building2, List } from 'lucide-react'

export default function NavigationPage() {
  const pages = [
    {
      category: 'Pages Publiques',
      items: [
        { name: 'Accueil', path: '/', icon: Home, color: 'blue' },
        { name: 'Connexion', path: '/login', icon: LogIn, color: 'indigo' },
        { name: 'Inscription', path: '/register', icon: UserPlus, color: 'purple' },
      ]
    },
    {
      category: 'Espace Citoyen',
      items: [
        { name: 'Dashboard Citoyen', path: '/dashboard-citoyen', icon: LayoutDashboard, color: 'orange' },
        { name: 'Mes Demandes', path: '/mes-demandes', icon: List, color: 'amber' },
        { name: 'Nouvelle Demande', path: '/demande-extrait', icon: FileText, color: 'yellow' },
      ]
    },
    {
      category: 'Espace Agent',
      items: [
        { name: 'Dashboard Mairie', path: '/dashboard-mairie', icon: Building2, color: 'green' },
      ]
    },
    {
      category: 'Espace Administrateur',
      items: [
        { name: 'Dashboard Admin', path: '/dashboard-admin', icon: LayoutDashboard, color: 'red' },
      ]
    },
  ]

  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    amber: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
    yellow: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Logo size="lg" variant="dark" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🗺️ Navigation MaMairie
          </h1>
          <p className="text-lg text-gray-600">
            Accédez rapidement à toutes les pages de l'application
          </p>
        </div>

        {/* Pages Grid */}
        <div className="space-y-12">
          {pages.map((section, idx) => (
            <div key={idx}>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-primary-500 rounded"></span>
                {section.category}
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.items.map((page, pageIdx) => {
                  const Icon = page.icon
                  return (
                    <Link key={pageIdx} href={page.path}>
                      <div className={`bg-gradient-to-br ${colorClasses[page.color]} rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all cursor-pointer`}>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                            <Icon size={32} strokeWidth={2} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{page.name}</h3>
                            <p className="text-sm opacity-90">{page.path}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-end">
                          <span className="text-sm font-semibold opacity-90">
                            Accéder →
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            ℹ️ Informations Utiles
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-gray-700">
            <div>
              <h4 className="font-bold text-lg mb-2">🔐 Identifiants de Test</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>Citoyen :</strong> citoyen@test.com / Test123456!</li>
                <li><strong>Agent :</strong> agent@test.com / Test123456!</li>
                <li><strong>Admin :</strong> admin@test.com / Test123456!</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">📚 Documentation</h4>
              <ul className="space-y-2 text-sm">
                <li>• README.md - Documentation complète</li>
                <li>• QUICKSTART.md - Guide de démarrage</li>
                <li>• IDENTIFIANTS_TEST.md - Comptes de test</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600">
          <p className="text-sm">
            Développé avec ❤️ pour l'Afrique
          </p>
          <p className="text-sm mt-2">
            © 2024 MaMairie - UVICOCI & CODIN Digital Services
          </p>
        </div>
      </main>
    </div>
  )
}
