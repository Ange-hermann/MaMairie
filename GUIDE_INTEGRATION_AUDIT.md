# 📘 Guide d'Intégration des APIs d'Audit - MaMairie

## 🎯 Objectif

Ce guide explique comment intégrer les APIs d'audit dans les composants existants pour tracer toutes les actions importantes de la plateforme.

---

## ✅ APIs Déjà Intégrées

### 1. **Demandes d'Extraits** (`/agent/demandes`)
```typescript
// Approuver ou rejeter une demande
const response = await fetch('/api/demandes/update-statut', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    demandeId, 
    nouveauStatut: 'approuvee' // ou 'rejetee'
  })
})
```

### 2. **Vérification QR Code** (`/ministere/verification`)
```typescript
// Vérifier un QR code
const response = await fetch('/api/verification/qr-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ qrData })
})
```

### 3. **Déclarations de Naissance** (`/citoyen/declaration-naissance`)
```typescript
// Créer une déclaration
const response = await fetch('/api/declarations/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
})
```

---

## ⏳ APIs à Intégrer

### 4. **Validation de Déclarations** (`/agent/declarations`)

**API disponible :** `/api/declarations/valider`

**Exemple d'intégration :**
```typescript
const handleValiderDeclaration = async (declarationId: string, action: 'valider' | 'rejeter') => {
  try {
    const response = await fetch('/api/declarations/valider', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        declarationId,
        action,
        motifRejet: action === 'rejeter' ? motifRejet : undefined,
        documentsVerifies: documentsRecus,
        observations: observationsAgent
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error)
    }

    alert('✅ Déclaration ' + (action === 'valider' ? 'validée' : 'rejetée'))
    // Recharger les données
  } catch (error: any) {
    alert('❌ Erreur : ' + error.message)
  }
}
```

**Où l'intégrer :**
- Fichier : `/app/agent/declarations/page.tsx`
- Remplacer les appels directs à `supabase.from('declarations').update()`

---

### 5. **Enregistrement de Mariage** (`/agent/etat-civil/mariages`)

**API disponible :** `/api/etat-civil/mariage`

**Exemple d'intégration :**
```typescript
const handleEnregistrerMariage = async (mariageData: any) => {
  try {
    const response = await fetch('/api/etat-civil/mariage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mariageData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error)
    }

    const { numeroActe } = await response.json()
    alert(`✅ Acte de mariage créé : ${numeroActe}`)
    // Recharger les données
  } catch (error: any) {
    alert('❌ Erreur : ' + error.message)
  }
}
```

**Où l'intégrer :**
- Fichier : `/app/agent/etat-civil/mariages/page.tsx`
- Remplacer les appels directs à `supabase.from('mariages').insert()`

---

### 6. **Enregistrement de Décès** (`/agent/etat-civil/deces`)

**API disponible :** `/api/etat-civil/deces`

**Exemple d'intégration :**
```typescript
const handleEnregistrerDeces = async (decesData: any) => {
  try {
    const response = await fetch('/api/etat-civil/deces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(decesData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error)
    }

    const { numeroActe } = await response.json()
    alert(`✅ Acte de décès créé : ${numeroActe}`)
    // Recharger les données
  } catch (error: any) {
    alert('❌ Erreur : ' + error.message)
  }
}
```

**Où l'intégrer :**
- Fichier : `/app/agent/etat-civil/deces/page.tsx`
- Remplacer les appels directs à `supabase.from('deces').insert()`

---

### 7. **Avis de Mention**

**API disponible :** `/api/mentions/update-statut`

**Exemple d'intégration :**
```typescript
const handleApprouverMention = async (mentionId: string, action: 'approuver' | 'rejeter') => {
  try {
    const response = await fetch('/api/mentions/update-statut', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mentionId,
        action,
        motifRejet: action === 'rejeter' ? motifRejet : undefined,
        observations: observations
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error)
    }

    alert('✅ Avis de mention ' + (action === 'approuver' ? 'approuvé' : 'rejeté'))
    // Recharger les données
  } catch (error: any) {
    alert('❌ Erreur : ' + error.message)
  }
}
```

**Où l'intégrer :**
- Créer/modifier la page de gestion des avis de mention
- Remplacer les appels directs à `supabase.from('avis_mentions').update()`

---

## 🔍 Comment Identifier les Endroits à Modifier

### Méthode 1 : Chercher les insertions directes
```bash
# Dans le terminal
grep -r "\.insert(" app/
grep -r "\.update(" app/
```

### Méthode 2 : Chercher les tables spécifiques
```bash
grep -r "from('declarations')" app/
grep -r "from('mariages')" app/
grep -r "from('deces')" app/
grep -r "from('avis_mentions')" app/
```

### Méthode 3 : Identifier les fonctions de soumission
Cherchez les fonctions comme :
- `handleSubmit`
- `handleCreate`
- `handleUpdate`
- `handleApprove`
- `handleReject`

---

## ✅ Checklist d'Intégration

Pour chaque action à auditer :

- [ ] Identifier le composant concerné
- [ ] Trouver la fonction qui fait l'action (insert/update)
- [ ] Remplacer par un appel à l'API correspondante
- [ ] Supprimer les imports inutiles (`logAgent`, `logCitoyen`, etc.)
- [ ] Tester que l'action fonctionne
- [ ] Vérifier que le log apparaît dans `/ministere/audit`

---

## 🎯 Bénéfices de l'Approche API

### ✅ Avantages
- **Sécurité** : Validation côté serveur
- **Audit automatique** : Impossible d'oublier
- **Traçabilité** : Tous les logs centralisés
- **Notifications** : Créées automatiquement
- **Cohérence** : Même logique partout

### ❌ Sans API (approche actuelle)
- Logs côté client → Ne fonctionnent pas
- Pas de validation serveur
- Risque d'oubli de logs
- Code dupliqué

---

## 📊 Consultation des Logs

Les logs sont visibles dans :
- **`/ministere/audit`** - Journal d'audit national complet

**Filtres disponibles :**
- Par rôle (citoyen, agent, ministère)
- Par statut (succès, échec, warning)
- Par période (aujourd'hui, 7 jours, 30 jours)
- Par recherche (email, IP, numéro d'acte)

---

## 🔒 Sécurité

Toutes les APIs :
- ✅ Vérifient l'authentification (`supabase.auth.getUser()`)
- ✅ Vérifient les autorisations (rôle)
- ✅ Valident les données d'entrée
- ✅ Enregistrent les logs d'audit
- ✅ Créent des notifications
- ✅ Gèrent les erreurs proprement

---

## 📝 Exemple Complet : Modifier une Page

**Avant (insertion directe) :**
```typescript
const handleCreate = async () => {
  const { data, error } = await supabase
    .from('mariages')
    .insert(formData)
  
  if (error) {
    alert('Erreur')
    return
  }
  
  alert('Créé !')
}
```

**Après (avec API et audit) :**
```typescript
const handleCreate = async () => {
  try {
    const response = await fetch('/api/etat-civil/mariage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error)
    }

    const { numeroActe } = await response.json()
    alert(`✅ Acte créé : ${numeroActe}`)
  } catch (error: any) {
    alert('❌ Erreur : ' + error.message)
  }
}
```

---

**Créé le :** 28/05/2026  
**Dernière mise à jour :** 28/05/2026  
**Auteur :** Cascade AI
