# 📋 FICHE TECHNIQUE - MaMairie

## 🎯 **PRÉSENTATION**

**MaMairie** est une plateforme digitale de gestion d'état civil pour la République de Côte d'Ivoire. Elle permet aux citoyens de demander des extraits d'actes en ligne, aux agents de mairie de gérer les demandes, et au ministère de vérifier l'authenticité des documents.

---

## 🏗️ **ARCHITECTURE TECHNIQUE**

### **Stack Technologique**

| Composant | Technologie | Version |
|-----------|-------------|---------|
| **Frontend** | Next.js | 14.x |
| **Langage** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 3.x |
| **Base de données** | Supabase (PostgreSQL) | Latest |
| **Authentification** | Supabase Auth | Latest |
| **Storage** | Supabase Storage | Latest |
| **Realtime** | Supabase Realtime | Latest |
| **PDF Generation** | jsPDF | 2.x |
| **QR Code** | qrcode | 1.x |
| **QR Scanner** | @zxing/library | Latest |
| **Déploiement** | Netlify | Latest |

### **Architecture**

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Citoyen  │  │  Agent   │  │    Ministère     │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│              SUPABASE (Backend as a Service)         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │   Auth   │  │ Database │  │     Storage      │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│  ┌──────────┐  ┌──────────┐                        │
│  │ Realtime │  │    RLS   │                        │
│  └──────────┘  └──────────┘                        │
└─────────────────────────────────────────────────────┘
```

---

## ✅ **FONCTIONNALITÉS ACTUELLES**

### **👤 ESPACE CITOYEN**

#### **1. Authentification**
- ✅ Inscription avec email/mot de passe
- ✅ Connexion sécurisée
- ✅ Réinitialisation de mot de passe
- ✅ Profil utilisateur

#### **2. Demande d'Extraits**
- ✅ Sélection du type d'acte (Naissance, Mariage, Décès)
- ✅ Formulaire dynamique selon le type
- ✅ Champ numéro d'acte obligatoire
- ✅ Upload obligatoire de l'ancien acte (photo ou PDF)
- ✅ Sélection de la mairie
- ✅ Validation en temps réel

#### **3. Suivi des Demandes**
- ✅ Liste de toutes les demandes
- ✅ Statuts : En attente, En traitement, Approuvée, Rejetée
- ✅ Filtrage et recherche
- ✅ Téléchargement du PDF approuvé
- ✅ Rechargement automatique (30s)
- ✅ Notifications en temps réel

#### **4. PDF Citoyen**
- ✅ Format professionnel officiel
- ✅ En-tête République de Côte d'Ivoire
- ✅ Numéro d'acte affiché en haut
- ✅ QR Code de vérification en bas
- ✅ Signature et date
- ✅ Bordure élégante

---

### **🏢 ESPACE AGENT DE MAIRIE**

#### **1. Gestion des Demandes**
- ✅ Liste de toutes les demandes de la mairie
- ✅ Filtrage par statut
- ✅ Recherche par nom/prénom
- ✅ Détails complets de chaque demande
- ✅ Visualisation du document uploadé
- ✅ Rechargement automatique (30s)
- ✅ Notifications en temps réel

#### **2. Traitement des Demandes**
- ✅ Approuver une demande
- ✅ Rejeter avec motif (liste prédéfinie + autre)
- ✅ Génération automatique du PDF avec QR Code
- ✅ Upload automatique sur Supabase Storage
- ✅ Notification au citoyen

#### **3. Gestion des Actes d'État Civil**
- ✅ Création d'actes de naissance
- ✅ Création d'actes de mariage
- ✅ Création d'actes de décès
- ✅ Génération PDF avec QR Code
- ✅ Téléchargement immédiat
- ✅ Stockage dans la base de données

#### **4. PDF Actes Officiels**
- ✅ Format professionnel
- ✅ QR Code contenant le numéro d'acte
- ✅ En-tête officiel
- ✅ Signature de l'agent
- ✅ Numéro d'acte visible

#### **5. Statistiques**
- ✅ Nombre de demandes par statut
- ✅ Graphiques de performance
- ✅ Historique des demandes

---

### **🏛️ ESPACE MINISTÈRE**

#### **1. Vérification d'Authenticité**
- ✅ Scanner QR Code en temps réel
- ✅ Saisie manuelle du numéro d'acte
- ✅ Vérification instantanée
- ✅ Affichage des détails de l'acte
- ✅ Historique des vérifications
- ✅ Statistiques de vérification

#### **2. Statistiques Nationales**
- ✅ Vue d'ensemble nationale
- ✅ Performance par région
- ✅ Nombre total d'actes
- ✅ Graphiques et tableaux
- ✅ Export des données

#### **3. Détection de Fraudes**
- ✅ Système de détection automatique
- ✅ Alertes en temps réel
- ✅ Analyse des patterns suspects
- ✅ Rapport de fraudes

---

## 🔐 **SÉCURITÉ**

### **Authentification et Autorisation**
- ✅ Authentification Supabase Auth
- ✅ Row Level Security (RLS)
- ✅ Rôles : Citoyen, Agent, Ministère
- ✅ Sessions sécurisées
- ✅ Tokens JWT

### **Protection des Données**
- ✅ Chiffrement des données en transit (HTTPS)
- ✅ Chiffrement des données au repos
- ✅ Validation côté serveur
- ✅ Protection CSRF
- ✅ Sanitization des inputs

### **QR Code et Vérification**
- ✅ QR Code contenant uniquement le numéro d'acte
- ✅ Vérification cryptographique possible
- ✅ Traçabilité complète
- ✅ Historique des vérifications

---

## 🚀 **FONCTIONNALITÉS À VENIR**

### **📱 PHASE 1 : AMÉLIORATION UX (1-2 semaines)**

#### **Notifications Push**
- 🔜 Notifications navigateur
- 🔜 Notifications email automatiques
- 🔜 Notifications SMS (intégration Twilio)
- 🔜 Centre de notifications dans l'app

#### **Paiement en Ligne**
- 🔜 Intégration Orange Money
- 🔜 Intégration MTN Mobile Money
- 🔜 Intégration Wave
- 🔜 Paiement par carte bancaire (Stripe)
- 🔜 Génération de reçus automatiques

#### **Tableau de Bord Amélioré**
- 🔜 Widgets personnalisables
- 🔜 Graphiques interactifs avancés
- 🔜 Export Excel/PDF des statistiques
- 🔜 Filtres avancés par date/région

---

### **🔒 PHASE 2 : SÉCURITÉ AVANCÉE (2-3 semaines)**

#### **Tampon Digital Blockchain**
- 🔜 Signature numérique RSA
- 🔜 Horodatage certifié
- 🔜 Intégration blockchain (Ethereum/Polygon)
- 🔜 Certificat numérique infalsifiable
- 🔜 API publique de vérification

#### **Authentification Renforcée**
- 🔜 Authentification à deux facteurs (2FA)
- 🔜 Biométrie (empreinte digitale, Face ID)
- 🔜 Connexion avec CNI électronique
- 🔜 Historique des connexions

#### **Détection de Fraudes Avancée**
- 🔜 Intelligence artificielle pour détecter les faux documents
- 🔜 Analyse d'image automatique
- 🔜 Comparaison avec base de données nationale
- 🔜 Alertes automatiques au ministère

---

### **📊 PHASE 3 : ANALYTICS & IA (3-4 semaines)**

#### **Business Intelligence**
- 🔜 Dashboard BI complet
- 🔜 Prédictions de demandes (ML)
- 🔜 Analyse des tendances
- 🔜 Rapports automatiques hebdomadaires/mensuels
- 🔜 KPIs en temps réel

#### **Chatbot IA**
- 🔜 Assistant virtuel pour les citoyens
- 🔜 Réponses automatiques aux questions fréquentes
- 🔜 Aide à la navigation
- 🔜 Support multilingue (Français, Anglais, Langues locales)

#### **Reconnaissance Optique (OCR)**
- 🔜 Extraction automatique des données de l'ancien acte
- 🔜 Pré-remplissage du formulaire
- 🔜 Vérification automatique de cohérence
- 🔜 Détection de documents falsifiés

---

### **🌍 PHASE 4 : EXPANSION (1-2 mois)**

#### **Application Mobile Native**
- 🔜 App iOS (Swift)
- 🔜 App Android (Kotlin)
- 🔜 Scanner QR natif
- 🔜 Notifications push natives
- 🔜 Mode hors ligne

#### **Intégrations Gouvernementales**
- 🔜 Connexion avec la base nationale d'identité
- 🔜 Intégration avec les hôpitaux (naissances)
- 🔜 Intégration avec les tribunaux (mariages)
- 🔜 API pour autres ministères

#### **Services Additionnels**
- 🔜 Légalisation de documents
- 🔜 Apostille
- 🔜 Traduction certifiée
- 🔜 Casier judiciaire
- 🔜 Certificat de résidence
- 🔜 Certificat de nationalité

#### **Internationalisation**
- 🔜 Support multilingue complet
- 🔜 Devises multiples
- 🔜 Adaptation aux autres pays africains
- 🔜 API pour consulats et ambassades

---

### **🎓 PHASE 5 : ÉDUCATION & SUPPORT (1 mois)**

#### **Formation**
- 🔜 Tutoriels vidéo intégrés
- 🔜 Guide utilisateur interactif
- 🔜 Formation en ligne pour agents
- 🔜 Certification des agents

#### **Support Client**
- 🔜 Chat en direct
- 🔜 Système de tickets
- 🔜 Base de connaissances (FAQ)
- 🔜 Forum communautaire

#### **Accessibilité**
- 🔜 Mode sombre
- 🔜 Support lecteur d'écran
- 🔜 Taille de police ajustable
- 🔜 Contraste élevé
- 🔜 Navigation au clavier

---

## 📊 **BASE DE DONNÉES**

### **Tables Principales**

| Table | Description | Colonnes Clés |
|-------|-------------|---------------|
| `users` | Utilisateurs | id, email, role, nom, prenom, telephone |
| `mairies` | Mairies | id, nom_mairie, ville, region, code_mairie |
| `requests` | Demandes d'extraits | id, user_id, type_acte, numero_acte, statut, document_url |
| `naissances` | Actes de naissance | id, numero_acte, nom_enfant, date_naissance, mairie_id |
| `mariages` | Actes de mariage | id, numero_acte, nom_epoux, nom_epouse, date_mariage |
| `deces` | Actes de décès | id, numero_acte, nom_defunt, date_deces |
| `verifications_actes` | Historique vérifications | id, numero_acte, date_verification, resultat |
| `notifications` | Notifications | id, user_id, titre, message, lue |

### **Relations**
- `users` → `requests` (1:N)
- `mairies` → `requests` (1:N)
- `mairies` → `naissances` (1:N)
- `mairies` → `mariages` (1:N)
- `mairies` → `deces` (1:N)

---

## 🔄 **API ENDPOINTS**

### **Authentification**
- `POST /api/auth/signup` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/reset-password` - Réinitialisation

### **Demandes**
- `GET /api/requests` - Liste des demandes
- `POST /api/requests` - Créer une demande
- `PUT /api/requests/:id` - Modifier une demande
- `DELETE /api/requests/:id` - Supprimer une demande

### **Génération PDF**
- `POST /api/generer-extrait` - Générer PDF extrait
- `POST /api/generer-acte` - Générer PDF acte

### **Vérification**
- `POST /api/verifier-acte` - Vérifier authenticité
- `GET /api/verifications` - Historique vérifications

### **Statistiques**
- `GET /api/statistiques-nationales` - Stats nationales
- `GET /api/statistiques-mairie/:id` - Stats par mairie

---

## 📈 **MÉTRIQUES DE PERFORMANCE**

### **Objectifs**
- ⚡ Temps de chargement < 2s
- ⚡ Génération PDF < 3s
- ⚡ Vérification QR < 1s
- ⚡ Upload fichier < 5s
- ⚡ Disponibilité 99.9%

### **Monitoring**
- 📊 Google Analytics
- 📊 Supabase Analytics
- 📊 Netlify Analytics
- 📊 Sentry (Error tracking)

---

## 🌐 **DÉPLOIEMENT**

### **Environnements**

| Environnement | URL | Branche Git |
|---------------|-----|-------------|
| **Production** | https://mamairie.netlify.app | `main` |
| **Staging** | https://staging-mamairie.netlify.app | `staging` |
| **Développement** | http://localhost:3000 | `dev` |

### **CI/CD**
- ✅ Déploiement automatique sur push
- ✅ Tests automatiques
- ✅ Build optimisé
- ✅ Cache CDN
- ✅ SSL/TLS automatique

---

## 📱 **COMPATIBILITÉ**

### **Navigateurs**
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

### **Appareils**
- ✅ Desktop (Windows, Mac, Linux)
- ✅ Tablettes (iPad, Android)
- ✅ Smartphones (iOS, Android)
- ✅ Responsive design

---

## 📞 **SUPPORT**

### **Contact**
- 📧 Email: support@mamairie.ci
- 📱 Téléphone: +225 XX XX XX XX XX
- 💬 Chat: Dans l'application
- 🌐 Site web: https://mamairie.ci

### **Documentation**
- 📚 Guide utilisateur
- 👨‍💻 Documentation technique
- 🎥 Tutoriels vidéo
- ❓ FAQ

---

## 📄 **LICENCE**

© 2026 MaMairie - République de Côte d'Ivoire  
Tous droits réservés.

---

## 🎯 **ROADMAP**

| Phase | Fonctionnalités | Durée | Statut |
|-------|----------------|-------|--------|
| **Phase 0** | MVP (Fonctionnalités actuelles) | 2 mois | ✅ Terminé |
| **Phase 1** | Amélioration UX | 2 semaines | 🔜 À venir |
| **Phase 2** | Sécurité avancée | 3 semaines | 🔜 À venir |
| **Phase 3** | Analytics & IA | 4 semaines | 🔜 À venir |
| **Phase 4** | Expansion | 2 mois | 🔜 À venir |
| **Phase 5** | Éducation & Support | 1 mois | 🔜 À venir |

---

**🎉 MaMairie - Digitalisation de l'État Civil en Côte d'Ivoire 🇨🇮**
