# ✅ IMPLÉMENTATION - DÉCLARATIONS AVEC AVERTISSEMENTS LÉGAUX

## 🎯 **OBJECTIF**

Ajouter la modale d'avertissements légaux aux **DÉCLARATIONS** (naissance, mariage, décès).

---

## ✅ **MODIFICATIONS APPLIQUÉES**

### **1. Composant DeclarationNaissanceForm.tsx** ✅

**Fichier :** `components/DeclarationNaissanceForm.tsx`

**Changements :**
1. ✅ Import de `ModalAvertissementsLegaux`
2. ✅ Ajout du state `showModalAvertissements`
3. ✅ Bouton "Soumettre" ouvre la modale
4. ✅ `handleSubmit` modifié pour :
   - Fermer la modale après soumission
   - Enregistrer `conditions_acceptees: true`
   - Enregistrer `date_acceptation_conditions`
5. ✅ Modale ajoutée dans le JSX

---

### **2. Script SQL** ✅

**Fichier :** `supabase/ajouter-colonnes-declarations.sql`

**Colonnes ajoutées à `declarations_naissance` :**
- `conditions_acceptees` BOOLEAN
- `date_acceptation_conditions` TIMESTAMP
- `documents_verifies` BOOLEAN
- `date_verification_documents` TIMESTAMP
- `agent_verificateur_id` UUID
- `documents_recus` JSONB
- `observations_agent` TEXT
- `date_remise` TIMESTAMP
- `agent_remise_id` UUID
- `statut` VARCHAR(30)

---

## 🔄 **NOUVEAU WORKFLOW**

### **Avant :**
```
1. Citoyen remplit formulaire (4 étapes)
2. Étape 4 : Checkbox "Je certifie..."
3. Clique "Soumettre"
4. Déclaration créée
5. Code de suivi affiché
```

### **Maintenant :**
```
1. Citoyen remplit formulaire (4 étapes)
2. Étape 4 : Checkbox "Je certifie..."
3. Clique "Soumettre"
4. ⚠️ MODALE D'AVERTISSEMENTS S'AFFICHE
5. Citoyen lit les 4 avertissements légaux
6. Citoyen coche "J'ai lu et j'accepte"
7. Clique "Accepter et Soumettre"
8. Déclaration créée avec conditions_acceptees = true
9. Code de suivi affiché
```

---

## 📊 **DONNÉES ENREGISTRÉES**

```json
{
  "code_suivi": "DEC-2024-001234",
  "citoyen_id": "...",
  "nom_enfant": "KOUADIO",
  "prenom_enfant": "Yao",
  "conditions_acceptees": true,
  "date_acceptation_conditions": "2024-05-22T20:30:00Z",
  "statut": "en_attente",
  ...
}
```

---

## 🎨 **INTERFACE UTILISATEUR**

### **Page de déclaration :**
```
Étape 1 : Informations de l'enfant
Étape 2 : Informations du père
Étape 3 : Informations de la mère
Étape 4 : Récapitulatif + Checkbox

[Soumettre la déclaration] ← Ouvre la modale
```

### **Modale d'avertissements :**
```
┌─────────────────────────────────────────┐
│ ⚠️ AVERTISSEMENTS LÉGAUX                │
│ Loi n° 2018-862 du 19 juin 2018        │
├─────────────────────────────────────────┤
│                                         │
│ 🔴 Fausse déclaration                  │
│ Sanctions pénales...                   │
│                                         │
│ 🟠 Délai de traitement                 │
│ 5-10 jours ouvrés...                   │
│                                         │
│ 🔵 Retrait du document                 │
│ En main propre avec pièce d'identité...│
│                                         │
│ 🟣 Validité du document                │
│ 3 mois pour usages administratifs...   │
│                                         │
│ ☑️ J'ai lu et j'accepte                │
│                                         │
│ [Annuler] [Accepter et Soumettre]      │
└─────────────────────────────────────────┘
```

---

## 🚀 **POUR TESTER**

### **1. Exécuter le script SQL** ⏳
```sql
-- Dans Supabase SQL Editor
supabase/ajouter-colonnes-declarations.sql
```

### **2. Tester la déclaration** ⏳
1. Allez sur `/citoyen/declaration-naissance`
2. Remplissez les 4 étapes
3. Cliquez "Soumettre la déclaration"
4. ✅ La modale s'affiche
5. Lisez les avertissements
6. Cochez "J'accepte"
7. Cliquez "Accepter et Soumettre"
8. ✅ Code de suivi affiché

---

## 📋 **PROCHAINES ÉTAPES**

### **À FAIRE :**

**1. Appliquer aux autres déclarations** ⏳
- Déclaration de mariage
- Déclaration de décès

**2. Partie Agent** ⏳
- Recherche par code de suivi
- Vérification des documents
- Checkbox pour chaque document
- Confirmation "J'atteste avoir vérifié..."
- Génération de l'acte

**3. Statuts** ⏳
- `en_attente` → Déclaration soumise
- `validee` → Agent a validé
- `documents_verifies` → Agent a vérifié les documents
- `remis` → Document remis au citoyen
- `rejetee` → Déclaration rejetée

---

## 🎉 **RÉSULTAT**

✅ Modale d'avertissements légaux sur les déclarations
✅ Code de suivi généré
✅ Traçabilité complète (date d'acceptation)
✅ Conforme à la loi n° 2018-862

---

**📄 EXÉCUTEZ LE SCRIPT SQL PUIS TESTEZ LA DÉCLARATION ! 🚀**
