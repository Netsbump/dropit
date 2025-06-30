# Tests d'Intégration

## 🎯 Architecture

Cette architecture de tests d'intégration permet d'avoir des tests **isolés** mais **ordonnés** avec des **dépendances explicites**.

### 📁 Structure des fichiers

```
test/
├── index.integration.spec.ts     # 🎯 Point d'entrée principal (Jest orchestrateur)
├── organization.integration.spec.ts   # 🏢 Setup org + users
├── exercise.integration.spec.ts       # 💪 Tests exercices (services directs)
├── complex.integration.spec.ts        # 🔗 Tests complexes (services directs)
├── workout.integration.spec.ts        # 🏋️ Tests workouts (services directs)
├── utils/
│   └── test-setup.ts             # 🛠️ Utilitaires de setup + données de test
└── jest-integration.json         # ⚙️ Configuration Jest
```

### 🔄 Flux d'exécution

1. **`index.integration.spec.ts`** → Orchestrateur Jest principal
2. **`organization.integration.spec.ts`** → Setup base (org + users)
3. **`exercise.integration.spec.ts`** → Tests exercices (services)
4. **`complex.integration.spec.ts`** → Tests complexes (services)
5. **`workout.integration.spec.ts`** → Tests workouts (services)

## 🚀 Utilisation

### Lancer tous les tests d'intégration avec Docker dédié

```bash
pnpm test:integration:docker
```

## ✨ Caractéristiques

### 🔒 **Isolation totale**
- Chaque test nettoie sa propre base de données
- Aucune dépendance entre les fichiers de test
- Chaque test peut être lancé indépendamment

### 📋 **Ordre logique**
- Les tests s'exécutent dans un ordre prédéfini via Jest
- Les dépendances sont explicites et documentées
- Chaque test peut appeler les fonctions de setup des tests précédents

### 🛠️ **Setup automatique**
- Nettoyage automatique de la base de données
- Création automatique des données de test
- Gestion des relations entre entités

### 🔍 **Tests directs des services**
- **Pas d'API HTTP** : Tests directs des services NestJS
- **Plus rapides** : Pas de surcharge HTTP/validation
- **Plus fiables** : Pas de problèmes de routing/guards
- **Plus simples** : Pas de gestion des requêtes HTTP

### 🔍 **Vérifications complètes**
- Tests CRUD complets pour chaque entité
- Vérification des relations entre entités
- Tests de permissions et filtres par organisation

## 🔧 Configuration

### Base de données de test
- Base de données PostgreSQL dédiée pour les tests
- Nettoyage automatique entre chaque test
- Données de test cohérentes et réutilisables

### Services testés
- **ExerciseService** : CRUD des exercices
- **ComplexService** : CRUD des complexes
- **WorkoutService** : CRUD des workouts
- **OrganizationService** : Gestion des organisations
- **CategoryServices** : Gestion des catégories 