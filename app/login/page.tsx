'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/layout/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" variant="dark" />
          </div>
          <p className="text-gray-600">Plateforme citoyenne & agent municipal</p>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Connexion à MaMairie
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="exemple@mail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
              <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-primary-500 hover:text-primary-600">
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

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Pas encore inscrit ?{' '}
            <Link href="/register" className="text-primary-500 font-medium hover:text-primary-600">
              Créer un compte
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500 mb-4">Mise en place par :</p>
          <div className="flex justify-center items-center gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-xs font-bold text-gray-600">UVICOCI</span>
              </div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-xs font-bold text-gray-600">CODIN</span>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-4">
            © 2024 MaMairie. Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  )
}
