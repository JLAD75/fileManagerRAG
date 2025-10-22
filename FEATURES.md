# Fonctionnalités du FileManager RAG

## 📋 Vue d'ensemble

Application de gestion de documents avec intelligence artificielle intégrée permettant de poser des questions sur vos documents uploadés.

## ✨ Fonctionnalités principales

### 1. Gestion des Documents
- **Upload multi-format** : PDF, XLSX, CSV, DOCX, TXT
- **Liste des documents** avec informations détaillées (nom, taille, date)
- **Suppression** de documents
- **Suivi du statut** en temps réel (En cours / Traité)
- **Mise à jour dynamique** : le statut se met à jour automatiquement sans rafraîchir la page

### 2. Chat Intelligent (RAG)
- **Questions/Réponses** basées sur vos documents
- **Contexte enrichi** : l'IA répond uniquement à partir du contenu de vos documents
- **Citations de sources** : chaque réponse affiche les documents sources utilisés

### 3. Visualisation des Sources 📄 **NOUVEAU**
Lorsque l'IA cite un document dans sa réponse, vous pouvez maintenant :

#### Affichage des sources
- **Liste interactive** des documents cités
- **Aperçu du contenu** pertinent (extrait de 200 caractères)
- **Bouton "Voir"** (icône œil) pour ouvrir le document

#### Viewer de documents
- **Ouverture en modal** plein écran
- **Visualisation PDF** directement dans le navigateur
- **Téléchargement** du document depuis le viewer
- Support de tous les types de fichiers uploadés

### 4. Sécurité
- **Authentification JWT** : tous les documents et actions sont sécurisés
- **Isolation des données** : chaque utilisateur accède uniquement à ses propres documents
- **Tokens d'accès** pour toutes les requêtes API

## 🎯 Flux d'utilisation

### Scénario typique :

1. **Connexion** à l'application
2. **Upload** d'un ou plusieurs documents
3. **Attente du traitement** (indicateur de progression visible)
4. **Ouverture du Chat** IA
5. **Question** sur le contenu des documents
6. **Réponse** de l'IA avec sources citées
7. **Clic sur l'icône œil** d'une source
8. **Visualisation** du document en plein écran
9. **Téléchargement** optionnel du document

## 🔧 Détails techniques

### Backend
- **Endpoint `/files/:id/download`** : Sert les fichiers pour visualisation
- **Sources enrichies** : Retourne `fileId`, `fileName`, `content`, `score`
- **Streaming de fichiers** avec en-têtes appropriés

### Frontend
- **Composant `DocumentViewer`** : Modal de visualisation
- **Composant `ChatInterface`** : Affichage enrichi des sources
- **Types TypeScript** : `ChatSource` interface
- **Gestion des blobs** : URL temporaires pour affichage sécurisé

## 📊 Technologies utilisées

### Backend
- Node.js + Express
- TypeScript
- MongoDB (Mongoose)
- LangChain (RAG)
- OpenAI API
- HNSWLib (Vector Store)

### Frontend
- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Axios

## 🚀 Améliorations futures possibles

- [ ] Surlignage du passage exact cité dans le document
- [ ] Navigation entre les sources depuis le viewer
- [ ] Prévisualisation pour XLSX/CSV avec tableaux formatés
- [ ] Annotations et commentaires sur les documents
- [ ] Historique des conversations avec sources sauvegardées
- [ ] Export des conversations en PDF
