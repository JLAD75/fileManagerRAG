# Mode Sombre (Dark Mode) - Documentation

## 🌓 Vue d'ensemble

Implémentation complète d'un mode sombre avec :

- ✅ Persistance dans la base de données (préférence utilisateur)
- ✅ Fallback localStorage pour les non-connectés
- ✅ Toggle animé soleil/lune dans la Navbar
- ✅ Transitions fluides entre les modes
- ✅ Configuration Tailwind CSS avec `dark:` classes

---

## 🏗️ Architecture

### Backend

#### **1. Modèle User** (`backend/src/models/User.ts`)

```typescript
interface IUser extends Document {
  name: string
  email: string
  password: string
  theme: 'light' | 'dark'  // ✅ Nouveau champ
  createdAt: Date
}
```

**Schéma MongoDB** :

```typescript
theme: {
  type: String,
  enum: ['light', 'dark'],
  default: 'light',
}
```

#### **2. Endpoint API** (`backend/src/controllers/authController.ts`)

**PUT /api/auth/theme**

```typescript
export const updateTheme = async (req: AuthRequest, res: Response) => {
  const { theme } = req.body;
  // Validation: 'light' ou 'dark'
  // Mise à jour dans MongoDB
  // Retour du thème sauvegardé
}
```

**Login enrichi** :

```typescript
res.json({
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    theme: user.theme || 'light',  // ✅ Inclus dans la réponse
    createdAt: user.createdAt,
  },
});
```

#### **3. Route** (`backend/src/routes/authRoutes.ts`)

```typescript
router.put('/theme', authenticateToken, updateTheme)
```

---

### Frontend

#### **1. ThemeContext** (`frontend/context/ThemeContext.tsx`)

**Provider React** avec :

- État global du thème
- Fonction `toggleTheme()` pour basculer
- Fonction `setTheme()` pour définir explicitement
- Sauvegarde automatique dans localStorage
- Appel API pour sauvegarder dans la DB si authentifié

```typescript
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}
```

**Fonctionnalités** :

- ✅ Lecture localStorage au montage
- ✅ Application de la classe `dark` sur `<html>`
- ✅ Sauvegarde automatique backend si token présent
- ✅ Prévention du flash (FOUC - Flash Of Unstyled Content)

#### **2. Layout global** (`frontend/app/layout.tsx`)

```tsx
<html lang="fr" suppressHydrationWarning>
  <body>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </body>
</html>
```

#### **3. Navbar avec toggle** (`frontend/components/Layout/Navbar.tsx`)

**Bouton de bascule** :

```tsx
<button onClick={toggleTheme}>
  {theme === 'light' ? (
    <svg><!-- Icône lune --></svg>
  ) : (
    <svg><!-- Icône soleil --></svg>
  )}
</button>
```

**Classes dark appliquées** :

- `bg-white dark:bg-gray-900`
- `text-gray-900 dark:text-white`
- `border-gray-200 dark:border-gray-700`

---

## 🎨 Configuration CSS

### **1. Tailwind Config** (`tailwind.config.ts`)

```typescript
const config: Config = {
  darkMode: 'class',  // ✅ Mode basé sur la classe 'dark'
  // ... rest of config
}
```

### **2. Variables CSS** (`globals.css`)

```css
:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 249, 250, 251;
  --background-end-rgb: 255, 255, 255;
}

.dark {
  --foreground-rgb: 255, 255, 255;
  --background-start-rgb: 17, 24, 39;
  --background-end-rgb: 31, 41, 55;
}

/* Transitions fluides */
* {
  transition-property: background-color, border-color, color;
  transition-duration: 200ms;
}
```

---

## 🎯 Utilisation dans les composants

### Pattern de base

Pour tout composant, ajoutez les classes `dark:` :

```tsx
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-white
  border-gray-200 dark:border-gray-700
">
  Contenu
</div>
```

### Exemples de classes courantes

| Élément | Light | Dark |
|---------|-------|------|
| **Background principal** | `bg-white` | `dark:bg-gray-900` |
| **Background secondaire** | `bg-gray-50` | `dark:bg-gray-800` |
| **Texte principal** | `text-gray-900` | `dark:text-white` |
| **Texte secondaire** | `text-gray-700` | `dark:text-gray-300` |
| **Bordures** | `border-gray-200` | `dark:border-gray-700` |
| **Hover background** | `hover:bg-gray-100` | `dark:hover:bg-gray-800` |
| **Input** | `bg-white border-gray-300` | `dark:bg-gray-800 dark:border-gray-600` |

---

## 📝 Composants à mettre à jour

### ✅ Déjà mis à jour

- **Navbar** : Toggle + classes dark
- **Layout** : ThemeProvider intégré
- **Globals.css** : Variables et transitions

### 🔄 À mettre à jour (pattern fourni ci-dessous)

#### **FileManager** (`components/FileManager/FileManager.tsx`)

```tsx
<div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6">
  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
    Gestionnaire de fichiers
  </h2>
  {/* ... */}
</div>
```

#### **FileList** (`components/FileManager/FileList.tsx`)

```tsx
<div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 hover:bg-gray-100 dark:hover:bg-gray-700">
  <p className="font-medium text-gray-900 dark:text-white">
    {file.originalName}
  </p>
  <p className="text-sm text-gray-500 dark:text-gray-400">
    {formatFileSize(file.size)}
  </p>
</div>
```

#### **ChatInterface** (`components/Chat/ChatInterface.tsx`)

```tsx
<div className="flex flex-col h-full bg-white dark:bg-gray-900">
  <div className="border-b border-gray-200 dark:border-gray-700 p-4">
    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
      Agent IA
    </h2>
  </div>
  
  {/* Messages */}
  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
    {/* User message */}
    <div className="flex justify-end">
      <div className="bg-primary-600 dark:bg-primary-500 text-white rounded-lg p-3 max-w-[70%]">
        {message.content}
      </div>
    </div>
    
    {/* AI message */}
    <div className="flex justify-start">
      <div className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-3 max-w-[70%] shadow">
        {message.content}
      </div>
    </div>
  </div>
  
  {/* Input */}
  <div className="border-t border-gray-200 dark:border-gray-700 p-4">
    <input
      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                 focus:outline-none focus:ring-2 focus:ring-primary-500"
      placeholder="Posez votre question..."
    />
  </div>
</div>
```

#### **Login/Register** (`components/Auth/*.tsx`)

```tsx
<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
  <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      Connexion
    </h2>
    
    <input
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                 focus:outline-none focus:ring-2 focus:ring-primary-500"
      placeholder="Email"
    />
    
    <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-md">
      Se connecter
    </button>
  </div>
</div>
```

#### **DocumentViewer** (`components/Chat/DocumentViewer.tsx`)

```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-11/12 h-5/6 flex flex-col">
    <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {fileName}
      </h3>
      <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
        ✕
      </button>
    </div>
    {/* Content */}
  </div>
</div>
```

---

## 🔄 Flux d'authentification avec thème

### 1. Login

```
User logs in
  ↓
Backend returns { user: { theme: 'dark' } }
  ↓
Frontend saves theme to localStorage
  ↓
ThemeContext applies theme
  ↓
document.documentElement.classList.add('dark')
```

### 2. Toggle pendant la session

```
User clicks toggle button
  ↓
ThemeContext updates state
  ↓
Saves to localStorage
  ↓
Calls PUT /api/auth/theme (background)
  ↓
Updates MongoDB
  ↓
UI reflects change immediately
```

### 3. Rechargement de page

```
Page loads
  ↓
ThemeContext reads localStorage
  ↓
Applies theme before render (prevents flash)
  ↓
User sees correct theme instantly
```

---

## 🎨 Palette de couleurs recommandée

### Light Mode

- Background: `bg-white`, `bg-gray-50`
- Text: `text-gray-900`, `text-gray-700`
- Borders: `border-gray-200`, `border-gray-300`
- Hover: `hover:bg-gray-100`

### Dark Mode

- Background: `dark:bg-gray-900`, `dark:bg-gray-800`
- Text: `dark:text-white`, `dark:text-gray-300`
- Borders: `dark:border-gray-700`, `dark:border-gray-600`
- Hover: `dark:hover:bg-gray-700`

### Buttons

- Primary: `bg-primary-600 hover:bg-primary-700` (fonctionne dans les 2 modes)
- Secondary: `bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600`

---

## ⚡ Optimisations

### 1. Prévention du flash (FOUC)

```tsx
// layout.tsx
<html lang="fr" suppressHydrationWarning>
```

```tsx
// ThemeContext.tsx
if (!mounted) {
  return null; // Attend le montage côté client
}
```

### 2. Transitions fluides

```css
/* globals.css */
* {
  transition-property: background-color, border-color, color;
  transition-duration: 200ms;
}
```

### 3. Persistence multicouche

- **localStorage** : Rapide, disponible immédiatement
- **MongoDB** : Persistance long terme, synchronisé entre appareils

---

## 🧪 Tests recommandés

1. **Basculer le thème** : Cliquer sur l'icône soleil/lune
   - ✅ L'UI change instantanément
   - ✅ Le changement persiste au refresh
   - ✅ Aucun flash blanc/noir

2. **Login avec thème sauvegardé** : Se connecter avec compte ayant `theme: 'dark'`
   - ✅ Le thème dark s'applique automatiquement

3. **Navigation entre pages** : Naviguer dans l'app
   - ✅ Le thème reste cohérent partout

4. **Logout/Login** : Se déconnecter puis reconnecter
   - ✅ Le thème de l'utilisateur est restauré

---

## 🐛 Troubleshooting

### Le thème ne s'applique pas

- Vérifier que `darkMode: 'class'` est dans `tailwind.config.ts`
- Vérifier que les classes `dark:` sont bien écrites
- Inspecter que `<html class="dark">` est présent en mode sombre

### Flash blanc au chargement

- Ajouter `suppressHydrationWarning` sur `<html>`
- S'assurer que ThemeProvider ne rend pas pendant `!mounted`

### Le thème ne persiste pas

- Vérifier que l'endpoint `/api/auth/theme` fonctionne
- Vérifier que le token JWT est valide
- Vérifier localStorage dans DevTools

---

## 📊 État actuel

| Composant | Status | Notes |
|-----------|--------|-------|
| **Backend** | ✅ Complet | Modèle User + endpoint API |
| **ThemeContext** | ✅ Complet | Provider React fonctionnel |
| **Layout** | ✅ Intégré | ThemeProvider wrappé |
| **Navbar** | ✅ Complet | Toggle animé + classes dark |
| **Tailwind** | ✅ Configuré | darkMode: 'class' |
| **CSS Variables** | ✅ Configuré | Transitions fluides |
| **FileManager** | ⏳ À faire | Pattern fourni |
| **ChatInterface** | ⏳ À faire | Pattern fourni |
| **Auth pages** | ⏳ À faire | Pattern fourni |
| **DocumentViewer** | ⏳ À faire | Pattern fourni |

---

## 🚀 Prochaines étapes

### Pour compléter l'implémentation

1. **Appliquer les classes dark aux composants restants**
   - Utiliser les patterns fournis ci-dessus
   - Rechercher tous les `className=` avec `bg-`, `text-`, `border-`
   - Ajouter les variantes `dark:` correspondantes

2. **Tester l'expérience utilisateur**
   - Vérifier chaque page en mode light et dark
   - Valider les contrastes et la lisibilité
   - Ajuster les couleurs si nécessaire

3. **Optimisations possibles**
   - Ajouter `prefers-color-scheme` pour détection automatique du système
   - Créer un composant `<ThemeToggle>` réutilisable
   - Ajouter des animations sur le toggle (rotation soleil/lune)

---

**Date de création** : 23 octobre 2025  
**Version** : 1.0 - Dark Mode Implementation
