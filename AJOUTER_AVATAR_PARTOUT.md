# 📸 Ajouter l'Avatar dans Toutes les Pages

## ✅ **Modifications Appliquées**

### **1. Header Component** ✅
- Ajout de la prop `avatarUrl?: string | null`
- Affichage de l'avatar si disponible
- Sinon affichage de la première lettre

### **2. Dashboard Citoyen** ✅
- `app/dashboard-citoyen/page.tsx`
- Avatar ajouté

---

## 🔧 **Pages à Mettre à Jour**

Pour chaque page, ajouter `avatarUrl={userData?.avatar_url}` au composant `<Header>` :

### **Dashboards** :
```typescript
// dashboard-agent/page.tsx
<Header 
  userName={userData ? `${userData.prenom} ${userData.nom}` : 'Chargement...'}
  userRole="agent"
  avatarUrl={userData?.avatar_url}  // ← AJOUTER
/>

// dashboard-admin/page.tsx
<Header 
  userName="Admin Système" 
  userRole="admin"
  avatarUrl={userData?.avatar_url}  // ← AJOUTER
/>
```

### **Pages Citoyen** :
```typescript
// demande-extrait/page.tsx
<Header 
  userName={userData ? `${userData.prenom} ${userData.nom}` : 'Chargement...'}
  userRole="citoyen"
  avatarUrl={userData?.avatar_url}  // ← AJOUTER
/>

// mes-demandes/page.tsx
<Header 
  userName={userData ? `${userData.prenom} ${userData.nom}` : 'Chargement...'}
  userRole="citoyen"
  avatarUrl={userData?.avatar_url}  // ← AJOUTER
/>

// profil/page.tsx
<Header 
  userName={userData ? `${userData.prenom} ${userData.nom}` : 'Chargement...'}
  userRole={userData?.role || 'citoyen'}
  avatarUrl={avatarUrl}  // ← AJOUTER (utilise avatarUrl local)
/>
```

### **Pages Agent** :
```typescript
// agent/demandes/page.tsx
// agent/etat-civil/naissances/page.tsx
// agent/etat-civil/mariages/page.tsx
// agent/etat-civil/deces/page.tsx
// agent/documents/page.tsx
// agent/statistiques/page.tsx

<Header 
  userName={userData ? `${userData.prenom} ${userData.nom}` : 'Chargement...'}
  userRole="agent"
  avatarUrl={userData?.avatar_url}  // ← AJOUTER
/>
```

### **Pages Ministère** :
```typescript
// ministere/dashboard/page.tsx
// ministere/mairies/page.tsx
// ministere/agents/page.tsx
// ministere/statistiques/page.tsx
// ministere/verification/page.tsx
// ministere/alertes/page.tsx

<Header 
  userName={userData ? `${userData.prenom} ${userData.nom}` : 'Chargement...'}
  userRole="ministere"
  avatarUrl={userData?.avatar_url}  // ← AJOUTER
/>
```

---

## 🎯 **Modification Automatique**

### **Rechercher** :
```
<Header 
  userName={userData ? `${userData.prenom} ${userData.nom}` : 'Chargement...'}
  userRole="
```

### **Remplacer par** :
```
<Header 
  userName={userData ? `${userData.prenom} ${userData.nom}` : 'Chargement...'}
  userRole="
  avatarUrl={userData?.avatar_url}
```

---

## ✅ **Résultat**

Après modification, l'avatar s'affichera :
- ✅ Dans le header de toutes les pages
- ✅ À la place de la première lettre
- ✅ Avec une bordure orange
- ✅ En temps réel après upload

---

## 🔍 **Vérification**

### **Tester** :
1. Uploader un avatar sur `/profil`
2. Naviguer vers différentes pages
3. ✅ L'avatar s'affiche partout !

---

## 📝 **Note**

La prop `avatarUrl` est **optionnelle** :
- Si `avatarUrl` existe → Affiche l'avatar
- Sinon → Affiche la première lettre

Pas besoin de modifier les pages qui n'ont pas `userData` (pages statiques).

---

**L'avatar s'affichera automatiquement dans toutes les pages ! 📸✨**
