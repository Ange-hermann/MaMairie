# 🚀 ORDRE D'EXÉCUTION COMPLET

## 📋 **ÉTAPES À SUIVRE**

### **Étape 1 : Insérer les mairies**

```bash
supabase/inserer-mairies-auto-code.sql
```

**Résultat :**
- ✅ ~110 mairies créées
- ⚠️ Tous les agents ont `mairie_id = NULL`

---

### **Étape 2 : Réassigner les agents**

```bash
supabase/reassigner-agents-mairies.sql
```

**Résultat :**
- ✅ Agents réassignés à leurs mairies
- ✅ Correspondance par ville

---

## 🔍 **COMMENT ÇA MARCHE**

### **Problème**

Quand on fait `TRUNCATE TABLE mairies CASCADE`, PostgreSQL met automatiquement à NULL tous les `mairie_id` dans la table `agents`.

**Avant :**
```
Agent Jean Dupont → mairie_id: abc-123 (Mairie de Cocody)
```

**Après TRUNCATE :**
```
Agent Jean Dupont → mairie_id: NULL ❌
```

---

### **Solution**

Le script `reassigner-agents-mairies.sql` réassigne les agents en fonction de leur **ville** :

```sql
UPDATE agents a
SET mairie_id = (
  SELECT m.id 
  FROM mairies m 
  WHERE m.ville = a.ville 
  LIMIT 1
)
WHERE a.mairie_id IS NULL
AND a.ville IS NOT NULL;
```

**Après réassignation :**
```
Agent Jean Dupont (ville: Cocody) → mairie_id: xyz-789 (nouvelle Mairie de Cocody) ✅
```

---

## ⚠️ **IMPORTANT**

### **Pour que ça marche, il faut que :**

1. ✅ Les agents aient une colonne `ville` remplie
2. ✅ Le nom de la ville corresponde exactement au nom dans `mairies.ville`

**Exemples de correspondance :**
- Agent avec `ville = 'Cocody'` → Mairie de Cocody
- Agent avec `ville = 'Abobo'` → Mairie d'Abobo
- Agent avec `ville = 'Bouaké'` → Mairie de Bouaké

---

## 📊 **VÉRIFICATION**

```sql
-- Voir combien d'agents ont une mairie
SELECT 
  'Agents avec mairie' as info,
  COUNT(*) as nombre
FROM agents
WHERE mairie_id IS NOT NULL;

-- Voir combien d'agents n'ont pas de mairie
SELECT 
  'Agents sans mairie' as info,
  COUNT(*) as nombre
FROM agents
WHERE mairie_id IS NULL;

-- Voir les agents par mairie
SELECT 
  m.nom_mairie,
  COUNT(a.id) as nb_agents
FROM mairies m
LEFT JOIN agents a ON a.mairie_id = m.id
GROUP BY m.nom_mairie
HAVING COUNT(a.id) > 0
ORDER BY COUNT(a.id) DESC;
```

---

## 🔧 **SI LES AGENTS N'ONT PAS DE COLONNE `ville`**

### **Option 1 : Ajouter la colonne**

```sql
ALTER TABLE agents ADD COLUMN ville TEXT;

-- Puis remplir manuellement ou par script
UPDATE agents SET ville = 'Cocody' WHERE email LIKE '%cocody%';
UPDATE agents SET ville = 'Abobo' WHERE email LIKE '%abobo%';
-- etc.
```

### **Option 2 : Réassignation manuelle**

```sql
-- Assigner tous les agents à une mairie par défaut
UPDATE agents 
SET mairie_id = (SELECT id FROM mairies WHERE nom_mairie = 'Mairie de Cocody')
WHERE mairie_id IS NULL;
```

### **Option 3 : Garder l'ancienne table**

Avant de faire `TRUNCATE`, sauvegardez les associations :

```sql
-- Créer une table temporaire
CREATE TEMP TABLE agents_mairies_backup AS
SELECT 
  a.id as agent_id,
  a.email,
  m.nom_mairie,
  m.ville
FROM agents a
JOIN mairies m ON a.mairie_id = m.id;

-- Après avoir recréé les mairies, réassigner
UPDATE agents a
SET mairie_id = m.id
FROM agents_mairies_backup amb
JOIN mairies m ON m.ville = amb.ville
WHERE a.id = amb.agent_id;
```

---

## 🎉 **RÉSUMÉ**

### **Ordre d'exécution :**

```bash
1. inserer-mairies-auto-code.sql       # Créer les mairies
2. reassigner-agents-mairies.sql       # Réassigner les agents
```

### **Résultat :**

- ✅ 110 mairies créées
- ✅ Agents réassignés automatiquement
- ✅ Système fonctionnel

---

**🔄 LES AGENTS SONT AUTOMATIQUEMENT RÉASSIGNÉS À LEURS MAIRIES ! ✅**
