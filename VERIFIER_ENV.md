# 🔧 Résolution du problème "supabaseKey is required"

## ❌ Problème
L'erreur **"supabaseKey is required"** signifie que les variables d'environnement Supabase ne sont pas chargées.

## ✅ Solution

### 1. Vérifier que `.env.local` existe

Ouvrez le fichier `.env.local` à la racine du projet. Il doit contenir :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_ici
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role_ici
```

### 2. Si le fichier n'existe pas ou est vide

Créez-le avec vos vraies clés Supabase :

1. Allez sur https://supabase.com
2. Sélectionnez votre projet
3. Cliquez sur ⚙️ Settings → API
4. Copiez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Arrêter TOUS les serveurs

```bash
# Dans le terminal, appuyez sur Ctrl+C plusieurs fois
# Ou fermez tous les terminaux
```

### 4. Supprimer le cache Next.js

```bash
# Dans PowerShell
Remove-Item -Recurse -Force .next
```

### 5. Redémarrer proprement

```bash
npm run dev
```

### 6. Vider le cache du navigateur

- Appuyez sur **Ctrl+Shift+R** (rechargement forcé)
- Ou ouvrez une fenêtre de navigation privée

---

## 🎯 Checklist

- [ ] Le fichier `.env.local` existe
- [ ] Il contient les 3 variables (URL + 2 clés)
- [ ] Les clés sont correctes (copiées depuis Supabase)
- [ ] Tous les serveurs sont arrêtés
- [ ] Le dossier `.next` est supprimé
- [ ] Le serveur est redémarré
- [ ] Le cache du navigateur est vidé

---

## 🔍 Test rapide

Après avoir tout fait, testez avec cette commande dans la console du navigateur (F12) :

```javascript
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'OK' : 'MANQUANTE')
```

Si vous voyez "MANQUANTE", les variables ne sont pas chargées.

---

## 💡 Alternative : Créer un nouveau fichier .env.local

Si rien ne fonctionne, créez un NOUVEAU fichier `.env.local` :

1. Supprimez l'ancien `.env.local` (s'il existe)
2. Créez un nouveau fichier nommé exactement `.env.local` (avec le point au début)
3. Copiez-collez vos clés Supabase
4. Sauvegardez
5. Redémarrez le serveur

---

## ⚠️ Erreurs courantes

### "Le fichier .env.local n'est pas lu"
→ Vérifiez qu'il est bien à la RACINE du projet (à côté de `package.json`)

### "Les variables sont undefined"
→ Redémarrez le serveur après avoir modifié `.env.local`

### "Ça ne fonctionne toujours pas"
→ Essayez en navigation privée pour éliminer les problèmes de cache
