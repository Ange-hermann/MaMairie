# 🏢 GUIDE - CRÉATION AUTOMATIQUE DES MAIRIES

## 🎯 **CONCEPT**

**201 communes = 201 mairies**

Chaque commune a sa propre mairie. Le script crée automatiquement une mairie pour chaque commune.

---

## 📦 **FICHIER CRÉÉ**

**Fichier :** `supabase/creer-mairies-depuis-communes.sql`

**Fonctionnalités :**
- ✅ Crée une mairie pour chaque commune
- ✅ Génère automatiquement : nom, adresse, email, téléphone
- ✅ Assigne le type (mairie/sous-préfecture)
- ✅ Configure `gere_villages` selon le type de commune

---

## 🚀 **INSTALLATION**

### **Ordre d'exécution complet :**

```bash
# 1. Tables
supabase/create-geo-simple.sql

# 2. Données géographiques
supabase/seed-geo-cote-ivoire.sql

# 3. Sous-préfectures (~510)
supabase/nettoyer-et-inserer-sous-prefectures.sql

# 4. Communes (~200+)
supabase/nettoyer-et-inserer-communes.sql

# 5. Mairies (NOUVEAU - 201 mairies)
supabase/creer-mairies-depuis-communes.sql

# 6. Fonctions SQL
supabase/update-mairies-geo.sql
```

---

## 📊 **EXEMPLE DE MAIRIES CRÉÉES**

```
Mairie de Abobo
├── Commune: Abobo
├── Ville: Abobo
├── Adresse: BP 123, Abobo
├── Email: abobo@mairie.ci
├── Type: mairie
└── Gère villages: true

Mairie de Cocody
├── Commune: Cocody
├── Ville: Cocody
├── Adresse: BP 123, Cocody
├── Email: cocody@mairie.ci
├── Type: mairie
└── Gère villages: true

Mairie de Bouaké
├── Commune: Bouaké
├── Ville: Bouaké
├── Adresse: BP 123, Bouaké
├── Email: bouake@mairie.ci
├── Type: mairie
└── Gère villages: true
```

---

## ✅ **VÉRIFICATION**

```sql
-- Total de mairies
SELECT COUNT(*) FROM mairies;
-- Résultat attendu : ~201

-- Par type
SELECT type_mairie, COUNT(*) 
FROM mairies 
GROUP BY type_mairie;
-- Résultat :
-- mairie: ~201
-- sous_prefecture: ~300+

-- Communes sans mairie
SELECT COUNT(*) 
FROM communes c
WHERE NOT EXISTS (
  SELECT 1 FROM mairies m WHERE m.commune_id = c.id
);
-- Résultat attendu : 0

-- Exemples
SELECT nom_mairie, ville, type_mairie 
FROM mairies 
ORDER BY nom_mairie 
LIMIT 10;
```

---

## 🎯 **RÉSULTAT DANS LE FORMULAIRE**

Maintenant dans `/demande-extrait`, quand le citoyen clique sur "🏢 Mairie", il verra :

```
Sélectionnez votre mairie :
[Mairie d'Abobo - Abobo ▼]
[Mairie d'Abengourou - Abengourou ▼]
[Mairie d'Abidjan - Abidjan ▼]
[Mairie d'Aboisso - Aboisso ▼]
[Mairie d'Adjamé - Adjamé ▼]
[Mairie d'Adzopé - Adzopé ▼]
[Mairie d'Agboville - Agboville ▼]
[Mairie de Bouaké - Bouaké ▼]
[Mairie de Cocody - Cocody ▼]
[Mairie de Daloa - Daloa ▼]
... (201 mairies au total)

201 mairie(s) disponible(s) ✅
```

---

## 📝 **STRUCTURE DES DONNÉES**

### **Table mairies**

```sql
CREATE TABLE mairies (
  id UUID PRIMARY KEY,
  nom_mairie TEXT UNIQUE,
  commune_id UUID REFERENCES communes(id),
  sous_prefecture_id UUID REFERENCES sous_prefectures(id),
  ville TEXT,
  adresse TEXT,
  telephone TEXT,
  email TEXT,
  gere_villages BOOLEAN DEFAULT false,
  type_mairie TEXT DEFAULT 'mairie'
);
```

### **Données générées automatiquement**

| Champ | Format | Exemple |
|-------|--------|---------|
| nom_mairie | `Mairie de {commune}` | Mairie de Cocody |
| commune_id | UUID de la commune | uuid-cocody |
| ville | Nom de la commune | Cocody |
| adresse | `BP 123, {commune}` | BP 123, Cocody |
| email | `{commune}@mairie.ci` | cocody@mairie.ci |
| telephone | `+225 00 00 00 00` | +225 00 00 00 00 |
| type_mairie | `mairie` | mairie |
| gere_villages | true si urbaine | true |

---

## 🔄 **MISE À JOUR**

Si vous ajoutez de nouvelles communes plus tard :

```sql
-- Exécutez à nouveau le script
supabase/creer-mairies-depuis-communes.sql

-- Le script créera seulement les mairies manquantes
-- grâce à : WHERE NOT EXISTS (...)
```

---

## 💡 **PERSONNALISATION**

Pour modifier les données des mairies après création :

```sql
-- Mettre à jour le téléphone
UPDATE mairies 
SET telephone = '+225 27 XX XX XX XX'
WHERE nom_mairie = 'Mairie de Cocody';

-- Mettre à jour l'adresse
UPDATE mairies 
SET adresse = 'Boulevard Latrille, Cocody'
WHERE nom_mairie = 'Mairie de Cocody';

-- Mettre à jour l'email
UPDATE mairies 
SET email = 'contact@mairie-cocody.ci'
WHERE nom_mairie = 'Mairie de Cocody';
```

---

## 🎉 **RÉSULTAT FINAL**

Après l'exécution :

```
✅ 201 communes
✅ 201 mairies (1 par commune)
✅ ~300+ sous-préfectures administratives
✅ Total : ~500+ entités administratives
```

---

**🏢 TOUTES LES MAIRIES SONT MAINTENANT CRÉÉES AUTOMATIQUEMENT ! 🎉**
