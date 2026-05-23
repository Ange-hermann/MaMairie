# ✅ FORMULAIRE AGENT - CHOIX DU TYPE

## 🎯 **MODIFICATION APPLIQUÉE**

**Fichier modifié :** `/app/ministere/agents/page.tsx`

**Ajout :** Champ de sélection du type d'agent

---

## 📝 **NOUVEAU CHAMP**

### **Type d'agent**

Deux options disponibles :
- 🏢 **Agent de Mairie**
- 🏘️ **Agent de Sous-préfecture**

---

## 🎨 **INTERFACE**

```
┌─────────────────────────────────────┐
│ Type d'agent *                      │
│ [🏢 Agent de Mairie ▼]              │
│                                      │
│ Mairie d'affectation                │
│ [Sélectionner... ▼]                 │
└─────────────────────────────────────┘
```

**Quand on sélectionne "Agent de Sous-préfecture" :**

```
┌─────────────────────────────────────┐
│ Type d'agent *                      │
│ [🏘️ Agent de Sous-préfecture ▼]    │
│                                      │
│ Sous-préfecture d'affectation       │
│ [Sélectionner... ▼]                 │
└─────────────────────────────────────┘
```

---

## 🔄 **FONCTIONNEMENT**

1. **Par défaut :** Type = "Agent de Mairie"
2. **Changement de type :** Réinitialise la sélection de mairie/SP
3. **Label dynamique :** Change selon le type sélectionné

---

## 💡 **UTILISATION**

### **Pour créer un agent de mairie :**
1. Sélectionnez "🏢 Agent de Mairie"
2. Choisissez la mairie dans la liste
3. Créez l'agent

### **Pour créer un agent de sous-préfecture :**
1. Sélectionnez "🏘️ Agent de Sous-préfecture"
2. Choisissez la sous-préfecture dans la liste
3. Créez l'agent

---

## 📊 **DONNÉES SAUVEGARDÉES**

```typescript
{
  prenom: "Jean",
  nom: "Kouassi",
  email: "agent@mairie.ci",
  telephone: "+225 XX XX XX XX XX",
  type_agent: "mairie" | "sous_prefecture",  // NOUVEAU
  mairie_id: "uuid-de-la-mairie-ou-sp",
  role: "agent"
}
```

---

## ⚠️ **IMPORTANT**

- ✅ Le champ `type_agent` est ajouté au `formData`
- ✅ Quand on change le type, la sélection de mairie/SP est réinitialisée
- ✅ Le label change dynamiquement selon le type

---

## 🎉 **RÉSULTAT**

Maintenant vous pouvez créer :
- ✅ Des agents de mairie
- ✅ Des agents de sous-préfecture

**Le formulaire s'adapte automatiquement ! 🎨**
