# DropIt API

NestJS backend for DropIt, using PostgreSQL, MikroORM, Better Auth, ts-rest, and shared contracts from the monorepo packages.

> For the full installation flow, Docker setup, and global environment variables, see the [root README](../../README.md). Commands below are meant to be run from `apps/api`, unless stated otherwise.

## Stack

- **NestJS**: Node.js backend framework
- **MikroORM**: TypeScript ORM for PostgreSQL
- **Better Auth**: Authentication, sessions, and organizations
- **ts-rest**: Type-safe REST contracts shared with web/mobile clients
- **Zod**: Schema validation
- **Vitest + SWC**: Unit and integration tests
- **Biome**: Monorepo-level linting and formatting

Internal packages used by the API:

- `@dropit/contract`: ts-rest HTTP contracts
- `@dropit/schemas`: shared Zod schemas, DTOs, and types

## Scripts

### Development

```bash
pnpm dev          # Run Nest in watch mode
pnpm build        # Build for production
pnpm start        # Start the app through Nest
pnpm start:debug  # Watch mode with debugger
pnpm start:prod   # Run dist/main after build
pnpm typecheck    # Run TypeScript without emitting files
pnpm clean        # Remove dist
```

From the monorepo root:

```bash
pnpm --filter api dev
pnpm --filter api build
pnpm --filter api typecheck
```

## Tests

API tests use **Vitest** with SWC and `reflect-metadata` for NestJS.

```bash
pnpm test                    # Run all API tests
pnpm test:watch              # Run all tests in watch mode
pnpm test:unit               # Run unit tests only
pnpm test:unit:watch         # Run unit tests in watch mode
pnpm test:unit:cov           # Run unit tests with coverage
pnpm test:integration        # Run integration tests without managing Docker
pnpm test:integration:docker # Start test DB, run integration tests, then stop Docker
```

From the monorepo root:

```bash
pnpm test:api:unit
pnpm test:api:integration
```

Current test layout:

- Unit tests: `src/**/*.spec.ts`, excluding `src/test/**`
- Integration tests: `src/test/**/*.integration.spec.ts`
- Vitest setup: `src/test/setup/`
- Vitest config: `vitest.config.ts`
- SWC config: `.swcrc`

## Database

MikroORM configuration lives in `src/modules/database/mikro-orm.config.ts`.
Migrations live in `src/modules/database/migrations/`.

```bash
pnpm db:create           # Create the database, then run migrations
pnpm db:sync             # Sync the schema with entities
pnpm db:migration:check  # Check pending migrations
pnpm db:migration:up     # Apply migrations
pnpm db:migration:down   # Revert the latest migration
pnpm db:migration:list   # List migrations
pnpm db:migration:fresh  # Recreate the database from migrations (destructive)
pnpm db:seed             # Run seeders
pnpm db:seed:prod        # Run seeders from dist
```

Create a migration after changing entities:

```bash
pnpm db:migration:create -- --name MigrationName
```

Reset a local database and seed demo data:

```bash
pnpm db:migration:fresh
pnpm db:seed
```

Seeders are located in `src/seeders/`.

## Environment Variables

Example file: `apps/api/.env.example`.

Main API variables:

- `NODE_ENV`
- `API_PORT`
- `APP_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` or `BETTER_AUTH_BASE_URL`
- `TRUSTED_ORIGINS`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `DB_HOST_TEST`, `DB_PORT_TEST`, `DB_USER_TEST`, `DB_PASSWORD_TEST`, `DB_NAME_TEST`
- Email variables: `BREVO_API_KEY`, `EMAIL_FROM_EMAIL`, `EMAIL_FROM_NAME`, `MAILDEV_*`

Environment configuration is validated at startup in `src/config/env.config.ts`.

## Project Structure

```text
src/
├── app.module.ts
├── app.controller.ts
├── main.ts
├── config/                 # Environment and Swagger/OpenAPI config
├── shared/                 # Shared kernel, primitives, and cross-cutting helpers
├── seeders/                # MikroORM seeders
├── test/                   # Integration tests, fixtures, mocks, Vitest setup
└── modules/
    ├── admin/              # Application administration
    ├── athletes/           # Athletes bounded context
    ├── auth/               # Auth, users, organizations, permissions
    ├── database/           # DbModule, MikroORM config, migrations, legacy entities
    ├── invitations/        # Organization invitations
    ├── media/              # Media entity
    ├── notification/       # Email/push/SMS notifications
    └── training/           # Exercises, complexes, workouts, sessions
```

Most modules follow a hexagonal architecture:

- `domain/`: entities and business logic
- `application/`: use cases, ports, policies, application errors
- `infrastructure/`: technical adapters and MikroORM repositories
- `interface/` or `http/`: controllers, presenters, mappers, filters

Some modules are newer or more legacy than others: follow the existing patterns of the module you are changing.

## API Documentation

When the API is running, Swagger/OpenAPI documentation is available at:

```text
http://localhost:3000/api
```

The global HTTP prefix is `/api`.
Documentation is generated from ts-rest contracts in `packages/contract` and shared schemas in `packages/schemas`.

## Additional Documentation

- [Hexagonal Architecture Guide](../../docs/architecture-hexagonale.md)
- [Production Migrations Guide](../../docs/migrations-production.md)
- Module-specific READMEs:
  - `src/modules/auth/README.md`
  - `src/modules/auth/README-permissions.md`
  - `src/modules/auth/README-onboarding.md`
  - `src/modules/database/README.md`
  - `src/modules/invitations/README.md`
  - `src/modules/notification/README.md`
