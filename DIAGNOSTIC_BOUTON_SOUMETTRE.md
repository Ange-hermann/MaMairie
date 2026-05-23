# 🔍 DIAGNOSTIC - BOUTON "SOUMETTRE LA DEMANDE"

## ❌ **PROBLÈME**

Le bouton "Soumettre la Demande" ne fonctionne pas (ne passe pas).

---

## 🔍 **CAUSE PROBABLE**

Le bouton est **désactivé** à cause de cette condition :

```typescript
disabled={loading || !documentUrl || !mairieCompetente}
```

**Le bouton est désactivé si :**
1. `loading = true` (soumission en cours)
2. `!documentUrl` (aucun document uploadé)
3. `!mairieCompetente` (aucune mairie sélectionnée)

---

## ✅ **VÉRIFICATIONS**

### **1. Document uploadé ?**

**Vérifiez :**
- Avez-vous uploadé l'ancien acte ?
- Le fichier est-il bien chargé ?

**Message affiché :**
```
⚠️ L'upload de l'ancien acte est obligatoire
```

**Si pas de document :**
- Le bouton reste grisé
- Impossible de soumettre

---

### **2. Mairie sélectionnée ?**

**Vérifiez :**
- Avez-vous sélectionné une mairie/SP/village ?
- La sélection est-elle complète ?

**Si pas de mairie :**
- `mairieCompetente = null`
- Le bouton reste désactivé

---

## 🔧 **SOLUTIONS**

### **Solution 1 : Uploader le document**

1. Cliquez sur "Choisir un fichier"
2. Sélectionnez votre ancien acte (PDF, JPG, PNG)
3. Attendez que l'upload soit terminé
4. Le bouton devrait s'activer

---

### **Solution 2 : Sélectionner une mairie**

1. Choisissez le mode de sélection (Mairie, SP, Village)
2. Sélectionnez votre mairie/SP/village
3. Vérifiez que la sélection est affichée
4. Le bouton devrait s'activer

---

### **Solution 3 : Modifier la condition (si nécessaire)**

**Fichier :** `/app/demande-extrait/page.tsx` - Ligne 735

**Actuellement :**
```typescript
disabled={loading || !documentUrl || !mairieCompetente}
```

**Option 1 - Rendre le document optionnel :**
```typescript
disabled={loading || !mairieCompetente}
```

**Option 2 - Rendre la mairie optionnelle :**
```typescript
disabled={loading || !documentUrl}
```

**Option 3 - Tout optionnel (déconseillé) :**
```typescript
disabled={loading}
```

---

## 🎯 **RECOMMANDATION**

### **Garder les deux obligatoires :**
```typescript
disabled={loading || !documentUrl || !mairieCompetente}
```

**Pourquoi ?**
- ✅ Document obligatoire pour traiter la demande
- ✅ Mairie obligatoire pour savoir où envoyer
- ✅ Évite les demandes incomplètes

---

## 📊 **VÉRIFICATION EN CONSOLE**

Ouvrez la console du navigateur (F12) et tapez :

```javascript
console.log('Document:', documentUrl)
console.log('Mairie:', mairieCompetente)
console.log('Loading:', loading)
```

**Résultat attendu :**
```
Document: "https://..."  // URL du document
Mairie: { id: "...", nom: "..." }  // Objet mairie
Loading: false
```

**Si l'un est null/undefined :**
- Le bouton reste désactivé

---

## 🎉 **RÉSUMÉ**

### **Pour activer le bouton :**
1. ✅ Uploader le document
2. ✅ Sélectionner une mairie/SP/village
3. ✅ Attendre que `loading = false`

### **Le bouton devient actif quand :**
```
documentUrl !== null
ET
mairieCompetente !== null
ET
loading === false
```

---

**🔍 VÉRIFIEZ QUE VOUS AVEZ BIEN UPLOADÉ LE DOCUMENT ET SÉLECTIONNÉ UNE MAIRIE ! ✅**
