# 🚀 Commandes SQL Rapides - MaMairie

## ✅ **1. VÉRIFIER L'INSTALLATION**

### **Vérifier que les fonctions existent**
```sql
SELECT proname 
FROM pg_proc 
WHERE proname LIKE 'detect%' OR proname LIKE 'executer%'
ORDER BY proname;
```

### **Vérifier que les triggers sont actifs**
```sql
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname LIKE '%detection%';
```

---

## 🔍 **2. LANCER LA DÉTECTION**

### **Détection manuelle de toutes les anomalies**
```sql
SELECT executer_detection_fraudes();
```

### **Voir les statistiques**
```sql
SELECT * FROM get_stats_fraudes();
```

---

## 📊 **3. CONSULTER LES ALERTES**

### **Voir les 10 dernières alertes**
```sql
SELECT 
  id,
  type,
  severite,
  titre,
  description,
  statut,
  date_detection
FROM alertes_ministere
ORDER BY date_detection DESC
LIMIT 10;
```

### **Voir uniquement les nouvelles alertes**
```sql
SELECT * FROM alertes_ministere 
WHERE statut = 'nouvelle' 
ORDER BY date_detection DESC;
```

### **Compter par type**
```sql
SELECT 
  type,
  COUNT(*) as nombre
FROM alertes_ministere
WHERE statut = 'nouvelle'
GROUP BY type
ORDER BY nombre DESC;
```

### **Compter par sévérité**
```sql
SELECT 
  severite,
  COUNT(*) as nombre
FROM alertes_ministere
WHERE statut = 'nouvelle'
GROUP BY severite
ORDER BY nombre DESC;
```

---

## 🧪 **4. TESTS**

### **Créer un doublon de naissance (TEST)**
```sql
-- Récupérer des IDs valides
SELECT id FROM mairies LIMIT 1;  -- Copier l'ID
SELECT id FROM users WHERE role = 'agent' LIMIT 1;  -- Copier l'ID

-- Créer 2 naissances identiques (remplacer les UUIDs)
INSERT INTO naissances (
  nom_enfant, prenom_enfant, date_naissance, lieu_naissance, 
  numero_acte, mairie_id, created_by, sexe, nom_pere, nom_mere
)
VALUES 
  ('DUPONT', 'Jean', '2024-01-01', 'Abidjan', 'TEST-001', 
   'VOTRE_MAIRIE_ID', 'VOTRE_USER_ID', 'M', 'PERE', 'MERE'),
  ('DUPONT', 'Jean', '2024-01-01', 'Abidjan', 'TEST-002', 
   'VOTRE_MAIRIE_ID', 'VOTRE_USER_ID', 'M', 'PERE', 'MERE');

-- Lancer la détection
SELECT executer_detection_fraudes();

-- Vérifier l'alerte créée
SELECT * FROM alertes_ministere 
WHERE type = 'doublon' 
ORDER BY date_detection DESC 
LIMIT 1;
```

### **Créer une date future (TEST)**
```sql
INSERT INTO naissances (
  nom_enfant, prenom_enfant, date_naissance, lieu_naissance, 
  numero_acte, mairie_id, created_by, sexe, nom_pere, nom_mere
)
VALUES 
  ('FUTUR', 'Marie', '2030-12-31', 'Abidjan', 'TEST-FUTUR', 
   'VOTRE_MAIRIE_ID', 'VOTRE_USER_ID', 'F', 'PERE', 'MERE');

-- Lancer la détection
SELECT executer_detection_fraudes();

-- Vérifier
SELECT * FROM alertes_ministere 
WHERE type = 'date_incoherente' 
ORDER BY date_detection DESC 
LIMIT 1;
```

---

## 🗑️ **5. NETTOYAGE**

### **Supprimer les données de test**
```sql
DELETE FROM naissances WHERE numero_acte LIKE 'TEST%';
DELETE FROM alertes_ministere WHERE description LIKE '%TEST%';
```

### **Supprimer toutes les alertes nouvelles (ATTENTION !)**
```sql
DELETE FROM alertes_ministere WHERE statut = 'nouvelle';
```

---

## ⚙️ **6. GESTION DES TRIGGERS**

### **Désactiver temporairement**
```sql
ALTER TABLE naissances DISABLE TRIGGER after_insert_naissance_detection;
ALTER TABLE mariages DISABLE TRIGGER after_insert_mariage_detection;
```

### **Réactiver**
```sql
ALTER TABLE naissances ENABLE TRIGGER after_insert_naissance_detection;
ALTER TABLE mariages ENABLE TRIGGER after_insert_mariage_detection;
```

---

## 📈 **7. ANALYSES AVANCÉES**

### **Alertes par mairie**
```sql
SELECT 
  m.nom_mairie,
  m.ville,
  COUNT(a.id) as nombre_alertes,
  STRING_AGG(DISTINCT a.type, ', ') as types
FROM alertes_ministere a
JOIN mairies m ON m.id = a.mairie_id
WHERE a.statut = 'nouvelle'
GROUP BY m.nom_mairie, m.ville
ORDER BY nombre_alertes DESC;
```

### **Évolution des alertes par jour**
```sql
SELECT 
  DATE(date_detection) as jour,
  COUNT(*) as nombre_alertes,
  COUNT(*) FILTER (WHERE severite = 'critique') as critiques
FROM alertes_ministere
WHERE date_detection >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(date_detection)
ORDER BY jour DESC;
```

### **Top 10 des anomalies**
```sql
SELECT 
  type,
  severite,
  COUNT(*) as occurrences
FROM alertes_ministere
GROUP BY type, severite
ORDER BY occurrences DESC
LIMIT 10;
```

---

## 🔧 **8. MAINTENANCE**

### **Archiver les alertes résolues**
```sql
-- Créer une table d'archive (une seule fois)
CREATE TABLE IF NOT EXISTS alertes_ministere_archive AS 
SELECT * FROM alertes_ministere WHERE 1=0;

-- Archiver les alertes de plus de 90 jours
INSERT INTO alertes_ministere_archive
SELECT * FROM alertes_ministere
WHERE statut = 'resolue' 
AND date_resolution < CURRENT_DATE - INTERVAL '90 days';

-- Supprimer les alertes archivées
DELETE FROM alertes_ministere
WHERE statut = 'resolue' 
AND date_resolution < CURRENT_DATE - INTERVAL '90 days';
```

---

## 📋 **9. VÉRIFICATIONS RAPIDES**

### **Vérifier s'il y a des doublons**
```sql
-- Doublons de naissances
SELECT 
  nom_enfant, 
  prenom_enfant, 
  date_naissance,
  COUNT(*) as nombre
FROM naissances
GROUP BY nom_enfant, prenom_enfant, date_naissance
HAVING COUNT(*) > 1;
```

### **Vérifier les dates futures**
```sql
SELECT * FROM naissances 
WHERE date_naissance > CURRENT_DATE;
```

### **Vérifier les personnes de plus de 120 ans**
```sql
SELECT 
  nom_enfant,
  prenom_enfant,
  date_naissance,
  EXTRACT(YEAR FROM AGE(date_naissance)) as age
FROM naissances
WHERE date_naissance < CURRENT_DATE - INTERVAL '120 years';
```

---

## 🎯 **COMMANDES ESSENTIELLES**

```sql
-- 1. Lancer la détection
SELECT executer_detection_fraudes();

-- 2. Voir les stats
SELECT * FROM get_stats_fraudes();

-- 3. Voir les alertes
SELECT * FROM alertes_ministere 
WHERE statut = 'nouvelle' 
ORDER BY date_detection DESC 
LIMIT 10;

-- 4. Compter par type
SELECT type, COUNT(*) 
FROM alertes_ministere 
WHERE statut = 'nouvelle' 
GROUP BY type;
```

---

**✅ Utilisez ces commandes dans Supabase SQL Editor !**
