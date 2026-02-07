# Permissions

Role-based access control using the shared `@dropit/permissions` package. Permissions are checked server-side by `PermissionsGuard` based on the user's organization role.

## How it works

1. **AuthGuard** (global) validates the session and injects `user` + `session` into the request
2. **PermissionsGuard** (per-route) reads the `@RequirePermissions()` decorator, looks up the user's `Member.role` in the active organization, and checks against the permission definitions from `@dropit/permissions`

The resource name is derived automatically from the controller name (`WorkoutController` -> `workout`).

## Decorators

```typescript
@RequirePermissions('read')            // requires "read" on the resource
@RequirePermissions('read', 'create')  // requires "read" OR "create" (mode OR)
@NoOrganization()                      // skips organization check (authenticated-only action)
```

## Usage

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PermissionsGuard } from '../infrastructure/guards/permissions.guard';
import { RequirePermissions } from '../infrastructure/decorators/permissions.decorator';

@Controller('workouts')
@UseGuards(PermissionsGuard)
export class WorkoutController {

  @Get()
  @RequirePermissions('read')
  getWorkouts() { /* ... */ }

  @Post()
  @RequirePermissions('create')
  createWorkout() { /* ... */ }
}
```

## Roles and permissions

Defined in `@dropit/permissions` and shared between backend and frontend.

| Resource | member | admin | owner |
|----------|--------|-------|-------|
| workout | — | read, create, update, delete | read, create, update, delete |
| workoutCategory | — | read, create, update, delete | read, create, update, delete |
| exercise | — | read, create, update, delete | read, create, update, delete |
| exerciseCategory | — | read, create, update, delete | read, create, update, delete |
| complex | — | read, create, update, delete | read, create, update, delete |
| complexCategory | — | read, create, update, delete | read, create, update, delete |
| athlete | read, create, update, delete | read, create, update, delete | read, create, update, delete |
| session | read | read, create, update, delete | read, create, update, delete |
| personalRecord | read, create | read, create, update, delete | read, create, update, delete |
| trainingSession | read | read, create, update, delete | read, create, update, delete |
| athleteTrainingSession | read, update | read, update | read, update |
| competitorStatus | read | read, create, update | read, create, update |
| invitation | read | read, create, update, delete | read, create, update, delete |

## Error responses

All errors are returned as `403 Forbidden`:

- **User not found in session** — AuthGuard should have caught this, but session is missing
- **User does not belong to an organization** — `activeOrganizationId` is null
- **User is not a member of this organization** — no `Member` record for this user/org pair
- **Access denied** — user's role does not include the required permission
