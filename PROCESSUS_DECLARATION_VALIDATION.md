# 📋 PROCESSUS COMPLET - DÉCLARATION ET VALIDATION

## 🎯 **OBJECTIF**

Mettre en place un processus sécurisé de déclaration avec :
1. Avertissements légaux obligatoires
2. Validation physique des documents
3. Remise en main propre

---

## 📝 **ÉTAPE 1 : DÉCLARATION PAR LE CITOYEN**

### **1.1 Formulaire de déclaration**

Le citoyen remplit le formulaire de déclaration (naissance, mariage, décès).

### **1.2 Mentions d'avertissement légal** ⚠️

**AVANT de valider, afficher une modale avec :**

```
┌─────────────────────────────────────────────────────┐
│  ⚠️ AVERTISSEMENTS LÉGAUX - LOI N° 2018-862        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ⚠️ Fausse déclaration :                           │
│  Toute fausse déclaration à l'état civil est       │
│  passible de sanctions pénales prévues par le      │
│  Code pénal ivoirien.                              │
│                                                     │
│  ⚠️ Délai de traitement :                          │
│  La demande sera traitée dans un délai de 5 à 10   │
│  jours ouvrés selon la commune concernée.          │
│                                                     │
│  ⚠️ Retrait du document :                          │
│  Le document ne sera remis qu'à la personne dont   │
│  l'identité correspond à celle enregistrée dans    │
│  la demande, sur présentation d'une pièce          │
│  d'identité valide.                                │
│                                                     │
│  ⚠️ Validité du document :                         │
│  L'extrait ou la copie délivrée a une validité     │
│  de 3 mois pour les usages administratifs          │
│  courants.                                         │
│                                                     │
├─────────────────────────────────────────────────────┤
│  ☑️ J'ai lu et j'accepte ces conditions            │
│                                                     │
│  [Annuler]              [Accepter et Soumettre]    │
└─────────────────────────────────────────────────────┘
```

**Checkbox obligatoire :**
- Le citoyen DOIT cocher "J'ai lu et j'accepte"
- Le bouton "Accepter et Soumettre" est désactivé tant que non coché

### **1.3 Soumission**

Après acceptation :
- Déclaration enregistrée avec statut `en_attente`
- Code unique généré (ex: `DEC-2024-001234`)
- Email/SMS envoyé au citoyen avec le code

---

## 📬 **ÉTAPE 2 : NOTIFICATION AU CITOYEN**

**Email/SMS envoyé :**

```
✅ Déclaration enregistrée !

Code de suivi : DEC-2024-001234

Votre déclaration a été enregistrée avec succès.

📍 Mairie/SP : Mairie de Cocody
⏱️ Délai : 5-10 jours ouvrés

⚠️ IMPORTANT :
Lorsque votre demande sera validée, vous devrez vous 
présenter à la mairie avec :
- Votre pièce d'identité
- Les documents originaux demandés
- Ce code de suivi

Le document vous sera remis EN MAIN PROPRE uniquement.
```

---

## 🏢 **ÉTAPE 3 : TRAITEMENT PAR L'AGENT**

### **3.1 Agent examine la déclaration**

L'agent voit la déclaration dans son dashboard avec statut `en_attente`.

### **3.2 Agent valide la déclaration**

L'agent clique sur "Valider" :
- Statut passe à `validee`
- Email/SMS envoyé au citoyen : "Votre déclaration est prête. Présentez-vous à la mairie avec vos documents."

---

## 👤 **ÉTAPE 4 : CITOYEN SE PRÉSENTE À LA MAIRIE**

### **4.1 Citoyen arrive avec :**
- ✅ Pièce d'identité
- ✅ Documents originaux
- ✅ Code de suivi

### **4.2 Agent recherche la déclaration**

**Interface agent :**

```
┌─────────────────────────────────────────────────────┐
│  🔍 RECHERCHER UNE DÉCLARATION                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Code de suivi ou Nom du citoyen :                 │
│  [DEC-2024-001234                            ] 🔍  │
│                                                     │
└─────────────────────────────────────────────────────┘

Résultat :
┌─────────────────────────────────────────────────────┐
│  📄 Déclaration de Naissance                        │
│  Code : DEC-2024-001234                             │
│  Citoyen : KOUADIO Yao                              │
│  Statut : ✅ Validée - En attente de retrait        │
│                                                     │
│  [Voir Détails]                                     │
└─────────────────────────────────────────────────────┘
```

---

## ✅ **ÉTAPE 5 : VÉRIFICATION DES DOCUMENTS**

### **5.1 Agent vérifie l'identité**

```
┌─────────────────────────────────────────────────────┐
│  👤 VÉRIFICATION D'IDENTITÉ                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Nom du citoyen : KOUADIO Yao                       │
│  Pièce présentée : CNI / Passeport / Attestation   │
│                                                     │
│  ☑️ L'identité correspond                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### **5.2 Agent coche les documents reçus**

```
┌─────────────────────────────────────────────────────┐
│  📋 DOCUMENTS À VÉRIFIER                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Documents requis pour cette déclaration :          │
│                                                     │
│  ☑️ Certificat médical de naissance                │
│  ☑️ Pièce d'identité du père                       │
│  ☑️ Pièce d'identité de la mère                    │
│  ☑️ Acte de mariage des parents (si applicable)    │
│  ☐ Attestation de domicile                         │
│                                                     │
│  Observations :                                     │
│  [Tous les documents sont conformes            ]   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### **5.3 Agent confirme la réception**

```
┌─────────────────────────────────────────────────────┐
│  ✅ CONFIRMATION DE RÉCEPTION                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ☑️ J'atteste avoir vérifié et reçu tous les       │
│     documents originaux du déclarant               │
│                                                     │
│  ☑️ J'atteste que l'identité du citoyen            │
│     correspond à la déclaration                    │
│                                                     │
│  Signature électronique :                          │
│  Agent : KOUAME Marie (ID: AG-001)                 │
│  Date : 22/05/2024 20:20                           │
│                                                     │
│  [Annuler]              [Confirmer et Générer]     │
└─────────────────────────────────────────────────────┘
```

---

## 📄 **ÉTAPE 6 : GÉNÉRATION DE L'ACTE**

### **6.1 Après confirmation**

- Statut passe à `documents_verifies`
- Bouton "Générer l'Acte" devient actif

### **6.2 Agent génère l'acte**

```
┌─────────────────────────────────────────────────────┐
│  📄 GÉNÉRATION DE L'ACTE                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Type : Acte de Naissance                          │
│  N° : 2024/001234                                   │
│                                                     │
│  [Aperçu]  [Générer PDF]  [Imprimer]              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### **6.3 Remise en main propre**

- Agent imprime l'acte
- Agent fait signer le registre de retrait
- Agent remet l'acte au citoyen
- Statut passe à `remis`

---

## 🗄️ **STRUCTURE DE DONNÉES**

### **Table : declarations**

```sql
CREATE TABLE declarations (
  id UUID PRIMARY KEY,
  code_suivi VARCHAR(20) UNIQUE, -- DEC-2024-001234
  user_id UUID REFERENCES users(id),
  type_acte VARCHAR(20), -- naissance, mariage, deces
  statut VARCHAR(30), -- en_attente, validee, documents_verifies, remis
  
  -- Acceptation des conditions
  conditions_acceptees BOOLEAN DEFAULT FALSE,
  date_acceptation_conditions TIMESTAMP,
  
  -- Vérification documents
  documents_verifies BOOLEAN DEFAULT FALSE,
  date_verification_documents TIMESTAMP,
  agent_verificateur_id UUID REFERENCES users(id),
  documents_recus JSONB, -- Liste des documents cochés
  observations_agent TEXT,
  
  -- Remise
  date_remise TIMESTAMP,
  agent_remise_id UUID REFERENCES users(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎨 **INTERFACE UTILISATEUR**

### **Pour le citoyen :**
1. Formulaire de déclaration
2. Modale d'avertissements légaux
3. Checkbox "J'accepte"
4. Bouton "Accepter et Soumettre"
5. Page de suivi avec code

### **Pour l'agent :**
1. Dashboard des déclarations
2. Recherche par code/nom
3. Formulaire de vérification documents
4. Checkboxes pour chaque document
5. Confirmation avec signature électronique
6. Génération de l'acte

---

## 🔒 **SÉCURITÉ**

### **Traçabilité complète :**
- ✅ Date d'acceptation des conditions
- ✅ Agent qui a vérifié les documents
- ✅ Liste des documents reçus
- ✅ Date de remise
- ✅ Agent qui a remis l'acte

### **Prévention des fraudes :**
- ✅ Vérification d'identité obligatoire
- ✅ Documents originaux requis
- ✅ Remise en main propre uniquement
- ✅ Signature électronique de l'agent

---

## 📊 **WORKFLOW COMPLET**

```
CITOYEN                    SYSTÈME                    AGENT
   |                          |                          |
   |-- Remplit formulaire --->|                          |
   |                          |                          |
   |<-- Modale avertissements-|                          |
   |                          |                          |
   |-- Accepte conditions --->|                          |
   |                          |                          |
   |<-- Code DEC-2024-001234--|                          |
   |                          |                          |
   |                          |<-- Examine déclaration --|
   |                          |                          |
   |<-- Email "Validée" ------|<-- Valide ---------------|
   |                          |                          |
   |-- Se présente à mairie ->|                          |
   |                          |                          |
   |                          |<-- Recherche code -------|
   |                          |                          |
   |-- Présente documents --->|                          |
   |                          |                          |
   |                          |<-- Coche documents ------|
   |                          |                          |
   |                          |<-- Confirme réception ---|
   |                          |                          |
   |                          |<-- Génère acte ----------|
   |                          |                          |
   |<-- Reçoit acte ----------|<-- Remet en main propre -|
   |                          |                          |
```

---

**🎉 PROCESSUS COMPLET ET SÉCURISÉ CONFORME À LA LOI IVOIRIENNE ! 🇨🇮**
