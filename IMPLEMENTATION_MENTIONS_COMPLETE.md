# ✅ IMPLÉMENTATION MENTIONS - COMPLÈTE

## 🎯 **CE QUI A ÉTÉ FAIT**

### **1. Script SQL créé**
**Fichier :** `AJOUTER-COLONNES-MENTIONS-ACTES.sql`

**Ajoute aux tables naissances, mariages, deces :**
- `a_mention` (BOOLEAN) - Indique si l'acte a une mention
- `date_derniere_mention` (TIMESTAMP) - Date de la dernière mention

### **2. Fonction handleApprouver() modifiée**
**Fichier :** `app/agent/avis-mentions/page.tsx`

**Nouveau workflow :**
```
1. Récupère l'acte original (naissances/mariages/deces)
2. Crée la mention dans mentions_apposees
3. Marque l'acte avec a_mention = true
4. Approuve l'avis
5. Affiche confirmation
```

---

## 🚀 **POUR UTILISER**

### **Étape 1 : Exécuter le script SQL**

**Dans Supabase SQL Editor :**
```
AJOUTER-COLONNES-MENTIONS-ACTES.sql
```

**Ce script va :**
- Ajouter les colonnes aux 3 tables
- Vérifier que tout est OK
- Afficher "✅ Colonnes ajoutées avec succès !"

### **Étape 2 : Recharger l'application**

```
Ctrl + F5
```

### **Étape 3 : Tester le workflow complet**

```
1. Créer un avis de mention
2. Valider (en_traitement)
3. Vérifier documents (documents_verifies)
4. Approuver Définitivement
   → Récupère l'acte
   → Ajoute la mention
   → Marque l'acte
   → Approuve
5. ✅ Confirmation affichée
```

---

## 📋 **CE QUI SE PASSE LORS DE L'APPROBATION**

### **1. Récupération de l'acte**
```typescript
// Détermine la table selon le type
tableName = 'naissances' | 'mariages' | 'deces'

// Cherche l'acte
WHERE numero_acte = avis.numero_acte_cible
AND annee = avis.annee_acte_cible
```

### **2. Création de la mention**
```typescript
INSERT INTO mentions_apposees (
  avis_mention_id,
  type_acte,
  acte_id,
  type_mention,
  texte_mention,
  date_mention,
  agent_id
)
```

### **3. Mise à jour de l'acte**
```typescript
UPDATE naissances/mariages/deces
SET 
  a_mention = true,
  date_derniere_mention = NOW()
WHERE id = acte.id
```

### **4. Approbation de l'avis**
```typescript
UPDATE avis_mentions
SET 
  statut = 'approuvee',
  date_approbation = NOW(),
  agent_approbation_id = agent.id
WHERE id = avis.id
```

---

## 📊 **DONNÉES CRÉÉES**

### **Table mentions_apposees :**
| Colonne | Valeur |
|---------|--------|
| avis_mention_id | ID de l'avis |
| type_acte | naissance/mariage/deces |
| acte_id | ID de l'acte original |
| type_mention | adoption/mariage/divorce/etc |
| texte_mention | Description de la mention |
| date_mention | Date de l'événement |
| agent_id | ID de l'agent |

### **Table naissances/mariages/deces :**
| Colonne | Valeur |
|---------|--------|
| a_mention | true |
| date_derniere_mention | Date actuelle |

---

## 🎯 **PROCHAINES ÉTAPES**

### **✅ Déjà fait :**
1. ✅ Colonnes ajoutées aux tables
2. ✅ Fonction handleApprouver() modifiée
3. ✅ Création mention dans mentions_apposees
4. ✅ Mise à jour de l'acte

### **⏳ À faire plus tard :**
1. ⏳ Générer PDF avec mentions visibles
2. ⏳ Afficher les mentions sur la page de l'acte
3. ⏳ Historique des mentions
4. ⏳ Télécharger acte avec mentions

---

## 🔍 **VÉRIFICATION**

### **Après approbation, vérifiez :**

```sql
-- 1. La mention a été créée
SELECT * FROM mentions_apposees 
WHERE avis_mention_id = 'ID_AVIS';

-- 2. L'acte a été marqué
SELECT numero_acte, a_mention, date_derniere_mention 
FROM naissances 
WHERE numero_acte = 'NUMERO';

-- 3. L'avis est approuvé
SELECT code_suivi, statut, date_approbation 
FROM avis_mentions 
WHERE code_suivi = 'CODE';
```

---

## ⚠️ **IMPORTANT**

**Avant de tester :**
1. ✅ Exécutez `AJOUTER-COLONNES-MENTIONS-ACTES.sql`
2. ✅ Exécutez `CREER-TABLE-MENTIONS-APPOSEES.sql` (si pas déjà fait)
3. ✅ Rechargez l'app (Ctrl+F5)

**L'acte original doit exister :**
- Vérifiez que le numéro d'acte existe
- Vérifiez que l'année correspond
- Sinon l'erreur "Acte original non trouvé" apparaîtra

---

**✅ IMPLÉMENTATION COMPLÈTE ! EXÉCUTEZ LE SQL ET TESTEZ ! ✅**
