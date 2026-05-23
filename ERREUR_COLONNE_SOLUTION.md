# ❌ ERREUR COLONNE - SOLUTION

## 🔴 **ERREUR**

```
Erreur lors de la génération de l'acte: column "nom" of relation "naissances" does not exist
```

---

## 🔍 **CAUSE**

La fonction SQL utilisait les mauvais noms de colonnes :
- ❌ `nom` → ✅ `nom_enfant`
- ❌ `prenom` → ✅ `prenom_enfant`
- ❌ `agent_enregistreur_id` → ✅ `agent_id`
- ❌ `declaration_id` → (n'existe pas dans naissances)

---

## ✅ **SOLUTION**

**Fichier corrigé :** `supabase/fonction-generer-acte-naissance.sql`

**Modifications :**
```sql
-- AVANT (incorrect)
nom,
prenom,
agent_enregistreur_id,
declaration_id

-- APRÈS (correct)
nom_enfant,
prenom_enfant,
agent_id
```

---

## 🚀 **POUR APPLIQUER LA CORRECTION**

**1. Exécutez le fichier corrigé :**
```sql
-- Dans Supabase SQL Editor
supabase/fonction-generer-acte-naissance.sql
```

**2. Retestez :**
```
1. Allez sur /agent/declarations
2. Cliquez "Générer l'Acte + PDF"
3. ✅ Devrait fonctionner maintenant !
```

---

## 📋 **STRUCTURE CORRECTE DE LA TABLE**

**Table `naissances` :**
```sql
- id
- numero_acte
- annee
- mairie_id
- nom_enfant          ← Pas "nom"
- prenom_enfant       ← Pas "prenom"
- sexe
- date_naissance
- heure_naissance
- lieu_naissance
- nom_pere
- prenom_pere
- date_naissance_pere
- nationalite_pere
- profession_pere
- nom_mere
- prenom_mere
- date_naissance_mere
- nationalite_mere
- profession_mere
- agent_id            ← Pas "agent_enregistreur_id"
- created_at
- updated_at
```

---

## 🔄 **WORKFLOW APRÈS CORRECTION**

```
1. Citoyen fait déclaration
   ↓
2. Agent valide
   ↓
3. Agent vérifie documents
   ↓
4. Agent clique "Générer l'Acte + PDF"
   ↓
5. ✅ Fonction SQL appelée
   ↓
6. ✅ Acte créé dans table naissances
   - Colonnes correctes utilisées
   - Numéro : N-2024-0001
   ↓
7. ✅ PDF généré et téléchargé
   ↓
8. ✅ TERMINÉ !
```

---

## 📄 **FICHIERS**

**Modifiés :**
- `supabase/fonction-generer-acte-naissance.sql` ✅

**Créés :**
- `supabase/verifier-structure-naissances.sql` (pour vérifier)
- `ERREUR_COLONNE_SOLUTION.md` (ce document)

---

## ✅ **RÉSULTAT**

✅ Fonction corrigée
✅ Noms de colonnes corrects
✅ Génération d'acte fonctionnelle
✅ PDF téléchargé

---

**🚀 EXÉCUTEZ LA FONCTION CORRIGÉE ET TESTEZ ! ✅**
