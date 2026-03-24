# 🚀 Guide : Déploiement sur Netlify

## ✅ **Prérequis**

- ✅ Compte Netlify (gratuit)
- ✅ Projet sur GitHub
- ✅ Variables d'environnement Supabase

---

## 🎯 **Méthode 1 : Déploiement via Interface Netlify (Recommandé)**

### **Étape 1 : Créer un compte Netlify**

1. Aller sur https://www.netlify.com
2. Cliquer "Sign up"
3. Se connecter avec GitHub

---

### **Étape 2 : Importer le projet**

1. **Dashboard Netlify** → "Add new site" → "Import an existing project"
2. **Choisir** : "Deploy with GitHub"
3. **Autoriser** Netlify à accéder à GitHub
4. **Sélectionner** : `Ange-hermann/MaMairie`

---

### **Étape 3 : Configuration du build**

```
Build command: npm run build
Publish directory: .next
```

**Netlify détecte automatiquement Next.js !**

---

### **Étape 4 : Variables d'environnement**

Dans Netlify :
1. **Site settings** → "Environment variables"
2. **Add variable** :

```
NEXT_PUBLIC_SUPABASE_URL = https://gpjydaygjapdrkgppfid.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = votre_cle_anon
```

⚠️ **Important** : Utilisez vos vraies clés Supabase !

---

### **Étape 5 : Déployer**

1. Cliquer **"Deploy site"**
2. ⏳ Attendre 2-3 minutes
3. ✅ **Site déployé !**

---

## 🎯 **Méthode 2 : Déploiement via CLI**

### **Étape 1 : Installer Netlify CLI**

```bash
npm install -g netlify-cli
```

---

### **Étape 2 : Se connecter**

```bash
netlify login
```

Une fenêtre de navigateur s'ouvre → Autoriser

---

### **Étape 3 : Initialiser**

```bash
cd c:\Users\Angeh\OneDrive\Bureau\MaMairie
netlify init
```

Répondre aux questions :
```
? What would you like to do? 
  → Create & configure a new site

? Team: 
  → Votre équipe

? Site name (optional): 
  → mamairie (ou laisser vide pour auto)

? Your build command: 
  → npm run build

? Directory to deploy: 
  → .next
```

---

### **Étape 4 : Ajouter les variables d'environnement**

```bash
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://gpjydaygjapdrkgppfid.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "votre_cle_anon"
```

---

### **Étape 5 : Déployer**

```bash
netlify deploy --prod
```

✅ **Site déployé !**

---

## 🌐 **URL du Site**

Après déploiement, vous aurez :

```
https://mamairie.netlify.app
```

Ou un nom aléatoire comme :
```
https://eloquent-curie-abc123.netlify.app
```

---

## 🎨 **Personnaliser le Domaine**

### **Sous-domaine Netlify** :
1. **Site settings** → "Domain management"
2. **Options** → "Edit site name"
3. Changer en : `mamairie`
4. ✅ URL : `https://mamairie.netlify.app`

### **Domaine personnalisé** :
1. **Domain management** → "Add custom domain"
2. Entrer : `mamairie.ci` (si vous l'avez)
3. Suivre les instructions DNS
4. ✅ URL : `https://mamairie.ci`

---

## 🔐 **HTTPS**

✅ **Automatique !** Netlify fournit un certificat SSL gratuit.

---

## 🔄 **Déploiement Automatique**

Netlify redéploie automatiquement à chaque push sur GitHub !

```bash
git add .
git commit -m "Nouvelle fonctionnalité"
git push origin main
```

⏳ Netlify détecte le push → Build → Déploie automatiquement

---

## 📊 **Vérifier le Déploiement**

### **1. Build Logs**
- Netlify Dashboard → Deploys → Voir les logs

### **2. Tester le Site**
```
https://votre-site.netlify.app
```

### **3. Tester la PWA**
- Ouvrir sur mobile
- Attendre le prompt d'installation
- ✅ Installer

---

## ⚙️ **Configuration Avancée**

### **Headers de Sécurité** (déjà dans netlify.toml) :
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

### **Redirections** :
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🐛 **Dépannage**

### **Erreur : Build failed**
```bash
# Vérifier les logs
# Souvent : variables d'environnement manquantes
```

**Solution** :
1. Vérifier les variables d'environnement
2. Vérifier que `.env.local` n'est PAS dans Git
3. Ajouter les variables dans Netlify

---

### **Erreur : Page 404**
```bash
# Next.js ne trouve pas les routes
```

**Solution** :
- Vérifier `netlify.toml`
- Vérifier que le plugin Next.js est installé

---

### **PWA ne fonctionne pas**
```bash
# Service Worker bloqué
```

**Solution** :
- Vérifier les headers dans `netlify.toml`
- Vérifier que `sw.js` est accessible
- Tester sur HTTPS (obligatoire pour PWA)

---

## 📱 **Tester la PWA**

1. **Ouvrir** : `https://votre-site.netlify.app`
2. **Chrome DevTools** → Lighthouse
3. **Cocher** : Progressive Web App
4. **Run audit**
5. ✅ **Score > 90**

---

## 🎉 **Fonctionnalités Netlify**

### **Gratuites** :
- ✅ 100 GB bande passante/mois
- ✅ 300 minutes build/mois
- ✅ HTTPS automatique
- ✅ Déploiement continu
- ✅ Prévisualisations de branches
- ✅ Rollback instantané

### **Payantes** :
- Analytics
- Formulaires
- Fonctions serverless illimitées

---

## 📊 **Monitoring**

### **Analytics Netlify** :
- Visites
- Pages vues
- Pays
- Navigateurs

### **Supabase Analytics** :
- Utilisateurs
- Demandes
- Installations PWA

---

## 🔄 **Mises à Jour**

### **Automatique** :
```bash
git push origin main
```
→ Netlify redéploie automatiquement

### **Manuel** :
```bash
netlify deploy --prod
```

---

## ✅ **Checklist Déploiement**

```
☐ Compte Netlify créé
☐ Projet importé depuis GitHub
☐ Variables d'environnement ajoutées
☐ Build réussi
☐ Site accessible
☐ HTTPS actif
☐ PWA fonctionnelle
☐ Notifications testées
☐ Domaine personnalisé (optionnel)
☐ Analytics configuré
```

---

## 🎯 **Résultat Final**

Votre application sera :
- ✅ En ligne 24/7
- ✅ HTTPS automatique
- ✅ PWA installable
- ✅ Déploiement automatique
- ✅ Rapide (CDN global)
- ✅ Gratuit (plan Starter)

---

## 📞 **Support**

- **Netlify Docs** : https://docs.netlify.com
- **Netlify Community** : https://answers.netlify.com
- **Next.js on Netlify** : https://docs.netlify.com/integrations/frameworks/next-js/

---

**Votre application sera en ligne en quelques minutes ! 🚀✨**

© 2024 MaMairie - Ministère de l'Intérieur - République de Côte d'Ivoire
