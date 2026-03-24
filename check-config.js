#!/usr/bin/env node

/**
 * Script de vérification de la configuration MaMairie
 * Vérifie que toutes les variables d'environnement sont configurées
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Vérification de la configuration MaMairie...\n')

// Vérifier si .env.local existe
const envPath = path.join(__dirname, '.env.local')
const envExists = fs.existsSync(envPath)

if (!envExists) {
  console.log('❌ Le fichier .env.local n\'existe pas')
  console.log('📝 Créez-le en copiant .env.local.example :')
  console.log('   cp .env.local.example .env.local\n')
  process.exit(1)
}

console.log('✅ Fichier .env.local trouvé\n')

// Lire le contenu
const envContent = fs.readFileSync(envPath, 'utf8')

// Variables requises
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL'
]

let allConfigured = true

console.log('📋 Vérification des variables d\'environnement :\n')

requiredVars.forEach(varName => {
  const regex = new RegExp(`${varName}=(.+)`)
  const match = envContent.match(regex)
  
  if (!match || match[1].includes('your_') || match[1].trim() === '') {
    console.log(`❌ ${varName} : Non configurée`)
    allConfigured = false
  } else {
    const value = match[1]
    const maskedValue = value.length > 20 
      ? value.substring(0, 20) + '...' 
      : value
    console.log(`✅ ${varName} : ${maskedValue}`)
  }
})

console.log('\n')

if (!allConfigured) {
  console.log('⚠️  Certaines variables ne sont pas configurées')
  console.log('📖 Consultez RENDRE_OPERATIONNEL.md pour les instructions\n')
  process.exit(1)
}

console.log('🎉 Toutes les variables sont configurées !')
console.log('🚀 Vous pouvez lancer l\'application avec : npm run dev\n')

// Vérifier si Supabase est accessible
console.log('🌐 Test de connexion à Supabase...')

const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)
if (urlMatch && urlMatch[1]) {
  const supabaseUrl = urlMatch[1].trim()
  
  if (supabaseUrl.startsWith('http')) {
    console.log(`✅ URL Supabase valide : ${supabaseUrl}`)
  } else {
    console.log(`⚠️  URL Supabase invalide : ${supabaseUrl}`)
  }
}

console.log('\n✨ Configuration vérifiée avec succès !\n')
