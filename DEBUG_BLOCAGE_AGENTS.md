# 🐛 Debug : Blocage des Agents

## 🔍 **ÉTAPES DE DEBUG**

### **1. Ouvrir la Console du Navigateur**
1. Appuyez sur **F12**
2. Allez dans l'onglet **Console**
3. Rafraîchissez la page `/ministere/agents`

### **2. Vérifier les Logs**

Vous devriez voir :
```
📋 Agents récupérés: X
📊 Statuts des agents: [...]
📈 Stats calculées: {...}
```

### **3. Tester le Bouton Bloquer**

1. Cliquez sur le bouton **Ban** (rouge)
2. Dans la console, vous devriez voir :

```
🔄 toggleStatut appelé: {agentId: "...", currentStatut: "actif"}
📝 Nouveau statut: bloque
⏳ Début de la mise à jour...
✅ Statut mis à jour avec succès: [...]
🔄 Rafraîchissement de la liste...
📋 Agents récupérés: X
📊 Statuts des agents: [...]
✅ Fin de toggleStatut
```

---

## ❌ **ERREURS POSSIBLES**

### **Erreur 1 : "column statut does not exist"**

**Solution :**
```sql
-- Dans Supabase SQL Editor
ALTER TABLE users ADD COLUMN statut VARCHAR(20) DEFAULT 'actif';
UPDATE users SET statut = 'actif' WHERE role = 'agent' AND statut IS NULL;
```

### **Erreur 2 : "permission denied"**

**Solution :** Vérifier les RLS policies
```sql
-- Voir les policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Créer une policy pour le ministère
CREATE POLICY "Ministere peut modifier statut agents"
ON users
FOR UPDATE
USING (auth.uid() IN (
  SELECT id FROM users WHERE role = 'ministere'
))
WITH CHECK (auth.uid() IN (
  SELECT id FROM users WHERE role = 'ministere'
));
```

### **Erreur 3 : Statut toujours NULL**

**Solution :**
```sql
-- Mettre à jour tous les agents
UPDATE users 
SET statut = 'actif' 
WHERE role = 'agent' 
AND (statut IS NULL OR statut = '');

-- Vérifier
SELECT id, email, statut FROM users WHERE role = 'agent';
```

---

## 🧪 **TESTS MANUELS**

### **Test 1 : Vérifier la colonne statut**
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'statut';
```

**Résultat attendu :**
```
column_name | data_type      | column_default
statut      | character varying | 'actif'::character varying
```

### **Test 2 : Voir les agents et leurs statuts**
```sql
SELECT 
  id,
  email,
  nom,
  prenom,
  role,
  statut,
  created_at
FROM users
WHERE role = 'agent'
ORDER BY created_at DESC;
```

### **Test 3 : Bloquer manuellement**
```sql
-- Bloquer un agent
UPDATE users 
SET statut = 'bloque' 
WHERE email = 'VOTRE_EMAIL_AGENT@mairie.ci';

-- Vérifier
SELECT email, statut FROM users WHERE email = 'VOTRE_EMAIL_AGENT@mairie.ci';
```

### **Test 4 : Débloquer manuellement**
```sql
-- Débloquer
UPDATE users 
SET statut = 'actif' 
WHERE email = 'VOTRE_EMAIL_AGENT@mairie.ci';

-- Vérifier
SELECT email, statut FROM users WHERE email = 'VOTRE_EMAIL_AGENT@mairie.ci';
```

---

## 📋 **CHECKLIST DE VÉRIFICATION**

- [ ] La colonne `statut` existe dans la table `users`
- [ ] Tous les agents ont un statut (`actif` ou `bloque`)
- [ ] Les logs apparaissent dans la console
- [ ] Le bouton affiche bien l'icône (Ban ou CheckCircle)
- [ ] Le clic sur le bouton déclenche la confirmation
- [ ] La mise à jour se fait dans Supabase
- [ ] La liste se rafraîchit après l'action
- [ ] Le message de succès s'affiche

---

## 🔧 **SCRIPT DE RÉPARATION COMPLET**

```sql
-- 1. Créer la colonne si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'statut'
    ) THEN
        ALTER TABLE users ADD COLUMN statut VARCHAR(20) DEFAULT 'actif';
    END IF;
END $$;

-- 2. Mettre à jour les agents sans statut
UPDATE users 
SET statut = 'actif' 
WHERE role = 'agent' 
AND (statut IS NULL OR statut = '');

-- 3. Vérifier
SELECT 
    COUNT(*) as total_agents,
    COUNT(CASE WHEN statut = 'actif' THEN 1 END) as actifs,
    COUNT(CASE WHEN statut = 'bloque' THEN 1 END) as bloques,
    COUNT(CASE WHEN statut IS NULL THEN 1 END) as sans_statut
FROM users
WHERE role = 'agent';

-- 4. Créer une policy si nécessaire
CREATE POLICY IF NOT EXISTS "Ministere peut modifier agents"
ON users
FOR UPDATE
TO authenticated
USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'ministere')
)
WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE role = 'ministere')
);
```

---

## 📞 **QUE FAIRE SI ÇA NE FONCTIONNE TOUJOURS PAS**

1. **Copier les logs de la console** et les envoyer
2. **Exécuter ce SQL** et envoyer le résultat :
```sql
SELECT 
  id,
  email,
  role,
  statut,
  created_at
FROM users
WHERE role = 'agent'
LIMIT 5;
```

3. **Vérifier les policies** :
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users';
```

---

## ✅ **RÉSULTAT ATTENDU**

Après toutes ces corrections :

1. **Console** : Logs clairs à chaque action
2. **Bouton** : Change d'icône (Ban ↔ CheckCircle)
3. **Couleur** : Change (Rouge ↔ Vert)
4. **Base de données** : Statut mis à jour
5. **Message** : Confirmation de succès

---

**💡 Suivez ces étapes et partagez les logs de la console !**
