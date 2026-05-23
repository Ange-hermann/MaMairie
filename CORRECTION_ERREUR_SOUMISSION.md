# ✅ CORRECTION - ERREUR DE SOUMISSION

## ❌ **ERREUR**

```
Could not find the 'commune_id' column of 'requests' in the schema cache
```

---

## 🔍 **CAUSE**

Le code essayait d'insérer des colonnes qui n'existent pas dans la table `requests` :
- `commune_id`
- `village_id`
- `sous_prefecture_id`
- `localisation_complete`

---

## ✅ **CORRECTION APPLIQUÉE**

**Fichier :** `/app/demande-extrait/page.tsx` - Lignes 265-269

**Supprimé :**
```typescript
// Données géographiques (SUPPRIMÉ)
commune_id: localisation.commune_id || null,
village_id: localisation.village_id || null,
sous_prefecture_id: localisation.sous_prefecture_id || null,
localisation_complete: localisation.commune_id ? formatGeoSelection(localisation) : null,
```

**Maintenant le code insère uniquement :**
```typescript
{
  user_id: user.id,
  type_acte: typeActe,
  numero_acte: formData.numero_acte,
  nom: formData.nom,
  prenom: formData.prenom,
  telephone: formData.telephone,
  mairie_id: formData.mairie_id,
  document_url: documentUrl,
  document_name: documentName,
  statut: 'en_attente',
  // + champs spécifiques selon le type
}
```

---

## 🎯 **RÉSULTAT**

La soumission devrait maintenant fonctionner !

---

## 🔄 **POUR TESTER**

1. **Rafraîchissez la page** (F5)
2. Remplissez le formulaire
3. Uploadez le document
4. Sélectionnez une mairie
5. Cliquez sur "Soumettre la Demande"
6. ✅ La demande devrait être créée !

---

## 📊 **VÉRIFICATION**

Après soumission, vous devriez voir :
```
✅ Demande soumise avec succès!
```

Et être redirigé vers `/mes-demandes`

---

**🎉 RAFRAÎCHISSEZ LA PAGE ET RÉESSAYEZ ! ÇA DEVRAIT FONCTIONNER ! ✅**
