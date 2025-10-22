# Optimisation du système RAG

## 🎯 Objectif
Améliorer la précision et la pertinence des réponses de l'IA en exploitant pleinement les capacités des modèles GPT modernes (GPT-4o, GPT-5).

## ✅ Optimisations implémentées

### 1. **Contexte dynamique adapté au modèle**
**Fichier**: `backend/src/services/chatService.ts`

```typescript
// Calcul dynamique basé sur les capacités du modèle
- GPT-5: 400,000 tokens → ~800,000 caractères de contexte (50% réservé)
- GPT-4o/Turbo: 128,000 tokens → ~256,000 caractères de contexte
- GPT-4: 8,192 tokens → ~16,384 caractères de contexte
- GPT-3.5 Turbo: 16,385 tokens → ~32,770 caractères de contexte
```

**Avant**: Limite fixe de 8,000 caractères pour tous les modèles
**Après**: Limite adaptative exploitant 50% de la capacité du modèle

**Impact**: Les modèles modernes peuvent désormais traiter 30-100x plus de contexte !

---

### 2. **Augmentation du nombre de chunks récupérés**
**Fichier**: `backend/src/controllers/chatController.ts`

```typescript
// Recherche de similarité étendue
await getVectorStore().similaritySearch(message, userId, 10)
```

**Avant**: 3 chunks maximum
**Après**: 10 chunks maximum

**Impact**: Plus de contexte pertinent envoyé à l'IA, meilleure couverture du document

---

### 3. **Chunking optimisé avec overlap augmenté**
**Fichier**: `backend/src/services/documentProcessor.ts`

```typescript
chunkSize = 600 mots  (au lieu de 1000)
overlap = 300 mots    (au lieu de 200)
```

**Avant**: Chunks de 1000 mots avec 200 mots de chevauchement (20%)
**Après**: Chunks de 600 mots avec 300 mots de chevauchement (50%)

**Impact**: 
- Meilleure granularité : un titre/section n'est plus noyé dans un gros chunk
- Meilleure préservation du contexte : 50% de chevauchement assure la continuité

---

### 4. **Chunking sémantique préservant la structure**
**Fichier**: `backend/src/services/documentProcessor.ts`

**Nouvelle logique**:
1. Découpage initial par **paragraphes** (double saut de ligne)
2. Les paragraphes sont regroupés intelligemment pour respecter la taille de chunk
3. Les paragraphes trop longs sont subdivisés avec overlap
4. Préservation de la structure naturelle du document

**Avant**: Découpage brutal en comptant les mots, peu importe la structure
**Après**: Découpage respectant les paragraphes et sections

**Impact**: 
- Les titres restent avec leur contenu
- Les sections cohérentes ne sont pas coupées au milieu
- Meilleure compréhension du contexte par l'IA

---

### 5. **Reranking par pertinence des mots-clés**
**Fichier**: `backend/src/controllers/chatController.ts`

**Nouvelle étape de traitement**:
```typescript
1. Recherche vectorielle → 10 chunks candidats
2. Extraction des mots-clés de la question (> 3 lettres)
3. Calcul du score : nombre d'occurrences de chaque mot-clé dans chaque chunk
4. Tri par score décroissant
5. Envoi des chunks les plus pertinents à l'IA
```

**Avant**: Seule la similarité vectorielle (embeddings) était utilisée
**Après**: Combinaison de similarité vectorielle + pertinence par mots-clés

**Impact**: 
- Les chunks contenant explicitement les termes de la question sont priorisés
- Réduit les faux positifs de la recherche vectorielle pure
- Améliore la précision des réponses

---

## 📊 Comparaison Avant/Après

| Métrique | Avant | Après | Amélioration |
|----------|-------|-------|--------------|
| **Contexte max (GPT-4o)** | 8,000 chars | 256,000 chars | **32x** |
| **Contexte max (GPT-5)** | 8,000 chars | 800,000 chars | **100x** |
| **Chunks récupérés** | 3 | 10 | **3.3x** |
| **Granularité** | 1000 mots/chunk | 600 mots/chunk | **+40%** |
| **Overlap** | 20% | 50% | **+150%** |
| **Préservation structure** | ❌ Non | ✅ Oui | ✨ |
| **Reranking** | ❌ Non | ✅ Oui | ✨ |

---

## 🔧 Exemple concret

### Votre cas d'usage : PDF avec section "La voie professionnelle"

**Problème initial**:
- Question: "Le document évoque la voie professionnelle, tu peux m'en dire plus ?"
- Réponse: "Il n'y a aucune information relative à la voie professionnelle"

**Pourquoi ?**
1. Le titre était dans un chunk de 1000 mots avec beaucoup d'autres infos
2. Seuls 3 chunks étaient récupérés, probablement pas celui avec le titre
3. Pas de reranking pour prioriser les chunks avec "voie professionnelle"

**Avec les optimisations**:
1. ✅ Chunks de 600 mots → le titre a plus de chances d'être avec son contenu
2. ✅ Découpage par paragraphes → le titre reste avec sa section
3. ✅ 10 chunks récupérés → plus de couverture du document
4. ✅ Reranking → les chunks contenant "voie" et "professionnelle" sont priorisés
5. ✅ Plus de contexte envoyé à l'IA → GPT-4o peut traiter 256k chars au lieu de 8k

**Résultat attendu**: L'IA trouvera et citera correctement la section sur la voie professionnelle !

---

## 🚀 Prochaines améliorations possibles

Si vous voulez aller encore plus loin :

1. **Extraction de titres**: Détecter automatiquement les titres (majuscules, mots-clés, position) et les inclure dans les métadonnées
2. **Embeddings hybrides**: Combiner embeddings sémantiques + BM25 (recherche TF-IDF)
3. **Chunking récursif**: Découper par chapitres → sections → paragraphes de manière hiérarchique
4. **Cache de requêtes**: Mémoriser les questions fréquentes pour accélérer les réponses
5. **Feedback loop**: Permettre à l'utilisateur d'indiquer si la réponse était pertinente pour améliorer le système

---

## 📝 Notes importantes

### Performance
- Les nouveaux paramètres peuvent générer plus de chunks (limite portée à 1000 au lieu de 500)
- Les modèles avec plus de contexte coûtent plus cher en tokens
- Le reranking ajoute un léger délai de calcul (~50-100ms)

### Recommandations
- **Pour documents courts** (< 10 pages): Utilisez GPT-4o-mini (économique)
- **Pour documents complexes** (> 50 pages): Utilisez GPT-4o ou GPT-5 (plus de contexte)
- **Pour questions spécifiques**: Le reranking est particulièrement efficace
- **Pour questions générales**: La recherche vectorielle seule suffit

### Limites
- Les très gros documents (> 1 MB) sont toujours tronqués pour éviter les problèmes de mémoire
- Le système ne peut pas "comprendre" des images ou graphiques dans les PDF
- Les tableaux complexes peuvent être mal formatés lors de l'extraction

---

## 🧪 Test recommandé

1. **Re-uploadez votre PDF** sur la voie professionnelle (pour que le nouveau chunking soit appliqué)
2. Sélectionnez **GPT-4o** dans le dropdown (pour profiter du grand contexte)
3. Posez la même question : "Le document évoque la voie professionnelle, tu peux m'en dire plus ?"
4. Comparez la réponse !

---

**Date de dernière mise à jour**: 23 octobre 2025
**Version du système RAG**: 2.0
