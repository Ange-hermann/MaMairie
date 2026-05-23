# 📝 MODULE AVIS DE MENTION - Guide Complet

## 🎯 **PRÉSENTATION**

Le module **Avis de Mention** permet aux citoyens de demander l'apposition d'une mention marginale sur un acte d'état civil existant pour signaler un événement postérieur important.

### **Exemples de mentions :**
- 💔 Divorce sur un acte de mariage
- 👶 Reconnaissance de paternité sur un acte de naissance
- ⚰️ Décès sur un acte de naissance
- 📝 Changement de nom ou prénom
- 👨‍👩‍👧 Adoption
- 💍 Mariage sur un acte de naissance

---

## 📋 **INSTALLATION**

### **1. Exécuter le script SQL dans Supabase**

Allez sur **Supabase** → **SQL Editor** et exécutez :

```sql
-- Fichier: supabase/create-avis-mentions.sql
```

Ce script va :
- ✅ Créer la table `avis_mentions`
- ✅ Créer la table `mentions_apposees` (historique)
- ✅ Créer les enums : `type_acte_mention_enum`, `type_mention_enum`, `statut_mention_enum`
- ✅ Configurer les index pour les performances
- ✅ Activer Row Level Security (RLS)
- ✅ Créer les policies de sécurité

### **2. Créer le bucket Supabase Storage**

Dans **Supabase** → **Storage** :
1. Créer un bucket nommé `documents`
2. Configurer comme **public** pour permettre l'accès aux fichiers
3. Définir les policies d'upload

### **3. Vérifier les dépendances**

Les packages nécessaires sont déjà installés :
- `@supabase/auth-helpers-nextjs`
- `lucide-react`
- `next`

---

## 🚀 **FONCTIONNALITÉS**

### **👤 ESPACE CITOYEN**

#### **1. Soumettre un avis de mention**
- URL : `/citoyen/avis-mention`
- Formulaire en **3 étapes** :

**ÉTAPE 1 : Identifier l'acte**
- Sélectionner le type d'acte (Naissance / Mariage / Décès)
- Saisir le numéro de l'acte
- Saisir l'année de l'acte
- **Vérifier l'existence** de l'acte en base
- Affichage des informations de l'acte trouvé

**ÉTAPE 2 : Détails de la mention**
- Sélectionner le type de mention (selon l'acte)
- Saisir la date de l'événement
- Décrire les détails de la mention
- **Upload de pièces justificatives** (max 5 fichiers)
  - Formats acceptés : PDF, JPG, PNG
  - Drag & drop disponible
  - Preview des fichiers uploadés

**ÉTAPE 3 : Récapitulatif et confirmation**
- Affichage de toutes les informations
- Checkbox de certification
- Soumission de l'avis
- **Page de confirmation** avec code de suivi

#### **2. Code de suivi**
Après soumission, le citoyen reçoit un code unique :
```
Format : MEN-2026-ABJ-00001
- MEN = Type (Mention)
- 2026 = Année
- ABJ = Code mairie (3 lettres)
- 00001 = Numéro séquentiel
```

#### **3. Suivi de l'avis**
- URL : `/suivi-mention`
- Accessible **SANS connexion**
- Saisir le code de suivi
- Voir le statut en temps réel
- Timeline visuelle des étapes

---

### **👨‍💼 ESPACE AGENT**

#### **1. Liste des avis de mention**
- URL : `/agent/avis-mentions`
- Tableau avec toutes les demandes
- Statistiques en temps réel :
  - Total des avis
  - En attente
  - En traitement
  - Approuvées
- Filtres par statut
- Recherche par code, numéro acte, citoyen
- Rechargement automatique (30s)
- Notifications temps réel (Supabase Realtime)

#### **2. Traiter un avis**
- URL : `/agent/avis-mentions/[id]`
- Affichage complet :
  - Informations du demandeur
  - Détails de l'acte ciblé
  - Affichage de l'acte original
  - Type et détails de la mention
  - Pièces justificatives (viewer intégré)
- Actions possibles :
  - ✅ **Approuver** → Crée la mention apposée
  - ❌ **Rejeter** → Avec motif obligatoire

---

## 🔄 **WORKFLOW COMPLET**

```
CITOYEN
  ↓
  Remplit formulaire (3 étapes)
  ↓
  Vérifie l'acte existant
  ↓
  Upload pièces justificatives
  ↓
  Reçoit CODE: MEN-2026-ABJ-00001
  ↓
  Peut suivre sur /suivi-mention

AGENT
  ↓
  Voit dans /agent/avis-mentions
  ↓
  Clique "Traiter"
  ↓
  Consulte acte + pièces
  ↓
  APPROUVE ou REJETTE
  ↓
  Si APPROUVÉ → Mention apposée

CITOYEN
  ↓
  Voit mise à jour sur /suivi-mention
  ↓
  Peut demander nouvel extrait avec mention
```

---

## 📊 **STRUCTURE DE LA BASE DE DONNÉES**

### **Table : avis_mentions**

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `code_suivi` | TEXT | Code unique (MEN-AAAA-XXX-XXXXX) |
| `citoyen_id` | UUID | ID du citoyen demandeur |
| `type_acte_cible` | ENUM | Type d'acte (naissance/mariage/deces) |
| `numero_acte_cible` | TEXT | Numéro de l'acte à annoter |
| `mairie_id` | UUID | ID de la mairie |
| `annee_acte_cible` | INTEGER | Année de l'acte |
| `type_mention` | ENUM | Type de mention à apposer |
| `description_mention` | TEXT | Détails de la mention |
| `date_evenement` | DATE | Date de l'événement |
| `pieces_justificatives` | TEXT[] | URLs des documents |
| `statut` | ENUM | en_attente / en_traitement / approuvee / rejetee |
| `motif_rejet` | TEXT | Motif si rejetée |
| `agent_id` | UUID | ID de l'agent traitant |
| `date_traitement` | TIMESTAMP | Date de traitement |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Date de modification |

### **Table : mentions_apposees**

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `avis_mention_id` | UUID | ID de l'avis approuvé |
| `type_acte` | ENUM | Type d'acte annoté |
| `acte_id` | UUID | ID de l'acte |
| `type_mention` | ENUM | Type de mention |
| `texte_mention` | TEXT | Texte de la mention |
| `date_mention` | DATE | Date de la mention |
| `agent_id` | UUID | Agent ayant apposé |
| `date_apposition` | TIMESTAMP | Date d'apposition |

---

## 🔐 **SÉCURITÉ (RLS)**

### **Policies Configurées**

1. **Citoyens** :
   - ✅ Peuvent voir leurs propres avis
   - ✅ Peuvent créer leurs avis

2. **Agents** :
   - ✅ Voient les avis de leur mairie
   - ✅ Peuvent modifier les avis de leur mairie

3. **Ministère** :
   - ✅ Voit tous les avis

4. **Public** :
   - ✅ Peut rechercher par code de suivi (pour le suivi)

---

## 📁 **FICHIERS CRÉÉS**

### **Base de données**
- `supabase/create-avis-mentions.sql` - Migration complète

### **Utilitaires**
- `lib/generateCodeMention.ts` - Génération et validation codes
- `types/mention.ts` - Types TypeScript

### **Composants**
- `components/AvisMentionForm.tsx` - Formulaire 3 étapes

### **Pages Citoyen**
- `app/citoyen/avis-mention/page.tsx` - Soumettre un avis
- `app/suivi-mention/page.tsx` - Suivi public

### **Pages Agent**
- `app/agent/avis-mentions/page.tsx` - Liste des avis
- `app/agent/avis-mentions/[id]/page.tsx` - Traiter un avis

### **Navigation**
- `components/layout/Sidebar.tsx` - Liens ajoutés (citoyen + agent)

---

## 🎨 **DESIGN**

### **Couleurs**
- 🟠 Orange `#E67E22` : Actions principales
- 🟢 Vert `#1A6B3C` : Validations
- 🔵 Bleu : Informations
- 🔴 Rouge : Rejets/Erreurs

### **Icônes par type de mention**
- 💔 Divorce
- 👶 Reconnaissance paternité
- 👨‍👩‍👧 Adoption
- 📝 Changement nom/prénom
- ⚰️ Décès
- 💍 Mariage
- ❌ Annulation
- ✏️ Rectification

---

## 🧪 **TESTS**

### **Test Citoyen**

1. Connectez-vous en tant que citoyen
2. Allez sur `/citoyen/avis-mention`
3. Remplissez le formulaire (3 étapes)
4. Vérifiez un acte existant
5. Uploadez des fichiers
6. Soumettez
7. Notez le code de suivi
8. Allez sur `/suivi-mention`
9. Entrez le code
10. Vérifiez le statut

### **Test Agent**

1. Connectez-vous en tant qu'agent
2. Allez sur `/agent/avis-mentions`
3. Cliquez sur "Traiter"
4. Consultez les détails
5. Approuvez ou rejetez
6. Vérifiez la mise à jour

---

## 🔧 **DÉPANNAGE**

### **Problème : Code de suivi non généré**

```sql
-- Vérifier que la mairie a un code_mairie
SELECT id, nom_mairie, code_mairie FROM mairies;

-- Si manquant, ajouter :
UPDATE mairies 
SET code_mairie = UPPER(SUBSTRING(ville, 1, 3))
WHERE code_mairie IS NULL;
```

### **Problème : Upload de fichiers échoue**

1. Vérifier que le bucket `documents` existe dans Supabase Storage
2. Vérifier que le bucket est public
3. Vérifier les policies d'upload

### **Problème : Avis non visibles**

```sql
-- Vérifier que l'agent a une mairie assignée
SELECT id, email, role, mairie_id FROM users WHERE role = 'agent';

-- Assigner une mairie si manquant
UPDATE users 
SET mairie_id = (SELECT id FROM mairies LIMIT 1)
WHERE role = 'agent' AND mairie_id IS NULL;
```

---

## 📈 **STATISTIQUES**

Les statistiques sont calculées en temps réel :
- Total des avis de mention
- En attente de traitement
- En cours de traitement
- Approuvées
- Rejetées

---

## 🚀 **AMÉLIORATIONS FUTURES**

### **Phase 1 : Notifications**
- 📧 Email au citoyen (soumission, approbation, rejet)
- 📱 SMS avec code de suivi
- 🔔 Notifications push

### **Phase 2 : Génération PDF avec mentions**
- 📄 Modifier les templates PDF des actes
- 📋 Afficher les mentions en marge
- 🖨️ Générer acte mis à jour automatiquement

### **Phase 3 : Historique des mentions**
- 📜 Timeline des mentions par acte
- 👁️ Consultation de l'historique
- 📊 Statistiques par type de mention

### **Phase 4 : Validation automatique**
- 🤖 Vérification automatique des pièces
- ✅ Approbation automatique si critères OK
- ⚠️ Alertes si anomalies détectées

---

## 📞 **SUPPORT**

Pour toute question :
- 📧 Email : support@mamairie.ci
- 📱 Téléphone : +225 XX XX XX XX XX
- 💬 Chat : Dans l'application

---

**🎉 MODULE AVIS DE MENTION COMPLET ! 🇨🇮**
