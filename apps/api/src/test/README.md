# Tests d'Intégration

## Architecture

Les tests d'intégration utilisent les **use cases** de l'architecture clean pour tester la logique métier complète.

## Structure des fichiers

```
test/
├── index.integration.spec.ts     # Point d'entrée principal (Jest orchestrateur)
├── organization.integration.spec.ts   # Setup org + users
├── exercise.integration.spec.ts       # Tests exercices (use cases)
├── complex.integration.spec.ts        # Tests complexes (use cases)
├── workout.integration.spec.ts        # Tests workouts (use cases)
├── utils/
│   ├── test-setup.ts             # Utilitaires de setup + données de test
│   └── test-use-cases.ts         # Factory pour créer les use cases
└── jest-integration.json         # Configuration Jest
```

## Flux d'exécution

1. **`index.integration.spec.ts`** → Orchestrateur Jest principal
2. **`organization.integration.spec.ts`** → Setup base (org + users)
3. **`exercise.integration.spec.ts`** → Tests exercices (use cases)
4. **`complex.integration.spec.ts`** → Tests complexes (use cases)
5. **`workout.integration.spec.ts`** → Tests workouts (use cases)

## Utilisation

### Lancer tous les tests d'intégration avec Docker dédié

```bash
pnpm test:integration:docker
```

## Ce qui est testé

### Organization Tests
- Création d'organisation et utilisateurs de test
- Relations Member entre utilisateurs et organisation
- Rôles admin/member

### Exercise Tests
- CRUD complet des exercices
- Création de catégories d'exercices
- Recherche d'exercices
- Validation des permissions par organisation

### Complex Tests
- CRUD complet des complexes
- Création de catégories de complexes
- Association d'exercices dans les complexes
- Ordre et répétitions des exercices

### Workout Tests
- CRUD complet des workouts
- Création de catégories de workouts
- Éléments de workout (exercices et complexes)
- Paramètres des éléments (sets, reps, rest, poids)

## Approche technique

### Factory pour les Use Cases

```typescript
const factory = new TestUseCaseFactory(orm);
const exerciseUseCase = factory.createExerciseUseCase();
const complexUseCase = factory.createComplexUseCase();
const workoutUseCase = factory.createWorkoutUseCases();
```

### Structure des retours

```typescript
// Succès
{
  status: 200,
  body: { /* données */ }
}

// Erreur
{
  status: 400 | 403 | 404 | 500,
  body: { message: "Message d'erreur" }
}
```

### Pattern de test

```typescript
// Utiliser les use cases
const result = await useCase.create(data, orgId, userId);

// Vérifier le résultat
if (result.status === 200) {
  const data = result.body;
  expect(data).toBeDefined();
} else {
  throw new Error(`Failed: ${result.body.message}`);
}
```

## Configuration

### Base de données de test
- Base de données PostgreSQL dédiée pour les tests
- Nettoyage automatique entre chaque test
- Données de test cohérentes et réutilisables

### Use Cases testés
- **ExerciseUseCase** : CRUD des exercices
- **ComplexUseCase** : CRUD des complexes
- **WorkoutUseCases** : CRUD des workouts
- **OrganizationService** : Gestion des organisations
- **CategoryUseCases** : Gestion des catégories 