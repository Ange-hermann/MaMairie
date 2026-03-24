# 📱 Guide : Progressive Web App (PWA)

## ✅ **Transformation en PWA Complète**

MaMairie est maintenant une **Progressive Web App** installable sur mobile et desktop !

---

## 🎯 **Fonctionnalités PWA**

### **1. Installation**
- ✅ Installable sur Android, iOS, Windows, macOS, Linux
- ✅ Prompt d'installation automatique
- ✅ Raccourcis d'application
- ✅ Icône sur l'écran d'accueil

### **2. Offline**
- ✅ Fonctionne hors ligne
- ✅ Cache intelligent
- ✅ Synchronisation en arrière-plan

### **3. Notifications**
- ✅ Notifications push
- ✅ Badges d'application
- ✅ Vibrations

### **4. Performance**
- ✅ Chargement rapide
- ✅ Service Worker
- ✅ Cache stratégique

---

## 📦 **Fichiers Créés**

### **1. manifest.json** (amélioré)
- Métadonnées de l'application
- Icônes (192x192, 512x512)
- Raccourcis d'application
- Screenshots
- Catégories

### **2. sw.js** (Service Worker)
- Cache des ressources
- Stratégie Network First
- Notifications push
- Synchronisation

### **3. PWAInstallPrompt.tsx**
- Prompt d'installation personnalisé
- Tracking des installations
- UX optimisée

### **4. register-sw.tsx**
- Enregistrement du Service Worker
- Gestion des mises à jour

### **5. create-pwa-tracking.sql**
- Table de tracking
- Statistiques d'installation
- Analytics PWA

---

## 🚀 **Installation**

### **Étape 1 : Exécuter le SQL**

Dans Supabase SQL Editor :
```sql
-- Exécuter supabase/create-pwa-tracking.sql
```

### **Étape 2 : Tester**

1. **Lancer le serveur** :
```bash
npm run dev
```

2. **Ouvrir** : http://localhost:3000

3. **Attendre 3 secondes** → Prompt d'installation apparaît

---

## 📱 **Installation sur Mobile**

### **Android (Chrome)**
1. Ouvrir MaMairie dans Chrome
2. Cliquer sur le prompt "Installer"
3. OU Menu → "Installer l'application"
4. ✅ Icône ajoutée à l'écran d'accueil

### **iOS (Safari)**
1. Ouvrir MaMairie dans Safari
2. Cliquer sur le bouton Partager
3. "Sur l'écran d'accueil"
4. ✅ Icône ajoutée

### **Desktop (Chrome/Edge)**
1. Ouvrir MaMairie
2. Icône ➕ dans la barre d'adresse
3. "Installer MaMairie"
4. ✅ Application desktop créée

---

## 🎨 **Prompt d'Installation**

### **Apparence** :
```
┌─────────────────────────────────┐
│ 📱 Installer MaMairie       [X] │
├─────────────────────────────────┤
│ Installez l'application pour    │
│ un accès rapide et des          │
│ notifications en temps réel     │
│                                 │
│ [Installer]  [Plus tard]        │
│                                 │
│ ✓ Accès hors ligne              │
│ ✓ Notifications push            │
│ ✓ Lancement rapide              │
└─────────────────────────────────┘
```

### **Comportement** :
- Apparaît après 3 secondes
- Peut être fermé
- Ne réapparaît pas pendant 7 jours si fermé
- Tracking automatique

---

## 📊 **Tracking des Installations**

### **Actions Trackées** :
- `installed` - PWA installée
- `accepted` - Prompt accepté
- `dismissed` - Prompt refusé
- `prompt_dismissed` - Prompt fermé
- `already_installed` - Déjà installé

### **Données Collectées** :
- User ID (si connecté)
- User Agent
- Plateforme (Android, iOS, Windows, etc.)
- Navigateur (Chrome, Safari, etc.)
- Mobile ou Desktop
- Date et heure

### **Voir les Statistiques** :
```sql
-- Statistiques globales
SELECT * FROM pwa_stats;

-- Installations par plateforme
SELECT platform, COUNT(*) as count
FROM public.pwa_installs
WHERE action = 'installed'
GROUP BY platform;

-- Taux de conversion
SELECT 
  COUNT(*) FILTER (WHERE action = 'accepted') as accepted,
  COUNT(*) FILTER (WHERE action = 'dismissed') as dismissed,
  ROUND(
    COUNT(*) FILTER (WHERE action = 'accepted')::NUMERIC / 
    NULLIF(COUNT(*) FILTER (WHERE action IN ('accepted', 'dismissed')), 0) * 100,
    2
  ) as conversion_rate
FROM public.pwa_installs;
```

---

## 🔧 **Configuration**

### **manifest.json**
```json
{
  "name": "MaMairie - Plateforme GovTech",
  "short_name": "MaMairie",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#f97316",
  "background_color": "#ffffff"
}
```

### **Service Worker**
```javascript
// Cache version
const CACHE_NAME = 'mamairie-v1.0.0'

// Stratégie: Network First, fallback to Cache
```

---

## 🎯 **Raccourcis d'Application**

Appui long sur l'icône → Menu contextuel :

1. **Nouvelle Demande** → `/demande-extrait`
2. **Mes Demandes** → `/mes-demandes`
3. **Notifications** → `/dashboard-citoyen`

---

## 📱 **Compatibilité**

### **Mobile** :
- ✅ Android (Chrome, Samsung Internet)
- ✅ iOS (Safari 11.3+)
- ✅ Android (Firefox, Edge)

### **Desktop** :
- ✅ Windows (Chrome, Edge)
- ✅ macOS (Chrome, Safari)
- ✅ Linux (Chrome, Firefox)

---

## 🔔 **Notifications Push**

### **Demander la Permission** :
```typescript
const permission = await Notification.requestPermission()
if (permission === 'granted') {
  // Envoyer des notifications
}
```

### **Envoyer une Notification** :
```typescript
navigator.serviceWorker.ready.then((registration) => {
  registration.showNotification('MaMairie', {
    body: 'Votre demande a été validée',
    icon: '/logo.jpeg',
    badge: '/logo.jpeg',
    vibrate: [200, 100, 200]
  })
})
```

---

## 🚀 **Déploiement**

### **Vercel** :
```bash
vercel --prod
```

### **Netlify** :
```bash
netlify deploy --prod
```

### **Vérifier PWA** :
1. Chrome DevTools → Lighthouse
2. Cocher "Progressive Web App"
3. Run audit
4. ✅ Score > 90

---

## 📊 **Critères PWA**

- ✅ HTTPS (obligatoire)
- ✅ Service Worker
- ✅ Manifest.json
- ✅ Icônes (192x192, 512x512)
- ✅ Responsive
- ✅ Offline ready
- ✅ Installable

---

## 🎉 **Avantages**

### **Pour les Utilisateurs** :
- 📱 Installation facile
- ⚡ Chargement rapide
- 📡 Fonctionne hors ligne
- 🔔 Notifications push
- 🏠 Icône sur l'écran d'accueil

### **Pour Vous** :
- 📊 Tracking des installations
- 📈 Meilleur engagement
- 💰 Pas de frais de store
- 🔄 Mises à jour instantanées
- 🌍 Multi-plateforme

---

## 📱 **Publier sur les Stores**

### **Google Play Store** (TWA - Trusted Web Activity) :
1. Créer un compte développeur ($25)
2. Utiliser Bubblewrap ou PWABuilder
3. Générer l'APK
4. Publier

### **Microsoft Store** :
1. Utiliser PWABuilder
2. Générer le package
3. Publier

### **App Store** (limité) :
- iOS ne supporte pas pleinement les PWA
- Utiliser un wrapper natif (Capacitor)

---

## 🔍 **Tester**

### **Chrome DevTools** :
1. F12 → Application
2. Manifest ✅
3. Service Workers ✅
4. Storage ✅

### **Lighthouse** :
```bash
npm install -g lighthouse
lighthouse https://votre-url.com --view
```

---

## ✅ **Résultat**

MaMairie est maintenant :
- ✅ Installable sur tous les appareils
- ✅ Fonctionne hors ligne
- ✅ Notifications push
- ✅ Tracking des installations
- ✅ Prêt pour les stores

---

**Votre application est maintenant une PWA complète ! 📱✨**

© 2024 MaMairie - Ministère de l'Intérieur - République de Côte d'Ivoire
