# 📄 GÉNÉRATION PDF ACTE DE NAISSANCE

## 🎯 **OBJECTIF**

Générer un PDF officiel de l'acte de naissance avec :
- Format officiel République de Côte d'Ivoire
- Toutes les informations de l'acte
- Code QR pour vérification d'authenticité
- Téléchargement automatique

---

## ✅ **CE QUI A ÉTÉ FAIT**

### **1. Fonction de génération PDF** ✅
**Fichier :** `lib/genererPdfActeNaissance.ts`

**Fonctionnalités :**
- Template officiel RCI
- En-tête avec devise
- District et mairie
- Informations enfant, père, mère
- Code QR en bas
- Téléchargement automatique

### **2. Page agent modifiée** ✅
**Fichier :** `app/agent/declarations/page.tsx`

**Bouton "Générer l'Acte + PDF" :**
1. Crée l'acte dans la base (fonction SQL)
2. Récupère le numéro d'acte généré
3. Génère le PDF
4. Télécharge automatiquement

---

## 📦 **DÉPENDANCES À INSTALLER**

```bash
npm install jspdf qrcode
npm install --save-dev @types/qrcode
```

---

## 📄 **FORMAT DU PDF**

```
┌─────────────────────────────────────┐
│   REPUBLIQUE DE COTE D'IVOIRE       │
│      Union - Discipline - Travail   │
│                                     │
│   DISTRICT AUTONOME D'ABIDJAN       │
│   MAIRIE DE LA COMMUNE DE COCODY    │
│      SERVICE DE L'ETAT CIVIL        │
│                                     │
│        ACTE DE NAISSANCE            │
│                                     │
│ N° N-2024-0001        Le 22/05/2024 │
├─────────────────────────────────────┤
│                                     │
│ Le 22/05/2024, par-devant nous,     │
│ Jean KOUADIO, Maire, Officier de    │
│ l'État Civil...                     │
│                                     │
│           L'ENFANT                  │
│ Nom et prénoms : KOUADIO Yao        │
│ Sexe : Masculin                     │
│ Date et lieu : 15/05/2024 à Abidjan │
│ Heure : 10:30                       │
│                                     │
│            LE PERE                  │
│ Nom et prénoms : KOUADIO Jean       │
│ Date de naissance : 01/01/1990      │
│ Profession : Ingénieur              │
│ Domicile : Abidjan                  │
│ Nationalité : Ivoirienne            │
│                                     │
│            LA MERE                  │
│ Nom et prénoms : N'GUESSAN Marie    │
│ Date de naissance : 05/05/1992      │
│ Profession : Enseignante            │
│ Domicile : Abidjan                  │
│ Nationalité : Ivoirienne            │
│                                     │
│ Dont acte rédigé par nous...        │
│                                     │
│   Le Père        La Mère            │
│                                     │
│      L'Officier de l'État Civil     │
│                                     │
│   (Cachet de la Mairie de Cocody)   │
│                                     │
│          [QR CODE]                  │
│   Scannez pour vérifier             │
│                                     │
│ Ce document est délivré pour servir │
│      et valoir ce que de droit.     │
└─────────────────────────────────────┘
```

---

## 🔍 **CODE QR**

**Contenu du QR Code :**
```json
{
  "type": "acte_naissance",
  "numero": "N-2024-0001",
  "nom": "KOUADIO",
  "prenom": "Yao",
  "date_naissance": "15/05/2024",
  "verification_url": "https://mamairie.ci/verifier/N-2024-0001"
}
```

**Utilisation :**
- Citoyen scanne le QR
- Redirigé vers page de vérification
- Authentifie l'acte
- Affiche les informations

---

## 🚀 **WORKFLOW COMPLET**

```
1. Agent clique "Générer l'Acte + PDF"
   ↓
2. Confirmation demandée
   ↓
3. Fonction SQL appelée
   ↓
4. Acte créé dans table naissances
   - Numéro : N-2024-0001
   ↓
5. Acte récupéré avec toutes les infos
   ↓
6. PDF généré avec jsPDF
   - Template officiel
   - Code QR ajouté
   ↓
7. PDF téléchargé automatiquement
   - Nom : Acte_Naissance_N-2024-0001.pdf
   ↓
8. Agent imprime et remet au citoyen
   ↓
9. ✅ TERMINÉ !
```

---

## 📋 **POUR TESTER**

### **1. Installer les dépendances**
```bash
cd c:\Users\Angeh\OneDrive\Bureau\MaMairie
npm install jspdf qrcode
npm install --save-dev @types/qrcode
```

### **2. Exécuter le script SQL**
```sql
-- Dans Supabase SQL Editor
supabase/fonction-generer-acte-naissance.sql
```

### **3. Tester le workflow**
```
1. Faire une déclaration de naissance
2. Agent valide
3. Agent vérifie documents
4. Agent clique "Générer l'Acte + PDF"
5. ✅ PDF téléchargé automatiquement
6. Ouvrir le PDF
7. ✅ Vérifier le format
8. ✅ Scanner le QR Code
```

---

## 🎨 **PERSONNALISATION**

**Pour modifier le template :**
```typescript
// Fichier: lib/genererPdfActeNaissance.ts

// Modifier les couleurs
doc.setTextColor(0, 0, 0)

// Modifier les polices
doc.setFont('helvetica', 'bold')

// Modifier les positions
const y = 100

// Ajouter des éléments
doc.rect(x, y, width, height)
doc.addImage(imageData, 'PNG', x, y, w, h)
```

---

## 🔐 **SÉCURITÉ**

**Éléments de sécurité :**
1. ✅ Code QR unique
2. ✅ Numéro d'acte unique
3. ✅ URL de vérification
4. ✅ Cachet de la mairie
5. ✅ Signature officier

**Vérification :**
- Page `/verifier/[numero_acte]` à créer
- Vérifie dans la base
- Affiche les infos si valide
- Alerte si faux

---

## 📦 **FICHIERS CRÉÉS**

1. `lib/genererPdfActeNaissance.ts` - Génération PDF
2. `supabase/fonction-generer-acte-naissance.sql` - Fonction SQL
3. `PDF_ACTE_NAISSANCE.md` - Ce document

---

## 🎉 **RÉSULTAT**

✅ PDF officiel généré
✅ Format République de Côte d'Ivoire
✅ Code QR pour vérification
✅ Téléchargement automatique
✅ Prêt à imprimer

---

**📄 INSTALLEZ LES DÉPENDANCES ET TESTEZ ! 🚀**

```bash
npm install jspdf qrcode
npm install --save-dev @types/qrcode
```
