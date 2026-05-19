# 🚨 Détection Automatique de Fraudes - Guide Complet

## ✅ **Système Implémenté**

### **5 Types de Détection Automatique**

#### **1. 🔄 Détection de Doublons**
- **Naissances** : Même nom, prénom, date, lieu
- **Mariages** : Même époux, épouse, date
- **Sévérité** : Critique
- **Action** : Alerte automatique

#### **2. 📅 Dates Incohérentes**
- Date de naissance dans le futur
- Âge supérieur à 120 ans
- Date de mariage avant naissance
- **Sévérité** : Critique/Moyenne

#### **3. 🔢 Numéros Suspects**
- Numéros d'acte en double
- Format invalide
- Séquence anormale
- **Sévérité** : Critique

#### **4. 📊 Volumes Anormaux**
- Volume > 3x la moyenne nationale
- Détection par mairie
- Analyse mensuelle
- **Sévérité** : Moyenne

#### **5. 🔍 Anomalies Multiples**
- Cumul d'anomalies sur un acte
- Score de risque
- Priorisation automatique

---

## 🗄️ **Architecture SQL**

### **Fonctions Créées**

```sql
-- Détections spécifiques
detect_doublons_naissances()
detect_doublons_mariages()
detect_dates_incoherentes()
detect_numeros_suspects()
detect_volumes_anormaux()

-- Fonction principale
executer_detection_fraudes()

-- Statistiques
get_stats_fraudes()
```

### **Triggers Automatiques**

```sql
-- Après chaque insertion de naissance
TRIGGER after_insert_naissance_detection

-- Après chaque insertion de mariage
TRIGGER after_insert_mariage_detection
```

---

## 🚀 **Installation**

### **Étape 1 : Exécuter le Script SQL**

1. Allez sur Supabase Dashboard
2. SQL Editor
3. Copiez le contenu de `supabase/detection-fraudes.sql`
4. Exécutez le script
5. ✅ Toutes les fonctions et triggers sont créés

### **Étape 2 : Tester la Détection**

```sql
-- Exécuter manuellement
SELECT executer_detection_fraudes();

-- Voir les statistiques
SELECT * FROM get_stats_fraudes();

-- Voir les alertes
SELECT * FROM alertes_ministere 
WHERE statut = 'nouvelle' 
ORDER BY date_detection DESC 
LIMIT 10;
```

---

## 📊 **Fonctionnement**

### **Détection Automatique**

1. **Insertion d'un acte** (naissance, mariage, décès)
2. **Trigger activé** automatiquement
3. **Analyse** de tous les critères
4. **Création d'alertes** si fraude détectée
5. **Notification** au Ministère

### **Détection Manuelle**

```sql
-- Lancer la détection
SELECT executer_detection_fraudes();
```

---

## 🎯 **Exemples de Détection**

### **Exemple 1 : Doublon de Naissance**

```sql
-- Insérer 2 naissances identiques
INSERT INTO naissances (nom_enfant, prenom_enfant, date_naissance, lieu_naissance, mairie_id)
VALUES 
  ('KOUASSI', 'Jean', '2024-01-15', 'Abidjan', 'uuid-mairie'),
  ('KOUASSI', 'Jean', '2024-01-15', 'Abidjan', 'uuid-mairie');

-- Résultat : Alerte créée automatiquement
```

### **Exemple 2 : Date dans le Futur**

```sql
-- Insérer une naissance future
INSERT INTO naissances (nom_enfant, prenom_enfant, date_naissance, mairie_id)
VALUES ('KONE', 'Marie', '2025-12-31', 'uuid-mairie');

-- Résultat : Alerte "Date dans le futur"
```

### **Exemple 3 : Volume Anormal**

```sql
-- Si une mairie enregistre 100 naissances en 1 mois
-- Et la moyenne nationale est 30
-- Résultat : Alerte "Volume anormal"
```

---

## 📈 **Statistiques**

### **Fonction get_stats_fraudes()**

Retourne :
- `total_alertes` : Nombre total d'alertes
- `alertes_critiques` : Alertes critiques
- `alertes_moyennes` : Alertes moyennes
- `alertes_faibles` : Alertes faibles
- `doublons` : Nombre de doublons
- `dates_incoherentes` : Dates suspectes
- `numeros_suspects` : Numéros en double
- `volumes_anormaux` : Volumes suspects

---

## 🔒 **Sécurité**

### **Prévention des Faux Positifs**

- Vérification d'existence avant création d'alerte
- Pas de doublon d'alertes
- Seuils configurables
- Analyse contextuelle

### **Performance**

- Triggers asynchrones (ne bloquent pas l'insertion)
- Index sur les colonnes clés
- Analyse par batch
- Optimisation des requêtes

---

## 🎨 **Interface Utilisateur**

### **Page Alertes & Anomalies**

Déjà existante : `/ministere/alertes`

**Améliorations à venir :**
- Badge "Nouvelles alertes"
- Filtrage par type de fraude
- Actions en masse
- Export des rapports

---

## 🧪 **Tests**

### **Test 1 : Créer un Doublon**

```sql
-- Créer 2 naissances identiques
INSERT INTO naissances (nom_enfant, prenom_enfant, date_naissance, lieu_naissance, numero_acte, mairie_id)
VALUES 
  ('TEST', 'Doublon', '2024-01-01', 'Abidjan', 'TEST-001', 'uuid'),
  ('TEST', 'Doublon', '2024-01-01', 'Abidjan', 'TEST-002', 'uuid');

-- Vérifier l'alerte
SELECT * FROM alertes_ministere WHERE type = 'doublon' ORDER BY date_detection DESC LIMIT 1;
```

### **Test 2 : Date Future**

```sql
INSERT INTO naissances (nom_enfant, prenom_enfant, date_naissance, numero_acte, mairie_id)
VALUES ('TEST', 'Future', '2030-01-01', 'TEST-003', 'uuid');

-- Vérifier
SELECT * FROM alertes_ministere WHERE type = 'date_incoherente' ORDER BY date_detection DESC LIMIT 1;
```

---

## 📋 **Checklist d'Installation**

- [ ] Exécuter `detection-fraudes.sql` dans Supabase
- [ ] Vérifier que les fonctions sont créées
- [ ] Vérifier que les triggers sont actifs
- [ ] Tester avec un doublon
- [ ] Tester avec une date future
- [ ] Vérifier les alertes dans `/ministere/alertes`
- [ ] Configurer les notifications (optionnel)

---

## 🚀 **Prochaines Améliorations**

### **À Implémenter**
- [ ] Machine Learning pour patterns suspects
- [ ] Analyse de graphes (réseaux de fraude)
- [ ] Scoring de risque par acte
- [ ] Notifications email automatiques
- [ ] Dashboard analytics avancé
- [ ] Export automatique des rapports
- [ ] API de vérification externe

---

## 📞 **Support**

### **Commandes Utiles**

```sql
-- Voir toutes les alertes
SELECT * FROM alertes_ministere ORDER BY date_detection DESC;

-- Compter par type
SELECT type, COUNT(*) FROM alertes_ministere GROUP BY type;

-- Alertes critiques non traitées
SELECT * FROM alertes_ministere 
WHERE severite = 'critique' AND statut = 'nouvelle';

-- Désactiver temporairement les triggers
ALTER TABLE naissances DISABLE TRIGGER after_insert_naissance_detection;

-- Réactiver
ALTER TABLE naissances ENABLE TRIGGER after_insert_naissance_detection;
```

---

**✅ Le système de détection automatique de fraudes est maintenant opérationnel ! 🎉**
