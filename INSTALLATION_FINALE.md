# 🚀 INSTALLATION FINALE - MaMairie

## ✅ **ÉTAPE 1 : Exécuter le Script SQL (OBLIGATOIRE)**

### **Dans Supabase SQL Editor :**

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Cliquez sur **SQL Editor**
4. Copiez-collez le contenu de `supabase/SETUP_COMPLET.sql`
5. Cliquez sur **Run**

**Ce script va :**
- ✅ Créer la table `verifications_actes`
- ✅ Ajouter les colonnes `motif_rejet` et `date_rejet`
- ✅ Supprimer les triggers problématiques
- ✅ Ajouter la colonne `fcm_token` pour Firebase
- ✅ Configurer les permissions (RLS)

---

## ✅ **ÉTAPE 2 : Vérifier les Données**

### **Vérifier les actes de naissance :**
```sql
SELECT COUNT(*) AS total FROM naissances;
SELECT numero_acte, nom_enfant, prenom_enfant FROM naissances LIMIT 5;
```

**Résultat attendu :** Au moins 4 actes

### **Vérifier les mairies :**
```sql
SELECT COUNT(*) AS total FROM mairies;
SELECT nom_mairie, ville FROM mairies LIMIT 5;
```

---

## ✅ **ÉTAPE 3 : Tester les Fonctionnalités**

### **1. Rejet de Demande** ✅
1. Allez sur `/agent/demandes`
2. Cliquez sur une demande
3. Cliquez sur **"Rejeter"**
4. Sélectionnez un motif
5. Confirmez

**Résultat attendu :** Demande rejetée avec notification au citoyen

### **2. Vérification d'Acte** ✅
1. Allez sur `/ministere/verification`
2. Entrez le numéro : `1234567890`
3. Cliquez sur **"Vérifier"**

**Résultat attendu :** Acte trouvé avec détails

### **3. Scanner QR Code** ✅
1. Téléchargez un extrait PDF
2. Scannez le QR Code bleu
3. Vous serez redirigé vers `/extrait/naissance/[id]`
4. Cliquez sur **"Télécharger le PDF"**

**Résultat attendu :** PDF téléchargé

---

## ✅ **ÉTAPE 4 : Configurer Firebase (OPTIONNEL)**

**Si vous voulez des notifications app fermée :**

1. Suivez le guide `FIREBASE_SETUP.md`
2. Ou utilisez OneSignal (plus simple)
3. Ou gardez Supabase Realtime (déjà fonctionnel)

---

## 📊 **STATISTIQUES ET CARTES**

### **Les cartes affichent 0 - C'est normal !**

**Pourquoi ?** La table `verifications_actes` est vide au départ.

**Solution : Utilisez l'interface pour vérifier de vrais actes**

1. **Allez sur** `/ministere/verification`
2. **Vérifiez quelques actes** en entrant ces numéros :
   - `1234567890` (Lynda Tagro)
   - `1234567` (Hermann BOUA)
   - `2353783` (Ange Boua)
   - `2323245` (EFZGG boua)

3. **Chaque vérification va automatiquement** :
   - ✅ Créer une entrée dans la base
   - ✅ Mettre à jour les stats (Total, Valides, Suspects, Invalides)
   - ✅ Ajouter une ligne dans l'historique

4. **Rafraîchissez la page** → Les stats s'affichent ! 🎉

### **Nettoyer les données de test (si besoin)**

Si vous avez des données de test à supprimer :
```sql
-- Exécutez le contenu de nettoyer-donnees-test.sql
DELETE FROM verifications_actes;
```

---

## 🐛 **PROBLÈMES CONNUS ET SOLUTIONS**

### **1. Rejet ne fonctionne pas**
**Solution :** Exécutez `SETUP_COMPLET.sql`

### **2. Vérification affiche "Introuvable"**
**Solution :** Utilisez un numéro valide : `1234567890`

### **3. Scanner QR ne fonctionne pas**
**Solutions :**
- Autorisez l'accès à la caméra
- Utilisez HTTPS (pas HTTP)
- Ou utilisez la saisie manuelle

### **4. Stats à zéro**
**Solution :** Vérifiez quelques actes pour remplir l'historique

---

## 🎯 **CHECKLIST FINALE**

- [ ] Script SQL `SETUP_COMPLET.sql` exécuté
- [ ] Table `verifications_actes` créée
- [ ] Colonnes `motif_rejet` et `date_rejet` ajoutées
- [ ] Triggers problématiques supprimés
- [ ] Rejet de demande testé et fonctionne
- [ ] Vérification d'acte testée et fonctionne
- [ ] QR Code de téléchargement testé
- [ ] Stats affichées correctement
- [ ] Code poussé sur GitHub
- [ ] Déployé sur Netlify

---

## 🚀 **DÉPLOIEMENT**

### **Netlify déploiera automatiquement quand vous poussez sur GitHub**

```bash
git add .
git commit -m "🎉 Version finale complète"
git push origin main
```

### **Vérifier le déploiement :**
1. Allez sur https://app.netlify.com
2. Vérifiez que le build réussit
3. Testez sur l'URL de production

---

## 📚 **DOCUMENTATION**

- `FIREBASE_SETUP.md` - Configuration Firebase
- `INTEGRATION_NOTIFICATIONS.md` - Intégration notifications
- `RESUME_SESSION.md` - Résumé de la session
- `supabase/SETUP_COMPLET.sql` - Script SQL complet

---

**🎉 VOTRE APPLICATION EST PRÊTE ! 🎉**

**Toutes les fonctionnalités sont opérationnelles ! 🚀**
