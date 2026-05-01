# DropIt Agent Guide

DropIt is a pnpm monorepo for weightlifting club management.

## Stack and Layout

- Monorepo: `apps/api`, `apps/web`, `packages`
- Backend: NestJS + TypeScript + MikroORM + better-auth + ts-rest + Zod
- Frontend: React + TanStack Router + TanStack Query + shadcn/ui + React Hook Form
- Shared packages:
  - `@dropit/contract` (API contracts)
  - `@dropit/schemas` (Zod schemas)
  - `@dropit/i18n` (translations)

## Architecture Rules

- API follows Clean Architecture:
  - `domain` (business rules)
  - `application` (use cases + ports)
  - `infrastructure` (adapters, persistence)
  - `interface` (controllers, presenters, mappers)
- Keep module boundaries clear (`auth`, `athletes`, `training`, `core`).
- For API changes, update contract and schemas before implementation.

## Auth and Permissions

- Org roles: `admin` (coach), `member` (athlete)
- Super admin: `user.role === "admin"` bypasses permission checks
- Backend flow: `AuthGuard` validates session, `PermissionsGuard` checks org role
- Session enrichment provides `organizationRole` and `athleteId`

## Environment and Prerequisites

- Node.js `>=22`
- pnpm `>=9.7.1`
- Docker + Docker Compose for PostgreSQL/Redis/Typesense
- Single root `.env` file (copy from `.env.example`)

## Commands

- Install: `pnpm install`
- Initial build: `pnpm build`
- Dev:
  - `pnpm dev`
  - `pnpm --filter api dev`
  - `pnpm --filter web dev`
- DB:
  - `pnpm db:fresh`
  - `pnpm db:seed`
  - `pnpm --filter api db:migration:create`
  - `pnpm --filter api db:migration:up`
- Tests:
  - `pnpm test:api:unit`
  - `pnpm test:api:integration`
- Quality:
  - `pnpm lint`
  - `pnpm lint:fix`
  - `pnpm format`
  - `pnpm typecheck`

## Working Style

- Make focused changes and run the smallest relevant verification first.
- Add DB migrations for schema changes.
- Follow existing controller/use-case/entity patterns instead of inventing new ones.
- Apply collaboration rule from `.cursor/rules/collaboration-style.mdc`.

## Reference Docs

- https://ts-rest.com/contract/overview
- https://www.better-auth.com/docs/introduction
- https://docs.nestjs.com/
- https://mikro-orm.io/docs/quick-start
- https://tanstack.com/router/latest/docs/framework/react/overview
- https://tanstack.com/query/latest/docs/framework/react/overview
- https://zod.dev/
- https://ui.shadcn.com/docs/installation
