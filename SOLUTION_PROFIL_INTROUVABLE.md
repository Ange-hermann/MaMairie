# 🔧 SOLUTION - PROFIL UTILISATEUR INTROUVABLE

## ❌ **ERREUR**

```
Profil utilisateur introuvable
```

---

## 🔍 **CAUSE**

Votre compte existe dans `auth.users` (authentification Supabase) mais **pas dans `public.users`** (table de profils de l'application).

**Pourquoi ?**
- Le `TRUNCATE TABLE mairies CASCADE` a peut-être supprimé des données liées
- Ou le profil n'a jamais été créé lors de l'inscription

---

## ✅ **SOLUTION**

### **Exécutez ce script :**

```bash
supabase/corriger-profil-utilisateur.sql
```

**Ce qu'il fait :**
1. ✅ Vérifie si votre compte existe dans `auth.users`
2. ✅ Vérifie si votre profil existe dans `public.users`
3. ✅ Crée le profil s'il n'existe pas
4. ✅ Crée les profils pour tous les utilisateurs auth sans profil

---

## 📝 **SOLUTION MANUELLE**

Si vous préférez le faire manuellement :

```sql
-- 1. Trouver votre ID dans auth.users
SELECT id, email FROM auth.users WHERE email = 'ministere@gouv.ci';
-- Copiez l'ID

-- 2. Créer le profil dans public.users
INSERT INTO public.users (id, email, nom, prenom, role, mairie_id)
VALUES (
  'COLLEZ-L-ID-ICI',  -- ID de auth.users
  'ministere@gouv.ci',
  'Ministère',
  'Admin',
  'ministere',
  NULL
);

-- 3. Vérifier
SELECT * FROM public.users WHERE email = 'ministere@gouv.ci';
```

---

## 🔄 **APRÈS LA CORRECTION**

1. ✅ Déconnectez-vous
2. ✅ Reconnectez-vous
3. ✅ Accédez à `/ministere/dashboard`

---

## 📊 **VÉRIFICATION**

```sql
-- Vérifier que tous les utilisateurs auth ont un profil
SELECT 
  'Utilisateurs auth' as type,
  COUNT(*) as nombre
FROM auth.users
UNION ALL
SELECT 
  'Profils public.users' as type,
  COUNT(*) as nombre
FROM public.users;

-- Les deux nombres doivent être identiques !
```

---

## ⚠️ **POUR LES AGENTS AUSSI**

Si les agents ont le même problème, le script créera automatiquement leurs profils :

```sql
-- Le script crée des profils pour TOUS les utilisateurs auth sans profil
INSERT INTO public.users (id, email, nom, prenom, role, mairie_id)
SELECT 
  au.id,
  au.email,
  'Utilisateur',
  'Nouveau',
  'citoyen',  -- Rôle par défaut
  NULL
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
);
```

---

## 🎯 **STRUCTURE DES TABLES**

### **auth.users (Supabase Auth)**
```
id | email | encrypted_password | created_at
```

### **public.users (Votre application)**
```
id | email | nom | prenom | role | mairie_id
```

**Important :** Les deux tables doivent avoir le même `id` pour chaque utilisateur !

---

## 🔧 **SI LE PROBLÈME PERSISTE**

### **Vérifiez le trigger de création de profil**

Il devrait y avoir un trigger qui crée automatiquement un profil dans `public.users` quand un utilisateur s'inscrit dans `auth.users`.

```sql
-- Vérifier les triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users';
```

Si le trigger n'existe pas, créez-le :

```sql
-- Fonction de création de profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nom, prenom, role, mairie_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'prenom', 'Nouveau'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'citoyen'),
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 🎉 **RÉSUMÉ**

### **Problème :**
Compte existe dans `auth.users` mais pas dans `public.users`

### **Solution :**
```bash
supabase/corriger-profil-utilisateur.sql
```

### **Résultat :**
- ✅ Profils créés pour tous les utilisateurs
- ✅ Connexion fonctionne
- ✅ Dashboard accessible

---

**🔧 EXÉCUTEZ LE SCRIPT ET RECONNECTEZ-VOUS ! ✅**
