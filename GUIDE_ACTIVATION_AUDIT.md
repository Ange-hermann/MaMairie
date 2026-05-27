# 🚀 Guide d'Activation du Système d'Audit

## ⚠️ IMPORTANT : À faire AVANT de tester

Le système d'audit nécessite que les tables soient créées dans Supabase.

---

## 📋 Étape 1 : Exécuter la migration SQL

### Option A : Via Supabase Dashboard (Recommandé)

1. **Ouvrir Supabase** : https://supabase.com
2. **Sélectionner votre projet** MaMairie
3. **Aller dans SQL Editor** (icône 🗄️ dans le menu gauche)
4. **Créer une nouvelle query**
5. **Copier-coller** le contenu du fichier `supabase/create-audit-logs.sql`
6. **Cliquer sur "Run"** (ou F5)
7. **Vérifier** qu'il n'y a pas d'erreurs

### Option B : Via CLI Supabase

```bash
# Dans le terminal
cd c:/Users/Angeh/OneDrive/Bureau/MaMairie
supabase db push
```

---

## ✅ Étape 2 : Vérifier que les tables sont créées

Dans Supabase SQL Editor, exécuter :

```sql
-- Vérifier les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('audit_logs', 'sessions_actives', 'ip_bloquees');

-- Devrait retourner 3 lignes
```

---

## 🎯 Étape 3 : Tester les pages d'audit

### Pour le Ministère

1. **Se connecter** avec un compte ministère
2. **Cliquer** sur "Journal d'Audit National" dans le menu (icône 🛡️)
3. **Vérifier** que la page s'affiche sans erreur
4. **Tester** les 3 onglets :
   - Journal complet
   - Alertes de sécurité
   - Temps réel

### Pour un Agent

1. **Se connecter** avec un compte agent
2. **Cliquer** sur "Mon Journal d'Audit" dans le menu (icône 🛡️)
3. **Vérifier** que la page s'affiche
4. **Voir** uniquement ses propres actions

---

## 🧪 Étape 4 : Générer des logs de test

Pour avoir des données à afficher :

1. **Valider une déclaration** (en tant qu'agent)
2. **Approuver un avis de mention** (en tant qu'agent)
3. **Générer un PDF** (en tant qu'agent)
4. **Créer une déclaration** (en tant que citoyen)

Ensuite, retourner dans `/ministere/audit` ou `/agent/audit` pour voir les logs !

---

## 🔍 Vérifier manuellement les logs

Dans Supabase SQL Editor :

```sql
-- Voir les 10 derniers logs
SELECT 
  created_at,
  action_type,
  user_email,
  user_role,
  statut,
  message
FROM audit_logs
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🎨 Navigation dans l'interface

### Menu Ministère
```
📊 Tableau de Bord National
🏢 Toutes les Mairies
👥 Agents Municipaux
📈 Statistiques Nationales
📄 Alertes & Anomalies
✅ Vérification Actes
🛡️ Journal d'Audit National  ← NOUVEAU !
```

### Menu Agent
```
📊 Tableau de Bord
📄 Demandes Extraits
👶 Déclarations Naissance
⚠️ Avis de Mention
🛡️ Mon Journal d'Audit  ← NOUVEAU !
🏛️ État Civil
   └─ 👶 Naissances
   └─ 💑 Mariages
   └─ ✝️ Décès
📁 Documents
📊 Statistiques
```

---

## ❌ Problèmes courants

### Erreur : "relation audit_logs does not exist"
**Solution** : La migration SQL n'a pas été exécutée. Retourner à l'Étape 1.

### Erreur : "permission denied for table audit_logs"
**Solution** : Les politiques RLS ne sont pas créées. Vérifier que toute la migration a été exécutée.

### Page vide / Aucun log
**C'est normal !** Il faut d'abord générer des logs en effectuant des actions (Étape 4).

### Erreur de compilation TypeScript
**Solution** : Redémarrer le serveur de développement :
```bash
npm run dev
```

---

## 📊 Ce que vous devriez voir

### Dashboard Ministère (`/ministere/audit`)

```
┌─────────────────────────────────────────────┐
│ 🛡️ Journal d'Audit National                │
│ 🔒 Données non modifiables                  │
├─────────────────────────────────────────────┤
│                                              │
│ 📊 STATISTIQUES                              │
│ ┌──────┬──────┬──────┬──────┐              │
│ │  247 │  12  │   3  │  45  │              │
│ │Actions│Échecs│Fraude│Users │              │
│ └──────┴──────┴──────┴──────┘              │
│                                              │
│ [Journal] [Alertes 🚨] [Temps réel ⚡]      │
│                                              │
│ 🔍 [Recherche...] [Filtres...]              │
│                                              │
│ 📋 Tableau des logs...                       │
│                                              │
│ [📥 Export PDF] [📥 Export Excel]           │
└─────────────────────────────────────────────┘
```

---

## 🎉 Succès !

Si vous voyez la page d'audit avec les statistiques et le tableau, **c'est bon !** 

Le système d'audit est maintenant opérationnel ! 🚀

---

## 📞 Besoin d'aide ?

Consultez :
- `AUDIT_SYSTEM.md` - Documentation complète
- `AUDIT_INTEGRATION_EXAMPLE.md` - Exemples de code
- `AUDIT_INTEGRATION_DONE.md` - Intégrations effectuées
