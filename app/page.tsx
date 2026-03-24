import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/Button'
import { FileText, Shield, Zap, Globe } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="lg" variant="dark" />
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline">Se connecter</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary">S'inscrire</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Digitalisez vos demandes d'actes d'état civil
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            MaMairie est la plateforme moderne qui simplifie les démarches administratives 
            pour les citoyens et les mairies africaines.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button variant="primary" size="lg">
                Commencer maintenant
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Pourquoi choisir MaMairie ?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="text-primary-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Rapide</h3>
            <p className="text-gray-600">
              Obtenez vos documents en quelques clics, sans vous déplacer
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-secondary-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sécurisé</h3>
            <p className="text-gray-600">
              Vos données sont protégées avec les meilleurs standards de sécurité
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-blue-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Simple</h3>
            <p className="text-gray-600">
              Interface intuitive pour citoyens et agents municipaux
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="text-purple-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Multi-mairies</h3>
            <p className="text-gray-600">
              Connecte plusieurs mairies sur une seule plateforme
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-500 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à moderniser votre mairie ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez les mairies qui ont déjà digitalisé leurs services
          </p>
          <Link href="/register">
            <Button variant="secondary" size="lg">
              Créer un compte
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Logo variant="light" />
              <p className="text-gray-400 mt-2">
                Plateforme citoyenne & agent municipal
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">
                Mise en place par : UVICOCI & CODIN
              </p>
              <p className="text-gray-500 text-sm mt-2">
                © 2024 MaMairie. Tous droits réservés
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
