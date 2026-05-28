# 📊 APIs d'Audit Créées - MaMairie

## ✅ APIs Implémentées avec Audit Automatique

### 1. **Demandes d'Extraits**
- **`POST /api/demandes/update-statut`**
  - Approuver/rejeter une demande d'extrait
  - Logs: `AGENT_DEMANDE_APPROUVEE`, `AGENT_DEMANDE_REJETEE`
  - ✅ Utilisé par `/agent/demandes`

- **`POST /api/generer-extrait`**
  - Générer un PDF d'extrait avec QR Code
  - Logs: `AGENT_PDF_GENERE`
  - ✅ Utilisé par `/agent/demandes`

---

### 2. **Vérification QR Code (Ministère)**
- **`POST /api/verification/qr-code`**
  - Vérifier l'authenticité d'un acte via QR code
  - Logs: `MINISTERE_ACTE_VERIFIE`, `FRAUDE_QR_INVALIDE`, `FRAUDE_ACTE_INVALIDE`
  - ✅ Utilisé par `/ministere/verification`

---

### 3. **Déclarations de Naissance**
- **`POST /api/declarations/create`**
  - Créer une déclaration de naissance
  - Logs: `CITOYEN_DECLARATION_CREEE`
  - ⏳ À intégrer dans `/citoyen/declaration-naissance`

- **`POST /api/declarations/valider`**
  - Valider/rejeter/vérifier documents d'une déclaration
  - Logs: `AGENT_DEMANDE_APPROUVEE`, `AGENT_DEMANDE_REJETEE`, `AGENT_DOCUMENTS_VERIFIES`
  - ⏳ À intégrer dans `/agent/declarations`

---

### 4. **État Civil - Mariages**
- **`POST /api/etat-civil/mariage`**
  - Enregistrer un acte de mariage
  - Logs: `AGENT_ACTE_CREE`
  - ⏳ À intégrer dans `/agent/etat-civil/mariages`

---

### 5. **État Civil - Décès**
- **`POST /api/etat-civil/deces`**
  - Enregistrer un acte de décès
  - Logs: `AGENT_ACTE_CREE`
  - ⏳ À intégrer dans `/agent/etat-civil/deces`

---

### 6. **Avis de Mention**
- **`POST /api/mentions/update-statut`**
  - Approuver/rejeter un avis de mention
  - Logs: `AGENT_MENTION_APPROUVEE`, `AGENT_MENTION_REJETEE`
  - ⏳ À intégrer dans la page de gestion des mentions

---

## 📋 Prochaines Étapes

### **Intégration dans les composants**
Pour chaque API créée, il faut modifier le composant correspondant pour l'utiliser :

1. **Déclarations** - Modifier `DeclarationNaissanceForm.tsx` pour utiliser `/api/declarations/create`
2. **Validation déclarations** - Modifier `/agent/declarations/page.tsx` pour utiliser `/api/declarations/valider`
3. **Mariages** - Modifier `/agent/etat-civil/mariages/page.tsx` pour utiliser `/api/etat-civil/mariage`
4. **Décès** - Modifier `/agent/etat-civil/deces/page.tsx` pour utiliser `/api/etat-civil/deces`
5. **Mentions** - Créer/modifier la page de gestion des mentions pour utiliser `/api/mentions/update-statut`

---

## 🎯 Résultat

**Toutes les actions importantes sont maintenant auditées :**
- ✅ Connexions/déconnexions (déjà implémenté)
- ✅ Approbations/rejets de demandes
- ✅ Génération de PDFs
- ✅ Vérifications QR code (ministère)
- ✅ Détection de fraudes
- ⏳ Créations de déclarations (API prête)
- ⏳ Validations de déclarations (API prête)
- ⏳ Enregistrements mariages/décès (API prête)
- ⏳ Approbations avis de mention (API prête)

---

## 🔒 Sécurité

Toutes les APIs :
- ✅ Vérifient l'authentification
- ✅ Vérifient les autorisations (rôle)
- ✅ Enregistrent les logs d'audit
- ✅ Créent des notifications pour les citoyens
- ✅ Gèrent les erreurs proprement

---

## 📊 Consultation des Logs

Les logs sont visibles dans :
- **`/ministere/audit`** - Journal d'audit national complet
- Filtres disponibles : rôle, statut, période, recherche

---

**Créé le :** 28/05/2026  
**Dernière mise à jour :** 28/05/2026
