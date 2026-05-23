# 🚀 GUIDE ULTRA-SIMPLE

## ✅ **INSTALLATION MINIMALE**

### **Étape unique : Insérer les mairies**

```bash
supabase/inserer-mairies-auto-code.sql
```

**C'est tout ! 🎉**

---

## 📊 **RÉSULTAT**

```sql
SELECT COUNT(*) FROM mairies;
-- Résultat : ~110 ✅
```

**Dans le formulaire :**
```
110 mairie(s) disponible(s) ✅
```

---

## 🔄 **POUR LES UTILISATEURS (OPTIONNEL)**

Si vous voulez réassigner les utilisateurs à leurs mairies :

```bash
supabase/reassigner-users-simple.sql
```

**Ce script :**
- ✅ Affiche les utilisateurs sans mairie
- ✅ Affiche les colonnes disponibles
- ✅ Propose des exemples de réassignation manuelle

---

## 📝 **RÉASSIGNATION MANUELLE**

Si vous connaissez les utilisateurs, réassignez-les manuellement :

```sql
-- Exemple 1 : Par email
UPDATE users 
SET mairie_id = (SELECT id FROM mairies WHERE nom_mairie = 'Mairie de Cocody')
WHERE email LIKE '%cocody%';

-- Exemple 2 : Par nom
UPDATE users 
SET mairie_id = (SELECT id FROM mairies WHERE nom_mairie = 'Mairie d''Abobo')
WHERE nom LIKE '%Abobo%';

-- Exemple 3 : Tous les agents à une mairie par défaut
UPDATE users 
SET mairie_id = (SELECT id FROM mairies WHERE nom_mairie = 'Mairie de Cocody' LIMIT 1)
WHERE mairie_id IS NULL AND role = 'agent';
```

---

## ⚠️ **PAS DE COLONNE `ville` ?**

**Pas de problème !** Vous pouvez :

1. **Laisser les utilisateurs sans mairie** - Ils pourront la choisir lors de leur connexion
2. **Réassigner manuellement** - Utilisez les exemples ci-dessus
3. **Ajouter la colonne plus tard** - Quand vous aurez le temps

---

## 🎯 **L'ESSENTIEL**

### **Ce qui fonctionne déjà :**

✅ Formulaire citoyen avec 110 mairies
✅ Sélection de mairie dans le formulaire
✅ Recherche de villages
✅ Mairie trouvée automatiquement

### **Ce qui est optionnel :**

⏳ Réassignation des utilisateurs
⏳ Ajout de la colonne ville
⏳ Sous-préfectures et communes

---

## 🎉 **RÉSUMÉ**

**Fichier principal :**
```bash
supabase/inserer-mairies-auto-code.sql
```

**Résultat :**
- ✅ 110 mairies
- ✅ Formulaire fonctionnel
- ✅ Système prêt

---

**🇨🇮 EXÉCUTEZ `inserer-mairies-auto-code.sql` ET TESTEZ LE FORMULAIRE ! 🎉**
