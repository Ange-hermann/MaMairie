'use client'

import React, { useState } from 'react'
import { User, ChevronDown, LogOut, Settings } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { NotificationBell } from '@/components/ui/NotificationBell'

interface HeaderProps {
  userName: string
  userRole: string
  avatarUrl?: string | null
}

export const Header: React.FC<HeaderProps> = ({ userName, userRole, avatarUrl }) => {
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Erreur de déconnexion:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Bienvenue, {userName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {userRole === 'citoyen' && 'Espace Citoyen'}
            {userRole === 'agent' && 'Espace Agent Municipal'}
            {userRole === 'admin' && 'Espace Administrateur'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationBell />
          
          <div className="relative">
            <div 
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-all"
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={userName} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary-500"
                />
              ) : (
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-sm">
                <p className="font-medium text-gray-800">{userName}</p>
                <p className="text-gray-500 capitalize">{userRole}</p>
              </div>
              <ChevronDown size={20} className="text-gray-600" />
            </div>

            {/* Menu Déroulant */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={() => {
                    setShowMenu(false)
                    router.push('/profil')
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                >
                  <Settings size={18} />
                  <span>Mon Profil</span>
                </button>
                
                <hr className="my-2 border-gray-200" />
                
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Se déconnecter</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay pour fermer le menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </header>
  )
}
