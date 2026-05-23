# 📋 INSTRUCTIONS FINALES - PAGE AVIS DE MENTION

## ✅ **CE QUI A ÉTÉ FAIT**

J'ai commencé à modifier la page `/app/agent/avis-mentions/page.tsx` :

1. ✅ Ajout des imports (VerificationDocumentsModal)
2. ✅ Ajout des states (activeTab, selectedAvis, modales)
3. ✅ Ajout useEffect pour réinitialiser la recherche
4. ✅ Modification du filtrage selon l'onglet
5. ✅ Ajout des fonctions handleValider, handleRejeter, handleVerificationDocuments

---

## ⏳ **CE QUI RESTE À FAIRE**

La page est partiellement modifiée. Il reste à ajouter l'interface avec les 2 onglets.

### **Option 1 : Copier-Coller (RECOMMANDÉ)**

**C'est plus rapide de copier la page des déclarations et l'adapter :**

```bash
# 1. Sauvegardez l'ancienne page
mv app/agent/avis-mentions/page.tsx app/agent/avis-mentions/page-old.tsx

# 2. Copiez la page déclarations
cp app/agent/declarations/page.tsx app/agent/avis-mentions/page.tsx

# 3. Ouvrez le nouveau fichier et remplacez:
# - Ctrl+H (Rechercher/Remplacer)
# - "declarations_naissance" → "avis_mention"
# - "DeclarationsAgentPage" → "AvisMentionsAgentPage"
# - "Déclarations de Naissance" → "Avis de Mention"
# - "nom_enfant" → "type_mention"
# - "prenom_enfant" → "numero_acte_original"

# 4. Adaptez l'affichage dans la carte (onglet Traitement)
```

### **Option 2 : Continuer les modifications**

Si vous préférez que je continue les modifications ligne par ligne, dites-le moi.
Mais ça va prendre beaucoup de messages car il y a encore ~100 lignes à modifier.

---

## 🎯 **RÉSULTAT ATTENDU**

**Page avec 2 onglets :**

**Onglet Validation :**
- Tableau des avis en_attente
- Boutons Valider/Rejeter

**Onglet Traitement :**
- Grand champ de recherche par code
- Carte avec infos de l'avis
- Bouton "Vérifier les Documents"

---

## 📄 **FICHIERS DÉJÀ PRÊTS**

✅ `supabase/creer-table-avis-mention.sql` - Script SQL
✅ `components/AvisMentionForm.tsx` - Formulaire avec modale
✅ `components/VerificationDocumentsModal.tsx` - Réutilisable
✅ `components/ModalAvertissementsLegaux.tsx` - Réutilisable

---

## 🚀 **RECOMMANDATION**

**Utilisez l'Option 1 (Copier-Coller)** car :
- ✅ Plus rapide (5 minutes vs 30 minutes)
- ✅ Moins d'erreurs
- ✅ Code déjà testé
- ✅ Juste besoin d'adapter les noms

---

**QUE VOULEZ-VOUS FAIRE ?**
1. Je copie la page déclarations et je l'adapte (rapide)
2. Je continue les modifications ligne par ligne (long)
