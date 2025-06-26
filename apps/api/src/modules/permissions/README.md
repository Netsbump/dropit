# Système de Permissions

Ce module gère les permissions d'accès aux ressources de l'API en utilisant une source unique de vérité définie dans le package `@dropit/permissions`.

## Architecture

Le système de permissions fonctionne en **deux étapes** :

1. **Authentification** : Vérification de l'identité de l'utilisateur (AuthGuard global)
2. **Autorisation** : Vérification des permissions spécifiques basées sur le rôle d'organisation (PermissionsGuard)

## Composants

### PermissionsGuard

Guard NestJS qui vérifie les permissions de l'utilisateur pour accéder aux routes protégées.

**Fonctionnalités :**
- Vérifie que l'utilisateur appartient à une organisation
- Récupère le rôle de l'utilisateur **au sein de l'organisation** (Member.role)
- Récupère les permissions requises depuis les décorateurs
- Détermine la ressource depuis le nom du controller
- Vérifie les permissions en utilisant les rôles définis dans `@dropit/permissions`

**Important :** Le guard utilise le rôle d'organisation (Member.role) et non le rôle utilisateur (User.role).

### RequirePermissions Decorator

Décorateur pour spécifier les permissions requises pour une route.

**Utilisation :**
```typescript
@RequirePermissions('read')           // Une seule permission
@RequirePermissions('read', 'create') // Plusieurs permissions (mode OR)
```

## Utilisation

### 1. Protection d'un Controller

```typescript
import { Controller, UseGuards } from '@nestjs/common';
import { PermissionsGuard } from '../permissions/permissions.guard';

@Controller('workouts')
@UseGuards(PermissionsGuard)  // ✅ Protège toutes les routes du controller
export class WorkoutController {
  // Routes protégées...
}
```

### 2. Protection d'une Route Spécifique

```typescript
import { Controller } from '@nestjs/common';
import { RequirePermissions } from '../permissions/permissions.decorator';

@Controller('workouts')
export class WorkoutController {
  
  @Get()
  @RequirePermissions('read')  // ✅ Lecture seule
  getWorkouts() {
    // ...
  }

  @Post()
  @RequirePermissions('create')  // ✅ Création
  createWorkout() {
    // ...
  }

  @Put(':id')
  @RequirePermissions('update')  // ✅ Modification
  updateWorkout() {
    // ...
  }

  @Delete(':id')
  @RequirePermissions('delete')  // ✅ Suppression
  deleteWorkout() {
    // ...
  }
}
```

### 3. Routes avec Permissions Multiples

```typescript
@Get('stats')
@RequirePermissions('read', 'admin')  // ✅ Lecture OU rôle admin
getStats() {
  // Accessible si l'utilisateur peut lire OU s'il est admin
}
```

## Permissions Disponibles

Les permissions sont définies dans le package `@dropit/permissions` :

### Ressources Supportées
- `workout` : Gestion des entraînements
- `exercise` : Gestion des exercices
- `complex` : Gestion des complexes
- `athlete` : Gestion des athlètes
- `session` : Gestion des sessions
- `personalRecord` : Gestion des records personnels

### Actions Disponibles
- `read` : Lecture
- `create` : Création
- `update` : Modification
- `delete` : Suppression

## Rôles d'Organisation et Permissions

### Member (Membre)
- **workout** : `read`
- **exercise** : `read`
- **complex** : `read`
- **athlete** : `read`
- **session** : `read`
- **personalRecord** : `read`, `create`

### Admin (Administrateur)
- **workout** : `read`, `create`, `update`, `delete`
- **exercise** : `read`, `create`, `update`, `delete`
- **complex** : `read`, `create`, `update`, `delete`
- **athlete** : `read`, `create`, `update`, `delete`
- **session** : `read`, `create`, `update`, `delete`
- **personalRecord** : `read`, `create`, `update`, `delete`

### Owner (Propriétaire)
- Toutes les permissions sur toutes les ressources

## Détermination de la Ressource

La ressource est automatiquement déterminée à partir du nom du controller :

| Controller | Ressource |
|------------|-----------|
| `WorkoutController` | `workout` |
| `ExerciseController` | `exercise` |
| `ComplexController` | `complex` |
| `AthleteController` | `athlete` |
| `SessionController` | `session` |
| `PersonalRecordController` | `personalrecord` |

## Flux de Vérification des Permissions

1. **Récupération de la session** : Vérification de l'authentification
2. **Vérification de l'organisation** : `session.activeOrganizationId`
3. **Récupération du rôle d'organisation** : Requête DB pour `Member.role`
4. **Vérification des permissions** : Comparaison avec les permissions définies

## Gestion des Erreurs

### Erreurs Possibles

1. **User not found in session**
   - L'utilisateur n'est pas authentifié
   - Solution : Vérifier l'authentification

2. **User does not belong to an organization**
   - L'utilisateur n'appartient à aucune organisation
   - Solution : Assigner l'utilisateur à une organisation

3. **User is not a member of this organization**
   - L'utilisateur n'est pas membre de l'organisation active
   - Solution : Vérifier l'appartenance à l'organisation

4. **Access denied**
   - L'utilisateur n'a pas les permissions requises
   - Solution : Vérifier le rôle d'organisation de l'utilisateur

### Logs

Le guard génère des logs détaillés pour le debugging :

```
🔐 [PermissionsGuard] Checking permissions: {
  user: "user-1",
  organizationId: "org-1",
  resource: "workout",
  requiredPermissions: ["read"],
  organizationRole: "owner",
  endpoint: "GET /workouts"
}

✅ [PermissionsGuard] Access granted for organization role: owner
```

## Tests

Le module inclut des tests unitaires pour vérifier le bon fonctionnement :

```bash
npm run test permissions.guard.spec.ts
```

## Exemple Complet

```typescript
import { Controller, Get, Post, Put, Delete, UseGuards } from '@nestjs/common';
import { RequirePermissions } from '../permissions/permissions.decorator';
import { PermissionsGuard } from '../permissions/permissions.guard';

@Controller('workouts')
@UseGuards(PermissionsGuard)
export class WorkoutController {
  
  @Get()
  @RequirePermissions('read')
  getWorkouts() {
    return this.workoutService.getWorkouts();
  }

  @Get(':id')
  @RequirePermissions('read')
  getWorkout(@Param('id') id: string) {
    return this.workoutService.getWorkout(id);
  }

  @Post()
  @RequirePermissions('create')
  createWorkout(@Body() workout: CreateWorkoutDto) {
    return this.workoutService.createWorkout(workout);
  }

  @Put(':id')
  @RequirePermissions('update')
  updateWorkout(@Param('id') id: string, @Body() workout: UpdateWorkoutDto) {
    return this.workoutService.updateWorkout(id, workout);
  }

  @Delete(':id')
  @RequirePermissions('delete')
  deleteWorkout(@Param('id') id: string) {
    return this.workoutService.deleteWorkout(id);
  }
}
```

## Différence avec Better Auth

### Rôle Utilisateur vs Rôle d'Organisation

- **User.role** : Rôle global de l'utilisateur (ex: 'coach', 'athlete') - **Non utilisé pour les permissions**
- **Member.role** : Rôle au sein de l'organisation (ex: 'owner', 'admin', 'member') - **Utilisé pour les permissions**

### Pourquoi cette approche ?

Avec Better Auth et le plugin organization :
- Un utilisateur peut avoir différents rôles dans différentes organisations
- Les permissions sont basées sur le rôle **au sein de l'organisation active**
- Cela permet une gestion fine des permissions par organisation

## Avantages

✅ **Source unique de vérité** : Les permissions sont définies dans `@dropit/permissions`  
✅ **Cohérence client/serveur** : Même logique côté client et serveur  
✅ **Simple à utiliser** : Juste `@RequirePermissions('read')`  
✅ **Flexible** : Supporte plusieurs permissions (mode OR)  
✅ **Maintenable** : Centralisé et bien documenté  
✅ **Testable** : Tests unitaires inclus  
✅ **Organisation-aware** : Utilise les rôles d'organisation de Better Auth  