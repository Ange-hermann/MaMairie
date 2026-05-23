# ✅ CORRECTION - BOUTON "SOUMETTRE LA DEMANDE"

## ❌ **PROBLÈME IDENTIFIÉ**

Le bouton restait désactivé même avec :
- ✅ Document uploadé
- ✅ Mairie sélectionnée

**Cause :** Condition incorrecte dans le code

```typescript
// AVANT (incorrect)
disabled={loading || !documentUrl || !mairieCompetente}
```

La variable `mairieCompetente` n'était jamais définie !

---

## ✅ **CORRECTION APPLIQUÉE**

**Fichier :** `/app/demande-extrait/page.tsx` - Ligne 735

**Changement :**
```typescript
// APRÈS (correct)
disabled={loading || !documentUrl || !formData.mairie_id}
```

**Maintenant le bouton vérifie :**
- `formData.mairie_id` qui est bien défini quand on sélectionne une mairie

---

## 🎯 **RÉSULTAT**

Le bouton s'active maintenant quand :
1. ✅ Document uploadé (`documentUrl !== null`)
2. ✅ Mairie sélectionnée (`formData.mairie_id !== ''`)
3. ✅ Pas de soumission en cours (`loading === false`)

---

## 🔄 **POUR TESTER**

1. Rafraîchissez la page (F5)
2. Remplissez le formulaire
3. Uploadez le document
4. Sélectionnez une mairie
5. ✅ Le bouton devrait s'activer !

---

## 📊 **VÉRIFICATION**

**Console (F12) :**
```javascript
console.log('Mairie ID:', formData.mairie_id)
console.log('Document:', documentUrl)
console.log('Bouton désactivé:', loading || !documentUrl || !formData.mairie_id)
```

**Résultat attendu :**
```
Mairie ID: "uuid-de-la-mairie"
Document: "https://..."
Bouton désactivé: false  ← Le bouton est actif !
```

---

**🎉 LE BOUTON DEVRAIT MAINTENANT FONCTIONNER ! RAFRAÎCHISSEZ LA PAGE ! ✅**
