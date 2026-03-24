# 🚀 Guide : Pousser MaMairie vers GitHub

## 📋 **Prérequis**

- ✅ Git installé sur votre machine
- ✅ Compte GitHub créé
- ✅ Dépôt GitHub créé : https://github.com/Ange-hermann/MaMairie.git

---

## 🎯 **Étapes**

### **1. Initialiser Git (si pas déjà fait)**

```bash
cd c:\Users\Angeh\OneDrive\Bureau\MaMairie
git init
```

---

### **2. Vérifier le fichier .gitignore**

Le fichier `.gitignore` doit contenir :

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Production
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Misc
*.pem
.vercel
```

---

### **3. Ajouter tous les fichiers**

```bash
git add .
```

---

### **4. Créer le premier commit**

```bash
git commit -m "🎉 Initial commit - MaMairie v1.0

- Application SaaS GovTech pour digitaliser les actes d'état civil
- Stack: Next.js 14, TypeScript, TailwindCSS, Supabase
- Fonctionnalités: Dashboards Citoyen/Agent/Ministère
- Système de notifications en temps réel
- Upload d'avatars
- Génération de PDF
- Interface responsive mobile
- Multi-tenant avec RLS"
```

---

### **5. Ajouter le dépôt distant**

```bash
git remote add origin https://github.com/Ange-hermann/MaMairie.git
```

---

### **6. Vérifier le remote**

```bash
git remote -v
```

Vous devriez voir :
```
origin  https://github.com/Ange-hermann/MaMairie.git (fetch)
origin  https://github.com/Ange-hermann/MaMairie.git (push)
```

---

### **7. Pousser vers GitHub**

```bash
git branch -M main
git push -u origin main
```

---

## 🔐 **Authentification GitHub**

Si demandé, utilisez un **Personal Access Token** :

### **Créer un Token** :
1. GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token
4. Sélectionner : `repo` (tous)
5. Générer et copier le token

### **Utiliser le Token** :
```
Username: Ange-hermann
Password: [Votre Token]
```

---

## 📝 **Créer un README.md**

Créez un fichier `README.md` à la racine :

```markdown
# 🏛️ MaMairie

Application SaaS GovTech pour digitaliser les demandes d'actes d'état civil dans les mairies africaines.

## 🚀 Stack Technique

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **UI**: Composants custom, Lucide Icons, Recharts
- **PDF**: jsPDF

## ✨ Fonctionnalités

- 📊 Dashboards Citoyen/Agent/Ministère
- 📝 Demandes d'actes en ligne
- 🔔 Notifications en temps réel
- 📄 Génération de PDF
- 👤 Gestion de profils avec avatars
- 📱 Interface responsive mobile
- 🏢 Multi-tenant avec RLS

## 🛠️ Installation

\`\`\`bash
# Cloner le projet
git clone https://github.com/Ange-hermann/MaMairie.git

# Installer les dépendances
npm install

# Configurer .env.local
cp .env.example .env.local

# Lancer le serveur
npm run dev
\`\`\`

## 📚 Documentation

- [Guide de démarrage rapide](QUICKSTART.md)
- [Configuration Supabase](SUPABASE_SETUP.md)
- [Guide de déploiement](DEPLOYMENT.md)

## 📄 Licence

© 2024 MaMairie - Ministère de l'Intérieur - République de Côte d'Ivoire
```

---

## 🔄 **Commandes Git Utiles**

### **Voir le statut** :
```bash
git status
```

### **Ajouter des fichiers** :
```bash
git add .                    # Tous les fichiers
git add fichier.tsx          # Un fichier spécifique
```

### **Commit** :
```bash
git commit -m "Message de commit"
```

### **Pousser** :
```bash
git push                     # Pousser vers origin main
git push origin main         # Explicite
```

### **Tirer** :
```bash
git pull                     # Récupérer les changements
```

### **Voir l'historique** :
```bash
git log --oneline            # Historique compact
```

---

## 📦 **Structure du Projet**

```
MaMairie/
├── app/                     # Pages Next.js
│   ├── dashboard-citoyen/
│   ├── dashboard-agent/
│   ├── ministere/
│   └── ...
├── components/              # Composants React
│   ├── layout/
│   └── ui/
├── supabase/               # Scripts SQL
├── public/                 # Assets statiques
├── .env.local             # Variables d'environnement (ignoré)
├── .gitignore             # Fichiers à ignorer
├── package.json           # Dépendances
└── README.md              # Documentation
```

---

## ⚠️ **Important**

### **Ne JAMAIS pousser** :
- ❌ `.env.local` (clés API Supabase)
- ❌ `node_modules/` (trop lourd)
- ❌ `.next/` (build)
- ❌ Fichiers sensibles

### **Toujours pousser** :
- ✅ Code source
- ✅ Documentation
- ✅ Scripts SQL
- ✅ Configuration (sans secrets)

---

## 🎉 **Résultat**

Votre projet sera disponible sur :
**https://github.com/Ange-hermann/MaMairie**

---

## 📞 **Support**

En cas de problème :
1. Vérifier `.gitignore`
2. Vérifier le remote : `git remote -v`
3. Vérifier le statut : `git status`
4. Vérifier les logs : `git log`

---

**Votre projet est maintenant sur GitHub ! 🚀✨**

© 2024 MaMairie - Ministère de l'Intérieur - République de Côte d'Ivoire
