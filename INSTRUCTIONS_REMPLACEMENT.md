# 🔄 REMPLACEMENT PAGE AVIS MENTIONS

## ✅ **NOUVELLE PAGE CRÉÉE**

**Fichier :** `app/agent/avis-mentions/page-simple.tsx`

**Caractéristiques :**
- ✅ 2 onglets : Validation et Traitement
- ✅ Modales pour voir les détails
- ✅ Boutons Valider/Rejeter dans la modale
- ✅ Statistiques en haut
- ✅ Recherche par code ou numéro
- ✅ Exactement comme la page déclarations !

---

## 🔄 **POUR APPLIQUER**

### **Option 1 : Renommer les fichiers (Recommandé)**

```bash
# Dans le dossier app/agent/avis-mentions/

# 1. Renommer l'ancienne page
mv page.tsx page-old.tsx

# 2. Renommer la nouvelle page
mv page-simple.tsx page.tsx

# 3. Supprimer le dossier [id] (pas besoin)
rm -rf [id]
```

### **Option 2 : Copier-coller**

1. Ouvrez `page-simple.tsx`
2. Copiez TOUT le contenu (Ctrl+A → Ctrl+C)
3. Ouvrez `page.tsx`
4. Remplacez TOUT par le nouveau contenu (Ctrl+A → Ctrl+V)
5. Sauvegardez (Ctrl+S)

---

## 🎯 **RÉSULTAT**

**Workflow simplifié :**

```
ONGLET VALIDATION
├─ Liste des avis en_attente
├─ Clic "Voir détails" → Modale
└─ Boutons : Valider | Rejeter

ONGLET TRAITEMENT
├─ Liste des avis approuvee/rejetee
├─ Clic "Voir détails" → Modale
└─ Affichage du résultat
```

---

## ⚠️ **N'OUBLIEZ PAS**

**Avant de tester, exécutez dans Supabase :**
```sql
CREER-TABLE-MENTIONS-APPOSEES.sql
```

---

## 📋 **CHECKLIST**

- [ ] Exécuter `CREER-TABLE-MENTIONS-APPOSEES.sql`
- [ ] Remplacer `page.tsx` par `page-simple.tsx`
- [ ] Supprimer le dossier `[id]` (optionnel)
- [ ] Recharger l'app (Ctrl+F5)
- [ ] Tester la validation

---

**🚀 REMPLACEZ LA PAGE ET TESTEZ ! ✅**
