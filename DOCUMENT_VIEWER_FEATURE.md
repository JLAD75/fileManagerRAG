# 👁️ Visualisation de Documents - Nouvelle Fonctionnalité

## 📝 Description

Ajout de la fonctionnalité de **visualisation directe des documents** depuis le FileManager, utilisant le même composant `DocumentViewer` que celui du Chat.

---

## ✨ Fonctionnalités

### 🎯 Depuis le FileManager
Les utilisateurs peuvent maintenant :
- ✅ Cliquer sur le bouton **"Voir"** (icône œil) pour chaque fichier
- ✅ Visualiser le document dans une modal plein écran
- ✅ Télécharger le document depuis le viewer
- ✅ Fermer le viewer et revenir à la liste

### 📋 Types de fichiers supportés
- **PDF** : Affichage direct dans un iframe
- **Excel** (.xlsx, .xls, .csv) : Vue tabulaire avec ExcelViewer
- **Word** (.docx) : Rendu HTML avec DocxViewer
- **Texte** (.txt) : Affichage brut dans un iframe
- **Autres** : Message avec bouton de téléchargement

---

## 🔧 Modifications Techniques

### 1. FileManager.tsx
```tsx
// Ajout de l'état pour le document sélectionné
const [selectedDocument, setSelectedDocument] = useState<{
  fileId: string;
  fileName: string;
} | null>(null);

// Fonction pour ouvrir le viewer
const handleView = (fileId: string, fileName: string) => {
  setSelectedDocument({ fileId, fileName });
};

// Import du DocumentViewer
import DocumentViewer from "../Chat/DocumentViewer";

// Ajout du viewer conditionnel
{selectedDocument && (
  <DocumentViewer
    fileId={selectedDocument.fileId}
    fileName={selectedDocument.fileName}
    onClose={() => setSelectedDocument(null)}
  />
)}
```

### 2. FileList.tsx
```tsx
// Ajout du prop onView
interface FileListProps {
  files: FileItem[]
  onDelete: (id: string) => void
  onView: (id: string, fileName: string) => void  // ✅ Nouveau
  loading: boolean
}

// Bouton "Voir" dans la colonne Actions
<button
  onClick={() => onView(file.id, file.originalName)}
  className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 flex items-center gap-1"
  title="Visualiser le document"
>
  <svg><!-- Icône œil --></svg>
  Voir
</button>
```

---

## 🎨 Interface Utilisateur

### Colonne Actions (avant)
```
| Actions    |
|------------|
| Supprimer  |
```

### Colonne Actions (après)
```
| Actions              |
|----------------------|
| 👁️ Voir | Supprimer |
```

### Design
- Bouton **"Voir"** en bleu primary avec icône œil
- Bouton **"Supprimer"** en rouge (inchangé)
- Les deux boutons sont alignés horizontalement avec un gap
- Styles dark mode appliqués automatiquement

---

## 🚀 Utilisation

### Pour l'utilisateur
1. Accéder à **Mes Documents**
2. Trouver un fichier dans la liste
3. Cliquer sur **"Voir"** dans la colonne Actions
4. Le document s'ouvre dans une modal plein écran
5. Options disponibles :
   - Visualiser le contenu (selon le type)
   - Télécharger le fichier
   - Fermer la modal (X ou bouton retour)

### Avantages
- ✅ **Réutilisation de code** : Même composant que dans le Chat
- ✅ **Cohérence UX** : Interface identique partout
- ✅ **Gain de temps** : Pas besoin de télécharger pour consulter
- ✅ **Preview rapide** : Vérification du contenu avant suppression

---

## 🔄 Flux de données

```
FileManager (parent)
    ├── FileList (enfant)
    │   └── Bouton "Voir" → onView(fileId, fileName)
    ├── handleView() → setSelectedDocument({ fileId, fileName })
    └── DocumentViewer (modal conditionnelle)
        ├── Props: fileId, fileName, onClose
        └── Appel API: GET /api/files/${fileId}/download
```

---

## 🎯 Cas d'usage

### Scénario 1 : Vérification avant suppression
> L'utilisateur veut s'assurer qu'un document est le bon avant de le supprimer
1. Clique sur "Voir"
2. Consulte le contenu
3. Ferme le viewer
4. Décide de supprimer ou non

### Scénario 2 : Consultation rapide
> L'utilisateur veut relire un passage d'un document
1. Clique sur "Voir"
2. Lit le contenu
3. Ferme le viewer
4. Pose une question au Chat si nécessaire

### Scénario 3 : Vérification post-upload
> L'utilisateur vient d'uploader un fichier et veut vérifier qu'il est correct
1. Upload terminé
2. Statut passe à "Traité"
3. Clique sur "Voir"
4. Vérifie que le contenu est correct

---

## ✅ Compatibilité

### Dark Mode
- ✅ Bouton "Voir" adapté au mode sombre
- ✅ Modal DocumentViewer avec styles dark
- ✅ Transitions fluides

### Responsive
- ✅ Fonctionne sur desktop
- ✅ Fonctionne sur mobile (modal plein écran)
- ✅ Icônes et textes lisibles sur tous les écrans

### Accessibilité
- ✅ Attribut `title` pour le tooltip
- ✅ Icône + texte pour la clarté
- ✅ Couleurs avec bon contraste

---

## 📊 Statistiques

- **Fichiers modifiés** : 2
  - FileManager.tsx
  - FileList.tsx
- **Lignes ajoutées** : ~40
- **Composants réutilisés** : 1 (DocumentViewer)
- **Nouvelles dépendances** : 0 (réutilisation)

---

## 🐛 Points d'attention

### Performances
- Le DocumentViewer charge le fichier via l'API à chaque ouverture
- Pour les gros fichiers, un loader est affiché
- Le blob URL est nettoyé automatiquement au démontage

### Gestion des erreurs
- Si le fichier n'existe plus : Message d'erreur dans le viewer
- Si problème réseau : Message "Impossible de charger le document"
- Si type non supporté : Bouton de téléchargement proposé

---

## 🔮 Améliorations possibles (futures)

1. **Cache des documents** : Éviter de recharger si déjà vu
2. **Préchargement** : Charger en arrière-plan au survol du bouton
3. **Actions dans le viewer** : Supprimer directement depuis la modal
4. **Partage** : Générer un lien temporaire pour partager
5. **Annotations** : Permettre d'annoter le document (future feature)

---

**Date d'implémentation** : 23 octobre 2025  
**Version** : 1.0 - Document Viewer in FileManager 👁️
