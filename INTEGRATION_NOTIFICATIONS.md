# 🔔 Intégration du Système de Notifications

## ✅ **CE QUI A ÉTÉ FAIT**

### **1. Session Persistante** ✅
- `AuthProvider.tsx` - Gère la session globalement
- `middleware.ts` - Rafraîchit automatiquement la session
- Configuration Supabase avec `persistSession: true`

### **2. Système de Notifications** ✅
- `NotificationSystem.tsx` - Composant de notifications push
- Service Worker configuré
- Notifications en temps réel via Supabase Realtime

---

## 🚀 **INTÉGRATION DANS LES DASHBOARDS**

### **Dashboard Citoyen**

Ouvrir `app/dashboard-citoyen/page.tsx` et ajouter :

```typescript
import { NotificationSystem } from '@/components/NotificationSystem'

export default function DashboardCitoyenPage() {
  const [userData, setUserData] = useState<any>(null)
  
  // ... votre code existant ...

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="citoyen" />
      
      <div className="flex-1">
        <Header 
          userName={userData?.prenom + ' ' + userData?.nom}
          userRole="Citoyen"
        />
        
        {/* Votre contenu */}
        
        {/* AJOUTER ICI */}
        {userData && <NotificationSystem userId={userData.id} />}
      </div>
    </div>
  )
}
```

### **Dashboard Agent**

Ouvrir `app/agent/dashboard/page.tsx` et ajouter :

```typescript
import { NotificationSystem } from '@/components/NotificationSystem'

export default function DashboardAgentPage() {
  const [userData, setUserData] = useState<any>(null)
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="agent" />
      
      <div className="flex-1">
        <Header 
          userName={userData?.prenom + ' ' + userData?.nom}
          userRole="Agent"
        />
        
        {/* Votre contenu */}
        
        {/* AJOUTER ICI */}
        {userData && <NotificationSystem userId={userData.id} />}
      </div>
    </div>
  )
}
```

---

## 🔧 **VÉRIFICATION**

### **1. Session Persistante**

Testez :
1. Connectez-vous
2. Fermez l'onglet/fenêtre
3. Rouvrez l'app
4. ✅ Vous devriez rester connecté

### **2. Notifications**

Testez :
1. Ouvrez le dashboard
2. Cliquez sur "Activer les notifications"
3. Acceptez la permission
4. Demandez à un agent de rejeter une demande
5. ✅ Vous devriez recevoir une notification

---

## 📋 **CHECKLIST**

- [x] AuthProvider ajouté dans layout.tsx
- [x] Middleware créé pour rafraîchir la session
- [x] NotificationSystem créé
- [ ] NotificationSystem ajouté dans Dashboard Citoyen
- [ ] NotificationSystem ajouté dans Dashboard Agent
- [ ] Tester session persistante
- [ ] Tester notifications

---

## 🐛 **DÉBUGGAGE**

### **Si déconnecté après fermeture :**

1. Vérifier les cookies du navigateur
2. Vérifier la console : `localStorage.getItem('supabase.auth.token')`
3. Vérifier les logs du middleware

### **Si pas de notifications :**

1. Vérifier la permission : `Notification.permission`
2. Vérifier le Service Worker : DevTools → Application → Service Workers
3. Vérifier la console pour les erreurs

---

**🎉 SUIVEZ CE GUIDE POUR ACTIVER LES FONCTIONNALITÉS ! 🎉**
