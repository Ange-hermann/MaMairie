# 🔧 DÉPANNAGE - CONNEXION DASHBOARD MINISTÈRE

## ❌ **PROBLÈME**

Impossible de se connecter au dashboard ministère après avoir exécuté les scripts SQL.

---

## 🔍 **CAUSES POSSIBLES**

### **Cause 1 : mairie_id mis à NULL**

Quand on fait `TRUNCATE TABLE mairies CASCADE`, PostgreSQL met automatiquement à NULL tous les `mairie_id` dans la table `users`.

**Pour les utilisateurs ministère, c'est NORMAL !**
- ✅ Les utilisateurs ministère doivent avoir `mairie_id = NULL`
- ✅ Ils ont accès à toutes les données nationales

**Mais si votre rôle a changé, c'est un problème.**

---

### **Cause 2 : Rôle incorrect**

Votre compte doit avoir :
- ✅ `role = 'ministere'` OU `role = 'admin'`
- ✅ `mairie_id = NULL`

---

## ✅ **SOLUTION**

### **Étape 1 : Vérifier votre compte**

```bash
# Exécutez ce script
supabase/corriger-acces-ministere.sql
```

Ou directement dans Supabase SQL Editor :

```sql
-- Voir votre compte
SELECT 
  id,
  email,
  nom,
  prenom,
  role,
  mairie_id
FROM users
WHERE email = 'votre-email@example.com';  -- Remplacez par votre email
```

---

### **Étape 2 : Corriger si nécessaire**

```sql
-- Si votre rôle n'est pas 'ministere'
UPDATE users 
SET role = 'ministere', mairie_id = NULL
WHERE email = 'votre-email@example.com';  -- Remplacez par votre email
```

---

### **Étape 3 : Vérifier tous les rôles**

```sql
SELECT DISTINCT role, COUNT(*) as nombre
FROM users
GROUP BY role;
```

**Résultat attendu :**
```
role      | nombre
----------|-------
ministere | 1-5
agent     | 10-50
citoyen   | 100+
```

---

## 🔍 **VÉRIFICATIONS SUPPLÉMENTAIRES**

### **1. Vérifier la protection de route**

Le dashboard ministère vérifie probablement :

```typescript
// app/ministere/page.tsx ou layout
if (user.role !== 'ministere' && user.role !== 'admin') {
  redirect('/login')
}
```

### **2. Vérifier Supabase Auth**

```sql
-- Voir les utilisateurs authentifiés
SELECT * FROM auth.users LIMIT 10;
```

### **3. Vérifier les sessions**

Déconnectez-vous et reconnectez-vous :
1. Cliquez sur "Déconnexion"
2. Reconnectez-vous avec vos identifiants
3. Essayez d'accéder à `/ministere/dashboard`

---

## 📝 **SCRIPT DE CORRECTION RAPIDE**

```sql
-- CORRECTION RAPIDE POUR COMPTE MINISTÈRE

-- 1. Trouver votre compte
SELECT id, email, role, mairie_id 
FROM users 
WHERE email LIKE '%votre-email%';

-- 2. Corriger le rôle et mairie_id
UPDATE users 
SET 
  role = 'ministere',
  mairie_id = NULL
WHERE email = 'votre-email@example.com';

-- 3. Vérifier
SELECT email, role, mairie_id 
FROM users 
WHERE email = 'votre-email@example.com';
```

---

## ⚠️ **SI LE PROBLÈME PERSISTE**

### **Option 1 : Créer un nouveau compte ministère**

```sql
-- Créer un compte ministère de secours
INSERT INTO users (email, nom, prenom, role, mairie_id)
VALUES (
  'admin@ministere.ci',
  'Admin',
  'Ministère',
  'ministere',
  NULL
);
```

Puis créez le mot de passe via Supabase Auth Dashboard.

---

### **Option 2 : Vérifier les logs**

Ouvrez la console du navigateur (F12) et regardez les erreurs :
- Erreur 401 → Problème d'authentification
- Erreur 403 → Problème de permissions
- Erreur 404 → Route introuvable

---

## 🎯 **RÉSUMÉ**

### **Compte ministère correct :**

```
email: admin@ministere.ci
role: ministere
mairie_id: NULL  ← IMPORTANT !
```

### **Commandes rapides :**

```sql
-- Voir votre compte
SELECT * FROM users WHERE email = 'votre-email@example.com';

-- Corriger
UPDATE users 
SET role = 'ministere', mairie_id = NULL
WHERE email = 'votre-email@example.com';

-- Vérifier
SELECT role, mairie_id FROM users WHERE email = 'votre-email@example.com';
```

---

**🔧 EXÉCUTEZ CES COMMANDES ET RECONNECTEZ-VOUS ! ✅**
