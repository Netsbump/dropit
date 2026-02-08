# Auth Module

Handles authentication, identity management, and organization-based permissions using [better-auth](https://www.better-auth.com/docs/introduction).

## Structure

```
auth/
├── application/
│   ├── ports/
│   │   ├── inbound/                       # What other modules call
│   │   │   ├── user-use-cases.port.ts
│   │   │   ├── organization-use-cases.port.ts
│   │   │   └── member-use-cases.port.ts
│   │   └── outbound/                      # What use cases depend on
│   │       ├── user.repository.port.ts
│   │       ├── organization.repository.port.ts
│   │       └── member.repository.port.ts
│   ├── use-cases/
│   │   ├── user.use-cases.ts
│   │   ├── organization.use-cases.ts
│   │   └── member.use-cases.ts
│   └── exceptions/
│       └── user.exceptions.ts
├── domain/
│   ├── auth/
│   │   ├── user.entity.ts                 # Better-auth user (+ admin plugin: role, banned, etc.)
│   │   ├── session.entity.ts              # Better-auth session (+ impersonatedBy, admin plugin)
│   │   ├── account.entity.ts              # OAuth accounts
│   │   └── verification.entity.ts         # Email verification tokens
│   └── organization/
│       ├── organization.entity.ts
│       ├── member.entity.ts               # User <-> Organization link (with role)
│       └── invitation.entity.ts
├── infrastructure/
│   ├── better-auth.adapter.ts             # Initializes better-auth, exposes auth & api
│   ├── decorators/
│   │   ├── auth.decorator.ts              # @Public, @Optional, @Session, @CurrentUser
│   │   ├── organization.decorator.ts      # @CurrentOrganization
│   │   └── permissions.decorator.ts       # @RequirePermissions, @NoOrganization
│   ├── guards/
│   │   ├── auth.guard.ts                  # Global guard: validates session
│   │   └── permissions.guard.ts           # Route guard: checks organization role
│   └── orm/
│       ├── mikro-user.repository.ts
│       ├── mikro-organization.repository.ts
│       └── mikro-member.repository.ts
├── interface/
│   ├── controllers/
│   │   └── user.controller.ts
│   ├── mappers/
│   │   └── user.mapper.ts
│   └── presenters/
│       └── user.presenter.ts
├── auth.module.ts                         # NestJS module wiring + middleware
└── better-auth.config.ts                  # Static better-auth configuration
```

## How it works

### Better-auth integration

Better-auth handles all authentication logic (signup, login, sessions, email verification, password reset, organization management). The module integrates it in two parts:

- **`better-auth.config.ts`** contains the static configuration (secret, cookies, database, rate limiting, plugins). It is a pure function that receives callbacks as parameters.

- **`BetterAuthAdapter`** is the NestJS adapter that initializes better-auth at startup and injects application-layer dependencies (EntityManager, NotificationUseCases) into the config callbacks.

### Middleware

`AuthModule.configure()` registers better-auth as HTTP middleware on all `/auth/*` routes. Better-auth handles its own request parsing and response for these routes (signup, login, session, organization invites, etc.).

Note: the body parser is skipped for `/auth/*` routes in `main.ts` because better-auth needs to parse the raw body itself.

### Guards

**AuthGuard** (global, registered as `APP_GUARD`):
- Runs on every request
- Calls `betterAuthAdapter.api.getSession()` to validate the session
- Injects `session` and `user` into the request object
- Routes marked `@Public()` skip authentication
- Routes marked `@Optional()` allow unauthenticated access

**PermissionsGuard** (per-route, used with `@UseGuards`):
- Checks the user's organization role against `@RequirePermissions()`
- Uses `permissions.config.ts` for role definitions (2 org roles: member/admin)
- Super admin (`user.role === 'admin'`) bypasses all permission checks
- Derives the resource name from the controller name

### Decorators

| Decorator | Type | Description |
|-----------|------|-------------|
| `@Public()` | Method | Skip authentication entirely |
| `@Optional()` | Method | Allow authenticated or unauthenticated access |
| `@Session()` | Param | Inject the better-auth session |
| `@CurrentUser()` | Param | Inject the authenticated user |
| `@CurrentOrganization()` | Param | Inject the active organization ID |
| `@RequirePermissions('read', 'create')` | Method | Require at least one of the listed permissions |
| `@NoOrganization()` | Method | Skip organization check in PermissionsGuard |

### Database hooks

`BetterAuthAdapter` registers two database hooks via `createAuthConfig()`:

1. **`user.create.after`**: Creates an Athlete profile automatically when a new user signs up
2. **`session.create.before`**: Sets `activeOrganizationId` on the session so the frontend can redirect correctly after login

Note: `athleteId` is enriched at read-time via the `customSession` plugin, not stored in the session table.

## Dependencies

- **NotificationModule**: Sending invitation emails (via `INotificationUseCases`)
- **`permissions.config.ts`**: Local permission definitions (2 org roles: member, admin)
- **MikroORM**: Entity persistence (User, Organization, Member, etc.)
