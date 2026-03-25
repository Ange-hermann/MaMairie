# 🔧 Solution Logo Netlify - Cache

## ✅ **Problème**

Le logo fonctionne en local mais pas sur Netlify → **Problème de cache**

---

## 🚀 **Solution 1 : Vider le Cache Netlify (OBLIGATOIRE)**

### **Étapes** :

1. **Aller sur** : https://app.netlify.com
2. **Sélectionner** votre site
3. **Deploys** → **Trigger deploy**
4. **Cliquer** : **Clear cache and deploy site**
5. ✅ Attendre 2-3 minutes

**C'est la solution la plus importante !**

---

## 🚀 **Solution 2 : Vérifier que le Fichier est Déployé**

Ouvrir dans le navigateur :
```
https://votre-site.netlify.app/logo-mamairie.png
```

Si le logo s'affiche → Le fichier est bien déployé ✅
Si erreur 404 → Le fichier n'est pas déployé ❌

---

## 🚀 **Solution 3 : Vider le Cache Navigateur**

### **Chrome/Edge** :
```
1. Ctrl + Shift + Delete
2. Cocher "Images et fichiers en cache"
3. Période : "Toutes les données"
4. Cliquer "Effacer les données"
5. Ctrl + F5 pour recharger
```

### **Firefox** :
```
1. Ctrl + Shift + Delete
2. Cocher "Cache"
3. Période : "Tout"
4. Cliquer "Effacer maintenant"
5. Ctrl + F5
```

---

## 🚀 **Solution 4 : Tester en Navigation Privée**

1. **Ouvrir** une fenêtre de navigation privée
2. **Aller** sur votre site Netlify
3. ✅ Le logo devrait s'afficher

Si ça fonctionne en navigation privée → C'est le cache de votre navigateur !

---

## 🚀 **Solution 5 : Forcer le Rafraîchissement avec Version**

Si le problème persiste, on peut ajouter une version :

```typescript
// components/layout/Logo.tsx
src="/logo-mamairie.png?v=3"
```

Cela force le navigateur à recharger l'image.

---

## 🔍 **Diagnostic Complet**

### **Vérifier les Logs Netlify** :

1. **Netlify Dashboard** → Votre site
2. **Deploys** → Dernière compilation
3. **Deploy log** → Chercher "logo-mamairie.png"
4. Vérifier qu'il est bien copié dans le build

### **Vérifier le Build** :

Dans les logs, vous devriez voir :
```
Copying files from public directory...
  ✓ logo-mamairie.png
```

---

## ⚡ **Solution Rapide (Recommandée)**

**Faire les 3 actions en même temps** :

1. ✅ **Netlify** : Clear cache and deploy
2. ✅ **Navigateur** : Ctrl + Shift + Delete
3. ✅ **Test** : Navigation privée

---

## 🎯 **Si Rien ne Fonctionne**

### **Vérifier Next.js Config** :

Le fichier `next.config.js` doit permettre les images :

```javascript
module.exports = {
  images: {
    domains: [],
    unoptimized: true, // Pour Netlify
  },
}
```

---

## 📊 **Checklist**

```
☐ Clear cache Netlify (OBLIGATOIRE)
☐ Vérifier /logo-mamairie.png accessible
☐ Vider cache navigateur
☐ Tester en navigation privée
☐ Vérifier logs de build Netlify
☐ Attendre 5 minutes après deploy
☐ Tester sur un autre appareil
```

---

## 🔧 **Commandes Netlify CLI**

Si vous utilisez la CLI :

```bash
# Redéployer en vidant le cache
netlify deploy --prod --clear-cache

# Ou
netlify build --clear-cache
netlify deploy --prod
```

---

## ✅ **Résultat Attendu**

Après avoir vidé les caches :
- ✅ Logo visible sur Netlify
- ✅ Logo visible en navigation privée
- ✅ Logo visible après Ctrl + F5

---

**La solution principale est de vider le cache Netlify ! 🎉✨**

© 2024 MaMairie
