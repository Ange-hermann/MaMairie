# ✅ SYSTÈME À 2 ONGLETS - DÉCLARATIONS

## 🎯 **NOUVEAU SYSTÈME IMPLÉMENTÉ**

Une seule page `/agent/declarations` avec **2 onglets** :

1. **✅ Onglet VALIDATION** - Pour valider/rejeter les nouvelles déclarations
2. **🔍 Onglet TRAITEMENT** - Pour traiter les déclarations validées

---

## 📋 **ONGLET 1 : VALIDATION**

### **Objectif :**
Valider ou rejeter les nouvelles déclarations reçues

### **Déclarations affichées :**
- Statut : `en_attente`
- Statut : `en_traitement`

### **Recherche :**
```
Placeholder: "Rechercher par nom ou prénom..."
```

### **Actions disponibles :**
- ✅ **Valider** → Statut passe à `validee`
- ❌ **Rejeter** → Statut passe à `rejetee`

### **Workflow :**
```
1. Citoyen soumet déclaration
   ↓
2. Apparaît dans onglet "Validation"
   ↓
3. Agent examine les informations
   ↓
4. Agent clique "Valider" ou "Rejeter"
   ↓
5. Si validée → Passe dans onglet "Traitement"
   Si rejetée → Citoyen reçoit notification
```

---

## 🔍 **ONGLET 2 : TRAITEMENT**

### **Objectif :**
Traiter les déclarations déjà validées (vérification documents + génération acte)

### **Déclarations affichées :**
- Statut : `validee` (en attente du citoyen)
- Statut : `documents_verifies` (prêt à générer l'acte)

### **Recherche :**
```
Placeholder: "Rechercher par code de suivi (ex: DEC-2024-001234)..."
```

### **Actions disponibles :**
- 🔍 **Vérifier les Documents** (si statut = validee)
- 📄 **Générer l'Acte** (si statut = documents_verifies)
- ✅ **Marquer comme Remis** (après génération)

### **Workflow :**
```
1. Citoyen reçoit email: "Venez avec vos documents"
   ↓
2. Citoyen vient à la mairie avec:
   - Pièce d'identité
   - Documents originaux
   - Code: DEC-2024-001234
   ↓
3. Agent va dans onglet "Traitement"
   ↓
4. Agent tape "DEC-2024-001234" dans la recherche
   ↓
5. Agent clique "Vérifier les Documents"
   ↓
6. Modale s'ouvre → Agent coche documents
   ↓
7. Statut → documents_verifies
   ↓
8. Agent clique "Générer l'Acte"
   ↓
9. Acte généré → Imprimé → Remis au citoyen
   ↓
10. Agent clique "Marquer comme Remis"
    ↓
11. Statut → remis
```

---

## 🎨 **INTERFACE UTILISATEUR**

### **Onglets :**
```
┌─────────────────────────────────────────┐
│ 👶 Déclarations de Naissance            │
├─────────────────────────────────────────┤
│                                         │
│ [✅ Validation (5)] [🔍 Traitement (3)] │
│ ─────────────────                       │
│                                         │
│ 🔍 Rechercher...                        │
│                                         │
│ Liste des déclarations                  │
└─────────────────────────────────────────┘
```

### **Onglet Validation :**
```
┌─────────────────────────────────────────┐
│ ✅ Validation (5)  🔍 Traitement (3)    │
│ ─────────────────                       │
├─────────────────────────────────────────┤
│ 🔍 Rechercher par nom ou prénom...      │
├─────────────────────────────────────────┤
│ CODE         | NOM        | STATUT      │
│ DEC-2024-001 | KOUADIO    | En attente  │
│ DEC-2024-002 | N'GUESSAN  | En attente  │
│                                         │
│ Actions: [Valider] [Rejeter]           │
└─────────────────────────────────────────┘
```

### **Onglet Traitement :**
```
┌─────────────────────────────────────────┐
│ ✅ Validation (5)  🔍 Traitement (3)    │
│                    ─────────────────    │
├─────────────────────────────────────────┤
│ 🔍 Rechercher par code (DEC-2024-...)   │
├─────────────────────────────────────────┤
│ CODE         | NOM        | STATUT      │
│ DEC-2024-003 | YAO        | Validée     │
│ DEC-2024-004 | KOUAME     | Doc vérifiés│
│                                         │
│ Actions: [Vérifier Documents] [Générer] │
└─────────────────────────────────────────┘
```

---

## 📊 **FILTRAGE AUTOMATIQUE**

### **Onglet Validation :**
```typescript
if (activeTab === 'validation') {
  // Affiche seulement:
  - statut === 'en_attente'
  - statut === 'en_traitement'
}
```

### **Onglet Traitement :**
```typescript
if (activeTab === 'traitement') {
  // Affiche seulement:
  - statut === 'validee'
  - statut === 'documents_verifies'
}
```

---

## 🔄 **FLUX COMPLET**

```
CITOYEN                    AGENT (Onglet Validation)
   |                              |
   |-- Soumet déclaration ------->|
   |                              |
   |                              |<-- Voit dans "Validation"
   |                              |<-- Examine
   |                              |<-- Clique "Valider"
   |                              |
   |<-- Email "Venez avec docs" --|
   |                              |
   |                              |
   |                       AGENT (Onglet Traitement)
   |                              |
   |-- Vient à la mairie -------->|
   |-- Donne code DEC-2024-001 -->|
   |                              |
   |                              |<-- Tape code dans recherche
   |                              |<-- Trouve déclaration
   |                              |<-- Clique "Vérifier Documents"
   |                              |
   |-- Présente documents ------->|
   |                              |
   |                              |<-- Coche documents
   |                              |<-- Confirme
   |                              |<-- Clique "Générer Acte"
   |                              |<-- Imprime
   |                              |
   |<-- Reçoit acte --------------|
   |                              |
   |                              |<-- Clique "Marquer Remis"
   |                              |
```

---

## ✅ **MODIFICATIONS APPLIQUÉES**

**Fichier :** `/app/agent/declarations/page.tsx`

1. ✅ Ajout state `activeTab` ('validation' | 'traitement')
2. ✅ Ajout onglets dans l'interface
3. ✅ Filtrage automatique selon l'onglet
4. ✅ Placeholder de recherche dynamique
5. ✅ Compteurs sur les onglets

---

## 🚀 **POUR TESTER**

### **1. Onglet Validation :**
```
1. Allez sur /agent/declarations
2. Vous êtes sur l'onglet "Validation" par défaut
3. Vous voyez les déclarations "en_attente"
4. Recherchez par nom
5. Cliquez "Valider"
6. La déclaration passe dans "Traitement"
```

### **2. Onglet Traitement :**
```
1. Cliquez sur l'onglet "Traitement"
2. Vous voyez les déclarations "validee"
3. Recherchez par code: "DEC-2024-001234"
4. Cliquez "Vérifier les Documents"
5. Cochez les documents
6. Cliquez "Générer l'Acte"
```

---

## 📋 **PROCHAINES ÉTAPES**

### **À AJOUTER :**
1. ⏳ Bouton "Générer l'Acte" (après documents_verifies)
2. ⏳ Génération PDF de l'acte
3. ⏳ Bouton "Marquer comme Remis"
4. ⏳ Notifications email/SMS

---

## 🎉 **RÉSULTAT**

✅ 2 onglets clairs : Validation et Traitement
✅ Filtrage automatique selon l'onglet
✅ Recherche adaptée (nom vs code)
✅ Workflow séparé et clair
✅ Interface intuitive

---

**🇨🇮 SYSTÈME À 2 ONGLETS OPÉRATIONNEL ! 🎉**
