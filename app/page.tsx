import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/Button'
import { FileText, Shield, Zap, Globe } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <Logo size="md" variant="dark" />
          <div className="flex gap-2 md:gap-4">
            <Link href="/login">
              <Button variant="outline" className="text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2">
                Connexion
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" className="text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2">
                S'inscrire
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-3 md:px-6 py-8 md:py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-6">
            Digitalisez vos demandes d'actes d'état civil
          </h1>
          <p className="text-sm md:text-lg lg:text-xl text-gray-600 mb-6 md:mb-8 px-2">
            MaMairie est la plateforme moderne qui simplifie les démarches administratives 
            pour les citoyens et les mairies africaines.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto text-sm md:text-base">
                Commencer maintenant
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Video Section (VSL) */}
      <section className="container mx-auto px-3 md:px-6 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-3xl font-bold text-center text-gray-900 mb-4 md:mb-8">
            Découvrez MaMairie en vidéo
          </h2>
          <div className="relative bg-gray-900 rounded-lg md:rounded-2xl overflow-hidden shadow-2xl aspect-video">
            <video
              className="w-full h-full object-cover"
              controls
              preload="metadata"
            >
              <source src="/video.mp4" type="video/mp4" />
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          </div>
          <p className="text-center text-xs md:text-sm text-gray-500 mt-3 md:mt-4">
            Voyez comment MaMairie transforme les démarches administratives
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-3 md:px-6 py-8 md:py-16">
        <h2 className="text-xl md:text-3xl font-bold text-center text-gray-900 mb-6 md:mb-12">
          Pourquoi choisir MaMairie ?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Zap className="text-primary-500" size={24} />
            </div>
            <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Rapide</h3>
            <p className="text-xs md:text-sm text-gray-600">
              Obtenez vos documents en quelques clics
            </p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Shield className="text-secondary-500" size={24} />
            </div>
            <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Sécurisé</h3>
            <p className="text-xs md:text-sm text-gray-600">
              Vos données sont protégées
            </p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <FileText className="text-blue-500" size={24} />
            </div>
            <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Simple</h3>
            <p className="text-xs md:text-sm text-gray-600">
              Interface intuitive
            </p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Globe className="text-purple-500" size={24} />
            </div>
            <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Multi-mairies</h3>
            <p className="text-xs md:text-sm text-gray-600">
              Plusieurs mairies connectées
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-500 text-white py-8 md:py-16">
        <div className="container mx-auto px-3 md:px-6 text-center">
          <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-4">
            Prêt à moderniser votre mairie ?
          </h2>
          <p className="text-sm md:text-xl mb-6 md:mb-8 opacity-90">
            Rejoignez les mairies qui ont déjà digitalisé leurs services
          </p>
          <Link href="/register">
            <Button variant="secondary" className="text-sm md:text-base px-6 md:px-8 py-2 md:py-3">
              Créer un compte
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
