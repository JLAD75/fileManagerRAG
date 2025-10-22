# Sélection de modèle LLM

## 🤖 Fonctionnalité

L'application permet maintenant de choisir dynamiquement le modèle OpenAI à utiliser pour les conversations avec l'IA.

## 📋 Modèles disponibles

### **GPT-4o** (Recommandé)
- **ID**: `gpt-4o`
- **Description**: Le plus récent et performant
- **Contexte**: 128,000 tokens
- **Usage**: Tâches complexes nécessitant le plus haut niveau de compréhension

### **GPT-4o Mini** (Par défaut)
- **ID**: `gpt-4o-mini`
- **Description**: Rapide et économique
- **Contexte**: 128,000 tokens
- **Usage**: Équilibre parfait entre performance et coût

### **GPT-4 Turbo**
- **ID**: `gpt-4-turbo`
- **Description**: Puissant avec large contexte
- **Contexte**: 128,000 tokens
- **Usage**: Analyse de documents volumineux

### **GPT-4**
- **ID**: `gpt-4`
- **Description**: Modèle classique GPT-4
- **Contexte**: 8,192 tokens
- **Usage**: Tâches standard nécessitant une haute qualité

### **GPT-3.5 Turbo**
- **ID**: `gpt-3.5-turbo`
- **Description**: Économique et rapide
- **Contexte**: 16,385 tokens
- **Usage**: Requêtes simples et rapides

## 🎯 Utilisation

### Interface utilisateur

1. **Ouvrir le chat** IA
2. **Sélectionner le modèle** dans le menu déroulant en haut
3. **Poser votre question** normalement
4. Le modèle sélectionné sera utilisé pour cette conversation

### Caractéristiques

- ✅ **Changement dynamique** : Possibilité de changer de modèle à tout moment
- ✅ **Persistance de session** : Le modèle choisi reste sélectionné pendant la session
- ✅ **Information claire** : Nom et description de chaque modèle
- ✅ **Fallback intelligent** : Si aucun modèle n'est spécifié, utilise GPT-4o Mini par défaut

## 🔧 Implémentation technique

### Backend

#### Endpoint GET `/api/chat/models`
Retourne la liste des modèles disponibles :
```json
{
  "models": [
    {
      "id": "gpt-4o",
      "name": "GPT-4o",
      "description": "Le plus récent et performant",
      "contextWindow": 128000
    },
    // ... autres modèles
  ]
}
```

#### Endpoint POST `/api/chat`
Accepte maintenant un paramètre optionnel `model` :
```json
{
  "message": "Votre question",
  "model": "gpt-4o"  // Optionnel
}
```

### Frontend

#### Composants modifiés
- `ChatInterface.tsx` : Ajout du sélecteur de modèle
- Types ajoutés : `LLMModel`, `ModelsResponse`
- État local pour le modèle sélectionné

#### Flux de données
1. Chargement des modèles au montage du composant
2. Sélection par l'utilisateur via `<select>`
3. Envoi du modèle choisi avec chaque message
4. Le backend utilise le modèle spécifié pour générer la réponse

## 💡 Conseils d'utilisation

### Quand utiliser GPT-4o ?
- Questions complexes nécessitant un raisonnement avancé
- Analyse détaillée de documents techniques
- Synthèse de grandes quantités d'informations

### Quand utiliser GPT-4o Mini ?
- Usage quotidien général ✅ **RECOMMANDÉ**
- Questions simples à modérées
- Bon équilibre coût/performance

### Quand utiliser GPT-3.5 Turbo ?
- Tests rapides
- Questions très simples
- Budget limité

## 🚀 Avantages

1. **Flexibilité** : Adaptez le modèle à vos besoins
2. **Coût optimisé** : Utilisez un modèle moins cher pour les requêtes simples
3. **Performance** : Choisissez le modèle le plus puissant pour les tâches complexes
4. **Transparence** : Voyez clairement quel modèle vous utilisez

## 📊 Comparaison rapide

| Modèle | Performance | Vitesse | Coût | Contexte |
|--------|------------|---------|------|----------|
| GPT-4o | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 💰💰💰 | 128K |
| GPT-4o Mini | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 💰 | 128K |
| GPT-4 Turbo | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 💰💰💰 | 128K |
| GPT-4 | ⭐⭐⭐⭐ | ⭐⭐⭐ | 💰💰💰 | 8K |
| GPT-3.5 Turbo | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 💰 | 16K |

## 🔮 Améliorations futures possibles

- [ ] Sauvegarde de la préférence de modèle dans le localStorage
- [ ] Affichage du coût estimé par modèle
- [ ] Statistiques d'utilisation par modèle
- [ ] Suggestions automatiques de modèle selon le type de question
- [ ] Support d'autres fournisseurs (Anthropic, etc.)
