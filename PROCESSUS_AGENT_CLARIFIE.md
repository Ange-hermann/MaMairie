# 📋 PROCESSUS AGENT - CLARIFIÉ

## 🎯 **COMMENT ÇA MARCHE VRAIMENT**

### **SCÉNARIO COMPLET**

---

## 📱 **PARTIE 1 : DÉCLARATION EN LIGNE**

**Citoyen (chez lui, sur internet) :**
```
1. Va sur le site → /citoyen/declaration-naissance
2. Remplit le formulaire (4 étapes)
3. Soumet → Modale d'avertissements
4. Accepte → Déclaration créée
5. Reçoit code: DEC-2024-001234
6. Statut: en_attente
```

**Base de données :**
```json
{
  "code_suivi": "DEC-2024-001234",
  "nom_enfant": "KOUADIO",
  "prenom_enfant": "Yao",
  "statut": "en_attente",
  "mairie_id": "uuid-mairie-cocody"
}
```

---

## 🏢 **PARTIE 2 : AGENT EXAMINE (au bureau)**

**Agent de la Mairie de Cocody :**
```
1. Se connecte → /agent/declarations
2. Voit la liste des déclarations de SA mairie
3. Voit: "DEC-2024-001234 | KOUADIO Yao | en_attente"
4. Clique sur la ligne → Détails s'affichent
5. Examine les informations (père, mère, enfant)
6. Clique "Valider" → Statut: validee
```

**Email automatique au citoyen :**
```
Bonjour,

Votre déclaration DEC-2024-001234 a été validée.

Prochaine étape:
Présentez-vous à la Mairie de Cocody avec:
- Votre pièce d'identité
- Les documents originaux
- Ce code: DEC-2024-001234

L'agent vérifiera vos documents et vous remettra l'acte.

Cordialement,
Mairie de Cocody
```

---

## 👤 **PARTIE 3 : CITOYEN VIENT À LA MAIRIE**

**Citoyen (quelques jours plus tard) :**
```
1. Reçoit l'email
2. Prépare ses documents:
   - CNI
   - Certificat médical de naissance
   - Pièce d'identité du père
   - Pièce d'identité de la mère
   - Acte de mariage des parents
3. Va à la Mairie de Cocody
4. Dit à l'agent: "J'ai le code DEC-2024-001234"
```

---

## 🔍 **PARTIE 4 : AGENT RECHERCHE PAR CODE**

**Agent (au guichet) :**
```
1. Citoyen dit: "DEC-2024-001234"
2. Agent va sur /agent/declarations
3. Tape dans la barre de recherche: "DEC-2024-001234"
4. Trouve la déclaration (statut: validee)
5. Voit:
   - Nom: KOUADIO Yao
   - Code: DEC-2024-001234
   - Statut: Validée ✅
   - Bouton: "Vérifier les Documents"
```

**IMPORTANT :**
- L'agent ne peut traiter QUE les déclarations avec code
- La recherche doit fonctionner par code OU par nom
- Seules les déclarations "validee" peuvent être vérifiées

---

## 📄 **PARTIE 5 : VÉRIFICATION DES DOCUMENTS**

**Agent :**
```
1. Clique "Vérifier les Documents"
2. Modale s'ouvre
3. Vérifie la CNI du citoyen
   → ☑️ "L'identité correspond"
4. Demande les documents un par un:
   → ☑️ Certificat médical
   → ☑️ Pièce d'identité père
   → ☑️ Pièce d'identité mère
   → ☑️ Acte de mariage parents
5. Coche chaque document reçu
6. Ajoute observations: "Tous les documents conformes"
7. Coche: ☑️ "J'atteste avoir vérifié..."
8. Clique "Confirmer"
9. Statut: documents_verifies
```

---

## 📋 **PARTIE 6 : GÉNÉRATION DE L'ACTE**

**Agent :**
```
1. Après vérification, bouton "Générer l'Acte" apparaît
2. Clique "Générer l'Acte"
3. PDF de l'acte se génère
4. Imprime l'acte
5. Fait signer le registre au citoyen
6. Remet l'acte au citoyen
7. Clique "Marquer comme Remis"
8. Statut: remis
```

**Citoyen repart avec son acte de naissance ! 🎉**

---

## 📊 **STATUTS ET TRANSITIONS**

```
en_attente
   ↓ (Agent clique "Valider")
validee
   ↓ (Citoyen vient avec documents)
   ↓ (Agent clique "Vérifier les Documents")
   ↓ (Agent coche tous les documents)
documents_verifies
   ↓ (Agent clique "Générer l'Acte")
   ↓ (Agent imprime et remet)
remis
```

---

## 🔍 **CE QUI MANQUE ACTUELLEMENT**

### **1. Recherche par code** ❌
**Problème :** La barre de recherche cherche seulement par nom
**Solution :** Modifier pour chercher aussi par code_suivi

### **2. Filtrage par statut** ❌
**Problème :** Toutes les déclarations sont mélangées
**Solution :** Ajouter filtres:
- "En attente" (à valider)
- "Validées" (en attente du citoyen)
- "Documents vérifiés" (à générer)
- "Remis" (terminé)

### **3. Génération de l'acte** ❌
**Problème :** Pas de bouton pour générer l'acte
**Solution :** Ajouter bouton après vérification documents

### **4. Marquage "Remis"** ❌
**Problème :** Pas de moyen de marquer comme remis
**Solution :** Ajouter bouton après génération

---

## ✅ **CE QUI EXISTE DÉJÀ**

- ✅ Formulaire de déclaration citoyen
- ✅ Modale d'avertissements légaux
- ✅ Génération du code de suivi
- ✅ Liste des déclarations pour l'agent
- ✅ Bouton "Valider"
- ✅ Modale de vérification des documents

---

## 🚀 **PROCHAINES ÉTAPES**

### **À FAIRE :**

**1. Améliorer la recherche** ⏳
```typescript
// Chercher par code OU nom
const filteredDeclarations = declarations.filter(decl => {
  const searchLower = searchTerm.toLowerCase()
  return (
    decl.code_suivi?.toLowerCase().includes(searchLower) ||
    decl.nom_enfant?.toLowerCase().includes(searchLower) ||
    decl.prenom_enfant?.toLowerCase().includes(searchLower)
  )
})
```

**2. Ajouter filtres par statut** ⏳
```typescript
<Select
  label="Filtrer par statut"
  options={[
    { value: 'tous', label: 'Tous' },
    { value: 'en_attente', label: 'À valider' },
    { value: 'validee', label: 'En attente du citoyen' },
    { value: 'documents_verifies', label: 'À générer' },
    { value: 'remis', label: 'Terminé' }
  ]}
  value={filterStatut}
  onChange={(e) => setFilterStatut(e.target.value)}
/>
```

**3. Ajouter génération d'acte** ⏳
```typescript
// Après documents_verifies
<Button onClick={handleGenererActe}>
  Générer l'Acte
</Button>
```

**4. Ajouter marquage "Remis"** ⏳
```typescript
// Après génération
<Button onClick={handleMarquerRemis}>
  Marquer comme Remis
</Button>
```

---

## 🎯 **RÉSUMÉ**

**Le processus COMPLET :**
1. Citoyen déclare en ligne → Code généré
2. Agent valide → Email au citoyen
3. Citoyen vient avec documents + code
4. Agent recherche par code
5. Agent vérifie documents
6. Agent génère acte
7. Agent remet acte
8. Terminé !

**Ce qui manque :**
- Recherche par code ⏳
- Filtres par statut ⏳
- Génération d'acte ⏳
- Marquage "Remis" ⏳

---

**📄 VOULEZ-VOUS QUE J'AJOUTE CES FONCTIONNALITÉS MANQUANTES ? 🚀**
