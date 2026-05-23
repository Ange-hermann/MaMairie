# 🔍 AFFICHAGE DES AGENTS DE SOUS-PRÉFECTURE

## ❌ **PROBLÈME**

"Aucun agent trouvé" s'affiche alors qu'il devrait y avoir des agents.

---

## 🔍 **CAUSES POSSIBLES**

### **Cause 1 : Aucun agent n'existe dans la base**

Vérifiez avec :
```bash
supabase/verifier-agents.sql
```

**Si résultat = 0 agents :**
- ✅ Créez des agents via le formulaire
- ✅ Ou exécutez `corriger-profil-utilisateur.sql` pour créer les profils

---

### **Cause 2 : Les agents existent mais ne s'affichent pas**

**Problèmes possibles :**
1. Le filtre "Toutes les mairies" ne fonctionne pas
2. La requête ne charge pas les agents
3. Les agents n'ont pas de `mairie_id`

---

## ✅ **SOLUTIONS**

### **Solution 1 : Vérifier si des agents existent**

```sql
-- Dans Supabase SQL Editor
SELECT COUNT(*) FROM users WHERE role = 'agent';
```

**Si 0 :** Créez des agents via le formulaire

**Si > 0 :** Passez à la solution 2

---

### **Solution 2 : Vérifier les profils**

```sql
-- Voir les agents
SELECT 
  email,
  nom,
  prenom,
  mairie_id,
  created_at
FROM users
WHERE role = 'agent';
```

**Si `mairie_id` est NULL pour tous :**
- Les agents ne sont pas assignés à une mairie/SP
- Ils ne s'affichent pas dans le filtre

---

### **Solution 3 : Modifier le filtre pour inclure les agents sans mairie**

Le filtre actuel :
```typescript
const matchMairie = selectedMairie === 'all' || agent.mairie_id === selectedMairie
```

**Problème :** Si `selectedMairie = 'all'` et que l'agent n'a pas de `mairie_id`, il ne s'affiche pas.

**Solution :** Modifier le filtre pour toujours afficher les agents quand "Toutes les mairies" est sélectionné.

---

## 🔧 **MODIFICATION À APPLIQUER**

### **Fichier :** `/app/ministere/agents/page.tsx`

### **Ligne 474 - Modifier le filtre :**

**Avant :**
```typescript
const matchMairie = selectedMairie === 'all' || agent.mairie_id === selectedMairie
```

**Après :**
```typescript
const matchMairie = selectedMairie === 'all' || 
                    agent.mairie_id === selectedMairie ||
                    (selectedMairie === 'all' && !agent.mairie_id)
```

**Ou plus simple :**
```typescript
const matchMairie = selectedMairie === 'all' || agent.mairie_id === selectedMairie
```

Le problème vient probablement d'ailleurs...

---

## 🎯 **VÉRIFICATIONS**

### **1. Console du navigateur**

Ouvrez la console (F12) et regardez :
```
📋 Agents récupérés: X
```

**Si X = 0 :** Aucun agent dans la base
**Si X > 0 :** Les agents sont chargés mais le filtre ne fonctionne pas

---

### **2. Vérifier le state `agents`**

Ajoutez un `console.log` :
```typescript
console.log('👥 Agents chargés:', agents.length)
console.log('🔍 Agents filtrés:', filteredAgents.length)
```

---

### **3. Vérifier le filtre de mairie**

```typescript
console.log('🏢 Mairie sélectionnée:', selectedMairie)
console.log('📊 Agents par mairie:', agents.map(a => ({
  email: a.email,
  mairie_id: a.mairie_id
})))
```

---

## 🎉 **RÉSUMÉ**

### **Étapes de dépannage :**

1. ✅ Exécuter `verifier-agents.sql` pour voir si des agents existent
2. ✅ Vérifier la console du navigateur (F12)
3. ✅ Vérifier que `selectedMairie = 'all'` par défaut
4. ✅ Créer des agents si aucun n'existe

---

**🔍 EXÉCUTEZ `verifier-agents.sql` POUR VOIR SI DES AGENTS EXISTENT ! 📊**
