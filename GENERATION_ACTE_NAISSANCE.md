# 📄 GÉNÉRATION ACTE DE NAISSANCE - ÉTAT CIVIL

## 🎯 **OBJECTIF**

Quand l'agent génère l'acte après vérification des documents, créer automatiquement une entrée dans la table `naissances` (état civil officiel).

---

## ✅ **CE QUI A ÉTÉ FAIT**

### **1. Fonction SQL** ✅
**Fichier :** `supabase/fonction-generer-acte-naissance.sql`

**Fonction :** `generer_acte_naissance(p_declaration_id, p_agent_id)`

**Ce qu'elle fait :**
1. Vérifie que la déclaration a les documents vérifiés
2. Génère un numéro d'acte unique : `N-YYYY-NNNN`
3. Insère l'acte dans la table `naissances`
4. Met à jour la déclaration avec `acte_id` et statut `remis`
5. Retourne l'ID de l'acte créé

---

### **2. Page Agent Modifiée** ✅
**Fichier :** `app/agent/declarations/page.tsx`

**Bouton "Générer l'Acte" :**
- Appelle la fonction `generer_acte_naissance`
- Affiche confirmation avant génération
- Affiche message de succès
- Recharge les données

---

## 🔄 **WORKFLOW COMPLET**

```
1. Citoyen fait déclaration
   ↓
2. Agent valide (statut: validee)
   ↓
3. Citoyen vient avec documents
   ↓
4. Agent vérifie documents (statut: documents_verifies)
   ↓
5. Agent clique "Générer l'Acte"
   ↓
6. ✅ FONCTION SQL APPELÉE
   ↓
7. Acte créé dans table `naissances`
   - Numéro: N-2024-0001
   - Toutes les infos copiées
   - Agent enregistreur noté
   ↓
8. Déclaration mise à jour
   - acte_id rempli
   - statut: remis
   - date_remise enregistrée
   ↓
9. ✅ ACTE OFFICIEL CRÉÉ !
```

---

## 📊 **DONNÉES CRÉÉES**

### **Table `naissances` (État Civil)**
```sql
INSERT INTO naissances (
  numero_acte,        -- N-2024-0001
  annee,              -- 2024
  mairie_id,          -- UUID mairie
  nom,                -- KOUADIO
  prenom,             -- Yao
  sexe,               -- masculin
  date_naissance,     -- 2024-05-15
  heure_naissance,    -- 10:30:00
  lieu_naissance,     -- Abidjan
  nom_pere,           -- Jean KOUADIO
  prenom_pere,        -- Jean
  nom_mere,           -- Marie N'GUESSAN
  prenom_mere,        -- Marie
  agent_enregistreur_id, -- UUID agent
  declaration_id      -- Lien vers déclaration
)
```

### **Table `declarations_naissance` (Mise à jour)**
```sql
UPDATE declarations_naissance SET
  acte_id = 'uuid-acte-créé',
  statut = 'remis',
  date_remise = NOW(),
  agent_remise_id = 'uuid-agent'
WHERE id = 'uuid-declaration'
```

---

## 🔢 **NUMÉROTATION AUTOMATIQUE**

**Format :** `N-YYYY-NNNN`

**Exemples :**
- Premier acte 2024 : `N-2024-0001`
- Deuxième acte 2024 : `N-2024-0002`
- Premier acte 2025 : `N-2025-0001`

**Par mairie :**
- Chaque mairie a sa propre séquence
- Numéros uniques par année et par mairie

---

## 🚀 **POUR TESTER**

### **1. Exécuter le script SQL**
```sql
-- Dans Supabase SQL Editor
supabase/fonction-generer-acte-naissance.sql
```

### **2. Tester le workflow**
```
1. Faire une déclaration de naissance
2. Agent valide
3. Agent vérifie documents
4. Agent clique "Générer l'Acte"
5. ✅ Confirmation demandée
6. ✅ Acte créé dans état civil
7. Vérifier dans table `naissances`
```

### **3. Vérifier dans la base**
```sql
-- Voir les actes créés
SELECT 
  numero_acte,
  nom,
  prenom,
  date_naissance,
  created_at
FROM naissances
ORDER BY created_at DESC
LIMIT 10;

-- Voir les déclarations avec acte
SELECT 
  code_suivi,
  nom_enfant,
  statut,
  acte_id,
  date_remise
FROM declarations_naissance
WHERE acte_id IS NOT NULL
ORDER BY date_remise DESC;
```

---

## ⚠️ **SÉCURITÉ**

**Vérifications dans la fonction :**
1. ✅ Documents doivent être vérifiés
2. ✅ Statut doit être `documents_verifies`
3. ✅ Numéro d'acte unique garanti
4. ✅ Agent enregistreur tracé
5. ✅ Lien déclaration ↔ acte maintenu

---

## 📋 **PROCHAINES ÉTAPES**

### **À FAIRE :**

**1. Génération PDF** ⏳
```
- Créer template PDF acte de naissance
- Inclure numéro, infos, signatures
- Téléchargement automatique
```

**2. Notification citoyen** ⏳
```
- Email: "Votre acte est prêt"
- SMS avec numéro d'acte
```

**3. Registre d'état civil** ⏳
```
- Page pour consulter tous les actes
- Recherche par numéro, nom, date
- Export registre annuel
```

**4. Statistiques** ⏳
```
- Nombre d'actes par mois
- Délai moyen de traitement
- Graphiques
```

---

## 🎉 **RÉSULTAT**

✅ Déclaration → Acte officiel automatique
✅ Numérotation unique
✅ Traçabilité complète
✅ État civil mis à jour
✅ Workflow sécurisé

---

**📄 EXÉCUTEZ LE SCRIPT SQL ET TESTEZ ! 🚀**
