# ✅ WORKFLOW AVIS MENTIONS CORRIGÉ

## 🔴 **PROBLÈMES**

1. Avis créés automatiquement `approuvee`
2. Bouton "Valider" mettait `validee` au lieu de `en_traitement`
3. Nom de table incorrect (`avis_mention` au lieu de `avis_mentions`)

---

## ✅ **CORRECTIONS APPLIQUÉES**

**Fichier :** `app/agent/avis-mentions/page.tsx`

### **1. Statut lors de la validation**
```typescript
// AVANT
statut: 'validee'

// APRÈS
statut: 'en_traitement'
```

### **2. Nom de la table**
```typescript
// AVANT
.from('avis_mention')

// APRÈS
.from('avis_mentions')
```

### **3. Gestion des statuts dans les onglets**
- Onglet Validation : `en_attente`, `en_traitement`
- Onglet Traitement : `validee`, `approuvee`, `rejetee`, `documents_verifies`

---

## 🎯 **WORKFLOW FINAL**

```
1. Citoyen soumet
   → statut: en_attente
   → Apparaît dans onglet VALIDATION

2. Agent clique "Valider"
   → statut: en_traitement
   → Reste dans onglet VALIDATION

3. Agent traite l'avis
   → statut: approuvee OU rejetee
   → Passe dans onglet TRAITEMENT
```

---

## 🔄 **L'APPLICATION SE RECHARGE**

Hot Reload actif !

**Si besoin : Ctrl+F5**

---

## 🎯 **TESTEZ MAINTENANT**

1. **Créez un nouvel avis** (côté citoyen)
2. **Vérifiez** : Il devrait être `en_attente`
3. **Allez sur** `/agent/avis-mentions`
4. **Onglet VALIDATION** : L'avis apparaît
5. **Cliquez** "Voir détails" → "Valider"
6. **Vérifiez** : Statut passe à `en_traitement`
7. **L'avis reste** dans l'onglet VALIDATION

---

## ⚠️ **POUR LES ANCIENS AVIS**

Si vous avez des avis déjà `approuvee`, exécutez :

```sql
UPDATE avis_mentions 
SET statut = 'en_attente'
WHERE statut = 'approuvee' 
AND agent_id IS NULL;
```

---

**✅ WORKFLOW CORRIGÉ ! TESTEZ ! ✅**
