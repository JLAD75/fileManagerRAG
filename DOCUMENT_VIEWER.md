# Viewer de Documents - Supports de fichiers

## 📊 Types de fichiers supportés

### ✅ Prévisualisation complète

#### 1. **PDF (.pdf)**
- Affichage natif dans le navigateur
- Navigation intégrée
- Zoom et recherche disponibles

#### 2. **Excel (.xlsx, .xls, .csv)** 🆕
- Affichage tabulaire avec colonnes et lignes
- Support multi-feuilles avec onglets
- Défilement horizontal et vertical
- Compteur de lignes/colonnes
- Mise en forme responsive

#### 3. **Texte (.txt)**

- Affichage simple en iframe
- Lecture directe du contenu

#### 4. **Word (.docx)** 🆕

- Conversion DOCX → HTML avec Mammoth.js
- Affichage avec mise en forme (titres, gras, italique, listes)
- Support des tableaux
- Préservation des styles Word
- Rendu similaire à Word

### ⬇️ Téléchargement uniquement

Aucun ! Tous les formats supportés ont maintenant une prévisualisation.

## 🎨 Fonctionnalités du viewer Excel

### Interface

- **En-tête** : Nom du fichier + bouton télécharger + fermeture
- **Onglets** : Navigation entre les feuilles (si plusieurs)
- **Tableau** : Affichage avec en-têtes fixes et lignes alternées
- **Pied de page** : Informations sur le nombre de lignes et colonnes

### Caractéristiques

- ✨ Design moderne avec Tailwind CSS
- 📱 Responsive et adaptatif
- 🔄 Loading state pendant le chargement
- ⚠️ Gestion des erreurs
- 🎯 Survol des lignes pour meilleure lisibilité
- 📊 Gestion des cellules vides

### Technologies

- **SheetJS (xlsx)** : Lecture et parsing des fichiers Excel
- Gestion de tous les formats : `.xlsx`, `.xls`, `.csv`
- Conversion en tableaux HTML pour affichage

## 📝 Fonctionnalités du viewer Word

### Conversion intelligente

- **Mammoth.js** : Conversion DOCX vers HTML
- Préservation de la mise en forme
- Support complet de la structure

### Éléments supportés

- **Titres** : H1, H2, H3, H4 avec styles
- **Formatage** : Gras, italique, souligné
- **Listes** : Puces et numérotées
- **Tableaux** : Bordures et cellules
- **Citations** : Blockquotes stylisés
- **Liens** : Hyperliens cliquables
- **Images** : Affichage responsive

### Mise en page

- Police Calibri (style Word)
- Justification du texte
- Espacement ligne/paragraphe cohérent
- Maximum 4xl pour une lecture optimale
- Padding et marges ajustés

## 🚀 Utilisation

1. **Cliquer sur l'icône œil** d'une source dans le chat
2. **Le viewer s'ouvre** avec le document
3. **Pour Excel** :
   - Voir toutes les feuilles via les onglets
   - Faire défiler horizontalement/verticalement
   - Les en-têtes restent fixes lors du défilement
4. **Pour Word** :
   - Lecture comme dans Word avec la mise en forme
   - Défilement vertical pour lire tout le document
5. **Télécharger** si besoin via le bouton en haut

## 💡 Améliorations futures possibles

- [ ] Filtrage et tri des colonnes Excel
- [ ] Export CSV des feuilles Excel
- [ ] Recherche dans les cellules
- [ ] Formatage des nombres et dates
- [ ] Support des formules Excel
- [ ] Coloration conditionnelle
- [ ] Graphiques Excel (charts)
- [ ] Support Word avec conversion HTML
