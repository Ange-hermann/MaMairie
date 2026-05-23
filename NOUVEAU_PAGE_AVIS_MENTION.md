# 📋 INSTRUCTIONS - REMPLACER LA PAGE AVIS MENTION

## 🎯 **PROBLÈME**

La page `/app/agent/avis-mentions/page.tsx` existe mais elle n'a PAS le système à 2 onglets.

---

## ✅ **SOLUTION RAPIDE**

**Copiez le fichier des déclarations et adaptez-le :**

```bash
# 1. Copiez le fichier déclarations
cp app/agent/declarations/page.tsx app/agent/avis-mentions/page-new.tsx

# 2. Dans le nouveau fichier, remplacez:
- "declarations_naissance" → "avis_mention"  
- "DeclarationsAgentPage" → "AvisMentionsAgentPage"
- "Déclarations de Naissance" → "Avis de Mention"
- "DEC-" → "MENT-"

# 3. Renommez le fichier
mv app/agent/avis-mentions/page-new.tsx app/agent/avis-mentions/page.tsx
```

---

## 📝 **MODIFICATIONS NÉCESSAIRES**

### **1. Nom de la table**
```typescript
// AVANT (déclarations)
.from('declarations_naissance')

// APRÈS (avis mention)
.from('avis_mention')
```

### **2. Champs différents**
```typescript
// Déclarations affiche:
- nom_enfant, prenom_enfant
- nom_pere, prenom_pere
- nom_mere, prenom_mere

// Avis Mention affiche:
- type_mention (mariage, divorce, etc.)
- numero_acte_original
- type_acte_original
- nom_conjoint (si mariage)
```

### **3. Affichage dans la carte (onglet Traitement)**
```typescript
// AVANT
<h3>{decl.prenom_enfant} {decl.nom_enfant}</h3>
<p>Né(e) le {decl.date_naissance}</p>

// APRÈS
<h3>{getTypeMentionLabel(avis.type_mention)}</h3>
<p>Acte : {avis.numero_acte_original}</p>
<p>Date événement : {avis.date_evenement}</p>
```

---

## 🚀 **ALTERNATIVE : JE CRÉE LE FICHIER COMPLET**

Voulez-vous que je crée un fichier complet prêt à copier-coller ?

Dites "oui" et je vais créer le fichier complet dans un fichier `.txt` que vous pourrez copier.

---

**📄 EN ATTENDANT, TESTEZ LES DÉCLARATIONS !**

Allez sur `/agent/declarations` pour voir le système à 2 onglets en action !
