# 🏛️ MaMairie

> Application SaaS GovTech pour digitaliser les demandes d'actes d'état civil dans les mairies africaines

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38bdf8)](https://tailwindcss.com/)

---

## 📖 Description

**MaMairie** est une plateforme moderne qui simplifie les démarches administratives pour les citoyens et les mairies africaines. Elle permet de :

- 📝 Demander des actes d'état civil en ligne
- 🔔 Recevoir des notifications en temps réel
- 📄 Télécharger des documents officiels en PDF
- 👥 Gérer plusieurs mairies sur une seule plateforme
- 📱 Accéder depuis mobile et desktop

---

## ✨ Fonctionnalités

### **Pour les Citoyens**
- ✅ Demande d'extraits de naissance, mariage, décès
- ✅ Suivi en temps réel des demandes
- ✅ Notifications automatiques
- ✅ Téléchargement de PDF officiels
- ✅ Gestion de profil avec avatar

### **Pour les Agents**
- ✅ Gestion des demandes reçues
- ✅ Validation/Rejet de demandes
- ✅ Enregistrement d'actes d'état civil
- ✅ Statistiques et rapports
- ✅ Notifications de nouvelles demandes

### **Pour le Ministère**
- ✅ Gestion des mairies
- ✅ Gestion des agents
- ✅ Statistiques nationales
- ✅ Vérification d'actes
- ✅ Alertes et anomalies

---

## 🚀 Stack Technique

### **Frontend**
- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **TailwindCSS** - Styling utility-first
- **Lucide Icons** - Icônes modernes
- **Recharts** - Graphiques et statistiques

### **Backend**
- **Supabase** - Backend as a Service
  - Authentication
  - PostgreSQL Database
  - Storage (avatars, documents)
  - Row Level Security (RLS)
  - Real-time subscriptions

### **Autres**
- **jsPDF** - Génération de PDF
- **Web Audio API** - Sons de notification

---

## 🛠️ Installation

### **Prérequis**
- Node.js 18+ 
- npm ou yarn
- Compte Supabase

### **1. Cloner le projet**
```bash
git clone https://github.com/Ange-hermann/MaMairie.git
cd MaMairie
```

### **2. Installer les dépendances**
```bash
npm install
```

### **3. Configuration Supabase**

Créer un fichier `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

### **4. Exécuter les scripts SQL**

Dans Supabase SQL Editor, exécuter dans l'ordre :
1. `supabase/schema.sql` - Schéma de base
2. `supabase/create-avatars-bucket.sql` - Bucket avatars
3. `supabase/create-notifications-system.sql` - Système de notifications
4. `supabase/SETUP_AVATARS_SIMPLE.sql` - Configuration storage

### **5. Lancer le serveur**
```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentation

- 📖 [Guide de démarrage rapide](QUICKSTART.md)
- 🔧 [Configuration Supabase](SUPABASE_SETUP.md)
- 🚀 [Guide de déploiement](DEPLOYMENT.md)
- 🔔 [Système de notifications](GUIDE_NOTIFICATIONS.md)
- 👤 [Gestion de profil](GUIDE_PAGE_PROFIL.md)
- 📱 [Optimisation mobile](OPTIMISATION_MOBILE.md)

---

## 🏗️ Architecture

### **Multi-tenant**
- Isolation complète des données par mairie
- Row Level Security (RLS) Supabase
- 3 rôles : Citoyen, Agent, Ministère

### **Base de Données**
```
Tables principales :
├── users          # Utilisateurs
├── mairies        # Mairies
├── requests       # Demandes d'actes
├── notifications  # Notifications
├── naissances     # Actes de naissance
├── mariages       # Actes de mariage
└── deces          # Actes de décès
```

---

## 🎨 Design

- **Couleurs** : Orange (#f97316) et Vert (#22c55e)
- **Responsive** : Mobile-first design
- **Accessibilité** : WCAG 2.1 AA
- **Performance** : Lighthouse score > 90

---

## 📱 Responsive

L'application est optimisée pour :
- 📱 Mobile (320px - 768px)
- 💻 Desktop (1024px+)
- 📱 Tablette (768px - 1024px)

Fonctionnalités mobile :
- Menu hamburger
- Sidebar coulissante
- Notifications plein écran
- Formulaires adaptés

---

## 🔐 Sécurité

- ✅ Authentication Supabase
- ✅ Row Level Security (RLS)
- ✅ Variables d'environnement
- ✅ Validation des données
- ✅ Protection CSRF
- ✅ HTTPS obligatoire

---

## 🚀 Déploiement

### **Vercel (Recommandé)**
```bash
npm install -g vercel
vercel
```

### **Netlify**
```bash
npm run build
netlify deploy --prod
```

Voir [DEPLOYMENT.md](DEPLOYMENT.md) pour plus de détails.

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

© 2024 MaMairie - Ministère de l'Intérieur - République de Côte d'Ivoire

Tous droits réservés.

---

## 👥 Équipe

**Développé par** : UVICOCI & CODIN

**Contact** : angeherboua@gmail.com

---

## 🙏 Remerciements

- Next.js Team
- Supabase Team
- TailwindCSS Team
- Communauté Open Source

---

## 📊 Statistiques

![GitHub stars](https://img.shields.io/github/stars/Ange-hermann/MaMairie)
![GitHub forks](https://img.shields.io/github/forks/Ange-hermann/MaMairie)
![GitHub issues](https://img.shields.io/github/issues/Ange-hermann/MaMairie)

---

**Fait avec ❤️ pour les mairies africaines**
