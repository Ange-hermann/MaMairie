# 🔍 Déboguer la Création d'Agent

## 📊 **Vérifier les Logs**

### **Étape 1 : Ouvrir la Console**

1. Dans votre navigateur, appuyer sur **F12**
2. Cliquer sur l'onglet **"Console"**
3. Effacer les anciens logs (icône 🚫 ou Ctrl+L)

### **Étape 2 : Créer un Agent**

1. Aller sur `/ministere/agents`
2. Cliquer "Créer un Agent"
3. Remplir le formulaire avec un **nouvel email unique** :
   ```
   Email : test.agent.001@mairie.ci
   Password : Test123456
   Nom : Test
   Prénom : Agent
   Téléphone : +225 07 00 00 00 01
   Mairie : Sélectionner
   ```
4. Cliquer "Créer l'Agent"

### **Étape 3 : Lire les Logs**

Dans la console, vous verrez :

```
📝 Création du profil pour: [UUID] test.agent.001@mairie.ci
📋 Données du profil: {id: "...", email: "...", role: "agent", ...}
✅ Résultat insertion: {insertedData: [...], profileError: null}
🎉 Profil créé avec succès: {id: "...", email: "...", ...}
```

---

## ❌ **Si Erreur**

### **Erreur 1 : "profileError: {...}"**

**Message** :
```
❌ Erreur profil: {message: "...", code: "..."}
```

**Causes possibles** :
- RLS bloque l'insertion
- Colonne manquante
- Contrainte violée

**Solution** :
```sql
-- Désactiver RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

---

### **Erreur 2 : "Le profil n'a pas été créé (aucune donnée retournée)"**

**Cause** : L'insertion a réussi mais aucune donnée n'est retournée

**Solution** :
```sql
-- Vérifier si le profil existe
SELECT * FROM public.users 
WHERE email = 'test.agent.001@mairie.ci';
```

Si le profil existe → Problème avec `.select()`
Si le profil n'existe pas → Problème avec l'insertion

---

### **Erreur 3 : Aucun log n'apparaît**

**Cause** : Le code ne s'exécute pas jusqu'à la création du profil

**Vérifier** :
- L'email est-il déjà utilisé ?
- Y a-t-il une erreur avant la création du profil ?

---

## 🎯 **Vérifications SQL**

### **1. Vérifier RLS**

```sql
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'users';
```

**Résultat attendu** : `rowsecurity = false`

---

### **2. Voir les utilisateurs dans auth.users**

```sql
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

---

### **3. Voir les utilisateurs dans public.users**

```sql
SELECT id, email, role, nom, prenom, created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 5;
```

---

### **4. Comparer les deux**

```sql
-- Utilisateurs dans auth mais pas dans public
SELECT 
  au.id,
  au.email,
  au.created_at,
  'ORPHELIN' as statut
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;
```

---

## 🔧 **Solutions**

### **Solution 1 : Désactiver RLS**

```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mairies DISABLE ROW LEVEL SECURITY;
```

### **Solution 2 : Créer les Profils Orphelins**

```sql
-- Pour chaque orphelin
INSERT INTO public.users (id, email, role, nom, prenom, statut)
SELECT 
  au.id,
  au.email,
  'agent',
  'Nom',  -- À remplacer
  'Prenom',  -- À remplacer
  'actif'
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
AND au.email = 'email.specifique@mairie.ci';  -- À remplacer
```

### **Solution 3 : Supprimer les Orphelins**

```sql
-- Supprimer de auth.users
DELETE FROM auth.users
WHERE id IN (
  SELECT au.id
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE pu.id IS NULL
);
```

---

## 📋 **Checklist de Débogage**

```
☐ Console ouverte (F12)
☐ Logs effacés
☐ Email unique utilisé
☐ Formulaire rempli correctement
☐ Logs apparaissent dans la console
☐ Message d'erreur copié
☐ RLS vérifié
☐ Profils orphelins vérifiés
☐ Solution appliquée
☐ Test réussi
```

---

## 🎯 **Exemple de Logs Réussis**

```
📝 Création du profil pour: 84ed3a18-a758-406b-a251-a523344f0ef1 test.agent.001@mairie.ci

📋 Données du profil: {
  id: "84ed3a18-a758-406b-a251-a523344f0ef1",
  email: "test.agent.001@mairie.ci",
  role: "agent",
  nom: "Test",
  prenom: "Agent",
  telephone: "+225 07 00 00 00 01",
  mairie_id: "uuid-mairie",
  statut: "actif"
}

✅ Résultat insertion: {
  insertedData: [{...}],
  profileError: null
}

🎉 Profil créé avec succès: {
  id: "84ed3a18-a758-406b-a251-a523344f0ef1",
  email: "test.agent.001@mairie.ci",
  role: "agent",
  ...
}
```

---

## 📞 **Prochaines Étapes**

1. **Ouvrir la console** (F12)
2. **Créer un agent** avec email unique
3. **Copier les logs** (clic droit → Copy)
4. **Analyser** le message d'erreur
5. **Appliquer** la solution correspondante

---

**Les logs vous diront exactement où est le problème ! 🔍✨**

© 2024 MaMairie - Ministère de l'Intérieur - République de Côte d'Ivoire
