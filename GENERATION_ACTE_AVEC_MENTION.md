# 📋 GÉNÉRATION ACTE AVEC MENTION

## 🎯 **OBJECTIF**

Quand l'agent clique "Approuver Définitivement", le système doit :

1. **Récupérer l'acte original**
   - Type : naissance, mariage, décès
   - Numéro : `numero_acte_cible`
   - Année : `annee_acte_cible`

2. **Ajouter la mention à l'acte**
   - Insérer dans `mentions_apposees`
   - Lier à l'acte original

3. **Générer un nouveau PDF**
   - PDF de l'acte AVEC la mention
   - Mention visible en bas de l'acte

4. **Mettre à jour le statut**
   - Avis → `approuvee`
   - Acte → Marqué comme ayant une mention

---

## 📋 **TYPES DE MENTIONS**

Selon `type_mention` :

### **1. Adoption**
- Mention : "Adopté(e) par [nom adoptant] le [date]"
- Ajoutée en bas de l'acte de naissance

### **2. Mariage**
- Mention : "Marié(e) à [nom conjoint] le [date] à [lieu]"
- Ajoutée en bas de l'acte de naissance

### **3. Divorce**
- Mention : "Divorcé(e) de [nom ex-conjoint] le [date]"
- Ajoutée en bas de l'acte de mariage

### **4. Décès**
- Mention : "Décédé(e) le [date] à [lieu]"
- Ajoutée en bas de l'acte de naissance

### **5. Reconnaissance**
- Mention : "Reconnu(e) par [nom parent] le [date]"
- Ajoutée en bas de l'acte de naissance

### **6. Changement de nom**
- Mention : "Nom changé en [nouveau nom] le [date]"
- Ajoutée en bas de l'acte de naissance

---

## 🔧 **IMPLÉMENTATION**

### **Étape 1 : Modifier handleApprouver()**

```typescript
const handleApprouver = async (avis: any) => {
  if (!confirm('Approuver et générer l\'acte avec mention ?')) return

  try {
    // 1. Récupérer l'acte original
    const tableName = avis.type_acte_cible === 'naissance' ? 'naissances' :
                     avis.type_acte_cible === 'mariage' ? 'mariages' : 'deces'
    
    const { data: acte } = await supabase
      .from(tableName)
      .select('*')
      .eq('numero_acte', avis.numero_acte_cible)
      .eq('annee', avis.annee_acte_cible)
      .single()

    if (!acte) throw new Error('Acte original non trouvé')

    // 2. Créer la mention apposée
    const { error: mentionError } = await supabase
      .from('mentions_apposees')
      .insert([{
        avis_mention_id: avis.id,
        type_acte: avis.type_acte_cible,
        acte_id: acte.id,
        type_mention: avis.type_mention,
        texte_mention: avis.description_mention,
        date_mention: avis.date_evenement,
        agent_id: userData.id
      }])

    if (mentionError) throw mentionError

    // 3. Mettre à jour l'acte (marquer qu'il a une mention)
    const { error: acteError } = await supabase
      .from(tableName)
      .update({ 
        a_mention: true,
        date_derniere_mention: new Date().toISOString()
      })
      .eq('id', acte.id)

    if (acteError) throw acteError

    // 4. Approuver l'avis
    const { error } = await supabase
      .from('avis_mentions')
      .update({
        statut: 'approuvee',
        date_approbation: new Date().toISOString(),
        agent_approbation_id: userData.id
      })
      .eq('id', avis.id)

    if (error) throw error

    // 5. Générer le PDF avec mention
    await genererPDFAvecMention(acte, avis)

    alert('✅ Avis approuvé et acte généré avec mention')
    fetchData()
  } catch (error: any) {
    alert('❌ Erreur : ' + error.message)
  }
}
```

### **Étape 2 : Créer la fonction genererPDFAvecMention()**

```typescript
const genererPDFAvecMention = async (acte: any, avis: any) => {
  // Récupérer toutes les mentions de cet acte
  const { data: mentions } = await supabase
    .from('mentions_apposees')
    .select('*')
    .eq('acte_id', acte.id)
    .order('date_mention', { ascending: true })

  // Générer le PDF selon le type d'acte
  if (avis.type_acte_cible === 'naissance') {
    await genererPDFNaissanceAvecMentions(acte, mentions)
  } else if (avis.type_acte_cible === 'mariage') {
    await genererPDFMariageAvecMentions(acte, mentions)
  } else {
    await genererPDFDecesAvecMentions(acte, mentions)
  }
}
```

---

## 📋 **COLONNES À AJOUTER**

### **Table naissances, mariages, deces :**
```sql
ALTER TABLE naissances ADD COLUMN IF NOT EXISTS a_mention BOOLEAN DEFAULT FALSE;
ALTER TABLE naissances ADD COLUMN IF NOT EXISTS date_derniere_mention TIMESTAMP;

ALTER TABLE mariages ADD COLUMN IF NOT EXISTS a_mention BOOLEAN DEFAULT FALSE;
ALTER TABLE mariages ADD COLUMN IF NOT EXISTS date_derniere_mention TIMESTAMP;

ALTER TABLE deces ADD COLUMN IF NOT EXISTS a_mention BOOLEAN DEFAULT FALSE;
ALTER TABLE deces ADD COLUMN IF NOT EXISTS date_derniere_mention TIMESTAMP;
```

---

## 🎯 **RÉSULTAT ATTENDU**

**Quand l'agent clique "Approuver Définitivement" :**

1. ✅ Mention ajoutée dans `mentions_apposees`
2. ✅ Acte original marqué avec `a_mention = true`
3. ✅ PDF généré avec la mention en bas
4. ✅ Avis → `approuvee`
5. ✅ Agent peut télécharger le nouveau PDF

---

## ⚠️ **IMPORTANT**

Cette fonctionnalité nécessite :
- ✅ Table `mentions_apposees` créée
- ⏳ Colonnes `a_mention` ajoutées aux tables d'actes
- ⏳ Fonction de génération PDF avec mentions
- ⏳ Modification de `handleApprouver()`

---

**📋 VOULEZ-VOUS QUE JE COMMENCE L'IMPLÉMENTATION ?**

Dites "OUI" et je vais :
1. Créer le script SQL pour ajouter les colonnes
2. Modifier `handleApprouver()`
3. Créer la fonction de génération PDF avec mentions
