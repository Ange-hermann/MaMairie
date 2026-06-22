'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/Button'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ForgotPasswordPage() {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast.error(error.message || 'Une erreur est survenue')
        return
      }

      setSent(true)
      toast.success('Email de réinitialisation envoyé')
    } catch (error) {
      console.error('Erreur réinitialisation:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-3 md:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-4 md:p-8 relative">
        <Link
          href="/login"
          className="absolute top-4 left-4 flex items-center gap-1 text-gray-600 hover:text-primary-600 transition text-sm"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Connexion</span>
        </Link>

        <div className="text-center mb-6 md:mb-8 mt-6 sm:mt-0">
          <div className="flex justify-center">
            <Logo size="lg" variant="dark" />
          </div>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="text-secondary-500" size={48} />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Email envoyé
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Si un compte existe pour <span className="font-medium">{email}</span>, vous recevrez un lien pour réinitialiser votre mot de passe. Pensez à vérifier vos spams.
            </p>
            <Link href="/login">
              <Button variant="primary" className="w-full">
                Retour à la connexion
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-2">
              Mot de passe oublié ?
            </h1>
            <p className="text-sm md:text-base text-gray-600 text-center mb-4 md:mb-6">
              Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </Button>
            </form>

            <div className="mt-6 md:mt-8 text-center">
              <p className="text-xs md:text-sm text-gray-600">
                Vous vous souvenez de votre mot de passe ?{' '}
                <Link href="/login" className="text-primary-500 font-medium hover:text-primary-600">
                  Se connecter
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
