import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { RegisterServiceWorker } from './register-sw'
import { PWAInstallPrompt } from '@/components/ui/PWAInstallPrompt'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MaMairie - Plateforme citoyenne & agent municipal',
  description: 'Digitalisez vos demandes d\'actes d\'état civil',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MaMairie',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/logo-mamairie.png',
    apple: '/logo-mamairie.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MaMairie" />
        <link rel="apple-touch-icon" href="/logo-mamairie.png" />
      </head>
      <body className={inter.className}>
        <RegisterServiceWorker />
        {children}
        <PWAInstallPrompt />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
