'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/layout/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Connexion avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        toast.error('Email ou mot de passe incorrect')
        return
      }

      if (!authData.user) {
        toast.error('Erreur de connexion')
        return
      }

      // 2. Récupérer le profil utilisateur pour connaître son rôle
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, nom, prenom')
        .eq('id', authData.user.id)
        .single()

      if (userError || !userData) {
        toast.error('Profil utilisateur introuvable')
        return
      }

      toast.success(`Bienvenue ${userData.prenom} ${userData.nom} !`)

      // 3. Redirection basée sur le rôle
      if (userData.role === 'citoyen') {
        router.push('/dashboard-citoyen')
      } else if (userData.role === 'agent') {
        router.push('/dashboard-agent')
      } else if (userData.role === 'admin') {
        router.push('/dashboard-admin')
      } else if (userData.role === 'ministere') {
        router.push('/ministere/dashboard')
      } else {
        router.push('/dashboard-citoyen')
      }
      
      router.refresh()
    } catch (error) {
      console.error('Erreur de connexion:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-3 md:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-4 md:p-8 relative">
        {/* Bouton retour */}
        <Link 
          href="/"
          className="absolute top-4 left-4 flex items-center gap-1 text-gray-600 hover:text-primary-600 transition text-sm"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Accueil</span>
        </Link>

        <div className="text-center mb-6 md:mb-8 mt-6 sm:mt-0">
          <div className="flex justify-center">
            <Logo size="lg" variant="dark" />
          </div>
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-4 md:mb-6">
          Connexion
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="exemple@mail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
              <span className="ml-2 text-xs md:text-sm text-gray-600">Se souvenir</span>
            </label>
            <Link href="/forgot-password" className="text-xs md:text-sm text-primary-500 hover:text-primary-600">
              Mot de passe oublié ?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se Connecter'}
          </Button>
        </form>

        <div className="mt-6 md:mt-8 text-center">
          <p className="text-xs md:text-sm text-gray-600">
            Pas encore inscrit ?{' '}
            <Link href="/register" className="text-primary-500 font-medium hover:text-primary-600">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
