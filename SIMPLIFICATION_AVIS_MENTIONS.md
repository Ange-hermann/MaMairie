# 🎯 SIMPLIFICATION AVIS MENTIONS

## 📋 **CE QUE VOUS VOULEZ**

Un système simple comme les déclarations avec 2 sections :
1. **Validation** - Pour valider les avis
2. **Traitement** - Pour traiter les avis validés

**PAS** de système complexe avec recherche par code !

---

## ✅ **ÉTAPES**

### **1. Créer la table mentions_apposees**

**Fichier :** `CREER-TABLE-MENTIONS-APPOSEES.sql`

**Exécutez dans Supabase SQL Editor**

---

### **2. Simplifier la page agent**

Je vais créer une version simplifiée de la page qui ressemble à celle des déclarations.

**Workflow simplifié :**
```
1. Section VALIDATION
   - Liste des avis en_attente
   - Bouton "Voir détails" → Modale
   - Dans la modale : Valider ou Rejeter

2. Section TRAITEMENT  
   - Liste des avis validés (approuvee)
   - Bouton "Voir détails" → Modale
   - Dans la modale : Informations + Télécharger
```

---

## 🔄 **PROCHAINES ÉTAPES**

1. ✅ Exécuter `CREER-TABLE-MENTIONS-APPOSEES.sql`
2. ⏳ Je vais simplifier la page `app/agent/avis-mentions/page.tsx`
3. ⏳ Supprimer la page `[id]/page.tsx` (pas besoin)

---

**Voulez-vous que je simplifie la page maintenant ?**

Dites "OUI" et je vais créer une version simple comme les déclarations !
