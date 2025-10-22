# File Manager RAG - Gestion Intelligente de Documents avec IA

Un système complet de gestion de fichiers augmenté par l'intelligence artificielle, permettant aux utilisateurs de stocker leurs documents et d'interagir avec eux via un agent IA conversationnel utilisant la technologie RAG (Retrieval Augmented Generation).

## Fonctionnalités

### Authentification Sécurisée
- Inscription et connexion des utilisateurs
- Authentification par JWT
- Protection des espaces de travail personnels

### Gestion de Fichiers
- Upload sécurisé de fichiers
- Support de multiples formats: PDF, XLSX, CSV, DOCX, TXT
- Stockage organisé par utilisateur
- Suppression de fichiers
- Suivi du statut de traitement des documents

### Agent IA Conversationnel
- Chat intelligent basé sur vos documents
- Recherche sémantique dans vos fichiers
- Réponses contextuelles avec références aux sources
- Technologie RAG (Retrieval Augmented Generation)
- Powered by OpenAI GPT-4

## Architecture Technique

### Frontend
- **Framework**: Next.js 14 avec App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Heroicons
- **State Management**: React Hooks
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB avec Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Processing**:
  - PDF: pdf-parse
  - Excel: xlsx
  - CSV: csv-parse
  - Word: mammoth
- **AI/ML**:
  - LangChain pour l'orchestration
  - OpenAI pour les embeddings et le chat
  - FAISS pour le vector store

## Installation

### Prérequis
- Node.js 18+ et npm
- MongoDB (local ou Atlas)
- Clé API OpenAI

### 1. Cloner le repository
```bash
git clone <repository-url>
cd fileManagerRAG
```

### 2. Installer les dépendances
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..
```

### 3. Configuration du Backend

Créer un fichier `.env` dans le dossier `backend/`:

```env
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/filemanager-rag

# JWT
JWT_SECRET=votre-secret-jwt-tres-securise
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=votre-cle-api-openai

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Configuration du Frontend

Créer un fichier `.env.local` dans le dossier `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 5. Démarrer MongoDB

Si vous utilisez MongoDB local:
```bash
mongod
```

Ou configurez `MONGODB_URI` pour pointer vers MongoDB Atlas.

### 6. Lancer l'application

#### Option 1: Tout démarrer en une commande (depuis la racine)
```bash
npm run dev
```

#### Option 2: Démarrer séparément

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

L'application sera accessible sur:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Utilisation

### 1. Créer un compte
- Accédez à http://localhost:3000
- Cliquez sur "Inscription"
- Remplissez le formulaire avec vos informations

### 2. Se connecter
- Utilisez vos identifiants pour vous connecter
- Vous serez redirigé vers votre espace de travail

### 3. Uploader des documents
- Glissez-déposez vos fichiers dans la zone prévue
- Ou cliquez pour sélectionner des fichiers
- Les fichiers seront automatiquement traités et indexés

### 4. Interroger vos documents
- Cliquez sur le bouton "Agent IA"
- Posez des questions sur le contenu de vos documents
- L'IA vous répondra en se basant sur vos fichiers
- Les sources utilisées seront affichées avec chaque réponse

## Structure du Projet

```
fileManagerRAG/
├── frontend/                 # Application Next.js
│   ├── app/                 # Pages et layouts (App Router)
│   ├── components/          # Composants React
│   │   ├── Auth/           # Composants d'authentification
│   │   ├── Chat/           # Interface de chat
│   │   ├── FileManager/    # Gestion de fichiers
│   │   └── Layout/         # Composants de layout
│   ├── lib/                # Utilitaires
│   │   ├── api.ts          # Client API
│   │   └── auth.ts         # Gestion auth côté client
│   └── types/              # Types TypeScript
│
├── backend/                 # API Express
│   ├── src/
│   │   ├── config/         # Configuration (DB, etc.)
│   │   ├── controllers/    # Logique métier
│   │   ├── models/         # Modèles MongoDB
│   │   ├── routes/         # Routes API
│   │   ├── middleware/     # Middleware Express
│   │   ├── services/       # Services (AI, processing)
│   │   └── types/          # Types TypeScript
│   └── uploads/            # Fichiers uploadés
│
└── package.json            # Configuration monorepo
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Files
- `POST /api/files/upload` - Upload de fichier (multipart/form-data)
- `GET /api/files` - Liste des fichiers de l'utilisateur
- `DELETE /api/files/:id` - Suppression d'un fichier

### Chat
- `POST /api/chat` - Envoyer un message à l'agent IA

## Technologies Clés

### RAG (Retrieval Augmented Generation)
Le système utilise la technique RAG pour permettre à l'IA de répondre aux questions:

1. **Extraction**: Les documents sont traités et leur texte extrait
2. **Chunking**: Le texte est divisé en morceaux gérables
3. **Embedding**: Chaque morceau est converti en vecteur via OpenAI Embeddings
4. **Indexation**: Les vecteurs sont stockés dans FAISS pour une recherche rapide
5. **Retrieval**: Lors d'une question, les morceaux les plus pertinents sont récupérés
6. **Generation**: GPT-4 génère une réponse basée sur le contexte récupéré

### Sécurité
- Authentification JWT avec expiration
- Hachage des mots de passe avec bcrypt
- Validation des types de fichiers
- Limite de taille des fichiers
- Isolation des données par utilisateur
- CORS configuré

## Scripts Disponibles

### Racine
- `npm run dev` - Démarre frontend et backend
- `npm run build` - Build frontend et backend
- `npm run start` - Démarre en mode production

### Frontend
- `npm run dev` - Mode développement
- `npm run build` - Build production
- `npm run start` - Serveur production
- `npm run lint` - Lint du code

### Backend
- `npm run dev` - Mode développement avec nodemon
- `npm run build` - Compile TypeScript
- `npm run start` - Démarre le serveur compilé

## Améliorations Futures

- [ ] Support de plus de formats (images avec OCR, audio, vidéo)
- [ ] Système de dossiers et organisation
- [ ] Partage de documents entre utilisateurs
- [ ] Historique des conversations
- [ ] Export des conversations
- [ ] Amélioration de la recherche sémantique
- [ ] Support multilingue
- [ ] Mode hors ligne
- [ ] Tests unitaires et d'intégration
- [ ] CI/CD Pipeline

## Contribution

Les contributions sont les bienvenues! N'hésitez pas à ouvrir des issues ou des pull requests.

## Licence

MIT

## Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.
