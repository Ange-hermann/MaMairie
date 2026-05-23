# 🔄 REMETTRE AVIS EN ATTENTE

## 🔴 **PROBLÈME**

L'avis a été créé avec le statut `approuvee` au lieu de `en_attente`.

**Cause possible :**
- Ancien code qui mettait `approuvee` par défaut
- Trigger dans la base de données
- Test manuel dans Supabase

---

## ✅ **SOLUTION**

**Exécutez ce script dans Supabase :**

`REMETTRE-EN-ATTENTE.sql`

**Ce script va :**
1. Remettre le statut à `en_attente`
2. Effacer `agent_id` et `date_traitement`
3. Vérifier le résultat

---

## 🎯 **APRÈS L'EXÉCUTION**

1. **Rechargez la page** : `Ctrl + F5`
2. **Allez sur** : `/agent/avis-mentions`
3. **Onglet VALIDATION** : L'avis devrait apparaître
4. **Testez** : Voir détails → Valider

---

## 🔧 **POUR ÉVITER ÇA À L'AVENIR**

Le code actuel dans `AvisMentionForm.tsx` met déjà `statut: 'en_attente'`.

**Si le problème persiste :**
- Vérifiez s'il y a des triggers dans Supabase
- Vérifiez les RLS policies
- Créez un nouvel avis pour tester

---

**📄 FICHIERS :**
- `REMETTRE-EN-ATTENTE.sql` ← **EXÉCUTEZ**
- `REMETTRE_AVIS_EN_ATTENTE.md` ← Ce guide

---

**🔄 EXÉCUTEZ LE SCRIPT ET TESTEZ ! ✅**
