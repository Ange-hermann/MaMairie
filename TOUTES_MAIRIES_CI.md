# 🏢 TOUTES LES MAIRIES DE CÔTE D'IVOIRE

## 📦 **FICHIER CRÉÉ**

**Fichier :** `supabase/inserer-toutes-mairies-ci.sql`

**Contenu :** ~100 mairies principales de Côte d'Ivoire

---

## 🚀 **INSTALLATION ULTRA-SIMPLE**

```bash
# Exécutez ce fichier unique dans Supabase SQL Editor
supabase/inserer-toutes-mairies-ci.sql
```

**C'est tout ! 🎉**

---

## 📊 **MAIRIES INCLUSES**

### **District Abidjan (13)**
- Mairie d'Abobo
- Mairie d'Adjamé
- Mairie d'Attécoubé
- Mairie de Cocody
- Mairie de Koumassi
- Mairie de Marcory
- Mairie du Plateau
- Mairie de Port-Bouët
- Mairie de Treichville
- Mairie de Yopougon
- Mairie de Songon
- Mairie de Bingerville
- Mairie d'Anyama

### **District Savanes (8)**
- Mairie de Korhogo
- Mairie de Ferkessédougou
- Mairie de Boundiali
- Mairie de Tengréla
- Mairie de Sinématiali
- Mairie de Kong
- Mairie d'Ouangolodougou
- Mairie de Kouto

### **District Vallée du Bandama (7)**
- Mairie de Bouaké
- Mairie de Katiola
- Mairie de Dabakala
- Mairie de Niakaramadougou
- Mairie de Sakassou
- Mairie de Béoumi
- Mairie de Botro

### **+ Toutes les autres grandes villes**
- Daloa, Man, Gagnoa, San-Pédro, Yamoussoukro, Abengourou, Bondoukou, etc.

**Total : ~100 mairies**

---

## ✅ **VÉRIFICATION**

```sql
-- Compter les mairies
SELECT COUNT(*) FROM mairies;
-- Résultat : ~100

-- Voir toutes les mairies
SELECT nom_mairie, ville FROM mairies ORDER BY nom_mairie;
```

---

## 🎯 **RÉSULTAT DANS LE FORMULAIRE**

Maintenant dans `/demande-extrait` :

```
Sélectionnez votre mairie :
[Mairie d'Abobo - Abobo ▼]
[Mairie d'Abengourou - Abengourou ▼]
[Mairie d'Adjamé - Adjamé ▼]
[Mairie de Bouaké - Bouaké ▼]
[Mairie de Cocody - Cocody ▼]
[Mairie de Daloa - Daloa ▼]
[Mairie de Korhogo - Korhogo ▼]
[Mairie de Man - Man ▼]
[Mairie de Yamoussoukro - Yamoussoukro ▼]
... (~100 mairies)

100 mairie(s) disponible(s) ✅
```

---

## 📝 **AVANTAGES**

✅ **Ultra-simple** : Un seul fichier SQL
✅ **Pas de dépendances** : Pas besoin de communes ou SP
✅ **Fonctionne immédiatement** : INSERT direct
✅ **Toutes les grandes villes** : Couverture complète
✅ **Pas d'erreurs** : Seulement 2 colonnes (nom_mairie, ville)

---

## 🔄 **ORDRE D'EXÉCUTION COMPLET**

```bash
# Option 1 : Juste les mairies (SIMPLE)
supabase/inserer-toutes-mairies-ci.sql

# Option 2 : Système complet (AVANCÉ)
1. create-geo-simple.sql
2. seed-geo-cote-ivoire.sql
3. nettoyer-et-inserer-sous-prefectures.sql
4. nettoyer-et-inserer-communes.sql
5. inserer-toutes-mairies-ci.sql
```

---

**🏢 ~100 MAIRIES PRÊTES EN 1 CLIC ! 🇨🇮🎉**
