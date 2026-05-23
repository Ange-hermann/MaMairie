# 📋 SYSTÈME AVIS DE MENTION - IDENTIQUE AUX DÉCLARATIONS

## 🎯 **OBJECTIF**

Appliquer le même système que les déclarations pour les **Avis de Mention** :
- Modale d'avertissements légaux
- Code de suivi
- 2 onglets (Validation + Traitement)
- Vérification des documents
- Génération de l'acte

---

## 📝 **C'EST QUOI UN AVIS DE MENTION ?**

Un avis de mention est une **modification** à apporter sur un acte existant :
- Mention de mariage (sur acte de naissance)
- Mention de divorce (sur acte de mariage)
- Mention de décès (sur acte de naissance)
- Mention de reconnaissance (sur acte de naissance)

---

## 🔄 **WORKFLOW COMPLET**

### **PARTIE CITOYEN**

```
1. Citoyen va sur /citoyen/avis-mention
2. Remplit le formulaire:
   - Type de mention (mariage, divorce, décès...)
   - Numéro de l'acte à modifier
   - Informations de la mention
   - Upload documents
3. Modale d'avertissements s'affiche
4. Accepte les conditions
5. Reçoit code: MENT-2024-001234
6. Statut: en_attente
```

### **PARTIE AGENT - VALIDATION**

```
7. Agent voit dans onglet "Validation"
8. Examine les informations
9. Clique "Valider" ou "Rejeter"
10. Si validé → Statut: validee
11. Citoyen reçoit email: "Venez avec vos documents"
```

### **PARTIE AGENT - TRAITEMENT**

```
12. Citoyen vient avec:
    - Pièce d'identité
    - Acte original à modifier
    - Documents justificatifs
    - Code: MENT-2024-001234

13. Agent va dans onglet "Traitement"
14. Tape le code dans la recherche
15. Informations s'affichent
16. Clique "Vérifier les Documents"
17. Modale s'ouvre
18. Agent coche les documents
19. Confirme
20. Statut: documents_verifies
21. Agent clique "Générer la Mention"
22. Mention générée et apposée sur l'acte
23. Statut: remis
```

---

## 📊 **STRUCTURE DE DONNÉES**

### **Table : avis_mention**

```sql
CREATE TABLE avis_mention (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code_suivi VARCHAR(20) UNIQUE, -- MENT-2024-001234
  citoyen_id UUID REFERENCES users(id),
  mairie_id UUID REFERENCES mairies(id),
  
  -- Type de mention
  type_mention VARCHAR(30), -- mariage, divorce, deces, reconnaissance
  
  -- Acte à modifier
  numero_acte_original VARCHAR(50),
  type_acte_original VARCHAR(20), -- naissance, mariage
  
  -- Informations de la mention
  date_evenement DATE,
  lieu_evenement VARCHAR(100),
  details JSONB, -- Détails selon le type
  
  -- Documents
  document_url TEXT,
  document_name TEXT,
  
  -- Statuts
  statut VARCHAR(30) DEFAULT 'en_attente',
  
  -- Acceptation conditions
  conditions_acceptees BOOLEAN DEFAULT FALSE,
  date_acceptation_conditions TIMESTAMP,
  
  -- Vérification documents
  documents_verifies BOOLEAN DEFAULT FALSE,
  date_verification_documents TIMESTAMP,
  agent_verificateur_id UUID REFERENCES users(id),
  documents_recus JSONB,
  observations_agent TEXT,
  
  -- Remise
  date_remise TIMESTAMP,
  agent_remise_id UUID REFERENCES users(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎨 **INTERFACE CITOYEN**

### **Page : /citoyen/avis-mention**

**Formulaire en 3 étapes :**

**Étape 1 : Type de mention**
```
Quel type de mention souhaitez-vous ?
○ Mention de mariage
○ Mention de divorce
○ Mention de décès
○ Mention de reconnaissance
```

**Étape 2 : Acte à modifier**
```
Numéro de l'acte original : [________]
Type d'acte : [Naissance ▼]
Date de l'acte : [__/__/____]
```

**Étape 3 : Informations de la mention**
```
(Selon le type choisi)

Si Mariage:
- Date du mariage
- Lieu du mariage
- Nom du conjoint
- Upload acte de mariage

Si Décès:
- Date du décès
- Lieu du décès
- Upload acte de décès
```

**Étape 4 : Récapitulatif + Modale**

---

## 🎨 **INTERFACE AGENT**

### **Page : /agent/avis-mention**

**2 Onglets :**

**1. ✅ VALIDATION**
```
- Tableau des avis en_attente
- Recherche par nom
- Actions: Valider / Rejeter
```

**2. 🔍 TRAITEMENT**
```
- Grand champ de recherche
- Tape: MENT-2024-001234
- Carte s'affiche avec infos
- Boutons: Vérifier Documents / Générer Mention
```

---

## 📄 **FICHIERS À CRÉER**

### **1. Script SQL**
- `supabase/creer-table-avis-mention.sql`

### **2. Composants**
- `components/AvisMentionForm.tsx` (formulaire citoyen)
- Réutiliser `ModalAvertissementsLegaux.tsx`
- Réutiliser `VerificationDocumentsModal.tsx`

### **3. Pages**
- `app/citoyen/avis-mention/page.tsx`
- `app/agent/avis-mention/page.tsx`

### **4. Lib**
- `lib/generateCodeSuiviMention.ts`

---

## 🔄 **RÉUTILISATION**

**Ce qu'on réutilise des déclarations :**
- ✅ Modale d'avertissements légaux
- ✅ Modale de vérification documents
- ✅ Système de 2 onglets
- ✅ Interface de recherche par code
- ✅ Affichage type carte

**Ce qui change :**
- ❌ Formulaire différent (mention vs naissance)
- ❌ Code différent (MENT- vs DEC-)
- ❌ Champs différents (acte original + mention)
- ❌ Documents différents selon le type

---

## 📋 **TYPES DE MENTIONS**

### **1. Mention de Mariage**
**Documents requis :**
- Acte de mariage
- Pièce d'identité
- Acte de naissance original

### **2. Mention de Divorce**
**Documents requis :**
- Jugement de divorce
- Pièce d'identité
- Acte de mariage original

### **3. Mention de Décès**
**Documents requis :**
- Acte de décès
- Pièce d'identité du déclarant
- Acte de naissance original

### **4. Mention de Reconnaissance**
**Documents requis :**
- Acte de reconnaissance
- Pièce d'identité du parent
- Acte de naissance original

---

## 🚀 **PLAN D'IMPLÉMENTATION**

### **Étape 1 : Base de données**
1. Créer table `avis_mention`
2. Créer fonction génération code
3. Créer trigger

### **Étape 2 : Formulaire citoyen**
1. Créer `AvisMentionForm.tsx`
2. Intégrer modale d'avertissements
3. Créer page `/citoyen/avis-mention`

### **Étape 3 : Interface agent**
1. Créer page `/agent/avis-mention`
2. Implémenter 2 onglets
3. Interface validation (tableau)
4. Interface traitement (recherche par code)

### **Étape 4 : Vérification documents**
1. Adapter `VerificationDocumentsModal`
2. Documents selon type de mention
3. Génération de la mention

---

## 🎉 **RÉSULTAT FINAL**

**Système complet identique aux déclarations :**
- ✅ Modale d'avertissements
- ✅ Code de suivi (MENT-2024-XXXXXX)
- ✅ 2 onglets (Validation + Traitement)
- ✅ Recherche par code
- ✅ Vérification documents
- ✅ Génération mention
- ✅ Traçabilité complète

---

**📄 VOULEZ-VOUS QUE JE COMMENCE L'IMPLÉMENTATION ? 🚀**
