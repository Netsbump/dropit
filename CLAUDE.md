# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DropIt is a weightlifting club management application built as a monorepo using Turborepo. It provides features for managing athletes, workouts, exercises, training sessions, and performance tracking.

## Architecture

This is a **monorepo** with the following structure:
- `apps/api/` - NestJS backend with Clean Architecture pattern
- `apps/web/` - React frontend with TanStack Router and Query
- `packages/` - Shared packages for contracts, schemas, permissions, and i18n

### Backend Architecture (Clean Architecture)

The API follows Clean Architecture with domain-driven design:
- `domain/` - Core business entities and rules
- `application/` - Use cases and ports (interfaces)
- `infrastructure/` - Data persistence with MikroORM adapters  
- `interface/` - Controllers, mappers, and presenters

Main modules:
- `identity/` - Authentication and organization management using better-auth
- `athletes/` - Athlete profiles, competitor status, personal records
- `training/` - Exercises, complexes, workouts, training sessions
- `core/` - Database, email, and media services

## Common Development Commands

### Setup and Installation
```bash
pnpm install                    # Install dependencies
pnpm build                      # Initial build (required for packages)
docker-compose up -d           # Start services (PostgreSQL, Redis, Typesense)
```

### Development
```bash
pnpm dev                       # Start both API and web in dev mode
pnpm --filter api dev          # Start only API
pnpm --filter web dev          # Start only web
```

### Database Operations
```bash
pnpm db:fresh                  # Drop and recreate database with seed data
pnpm db:seed                   # Seed database with test data
pnpm --filter api db:migration:create  # Create new migration
pnpm --filter api db:migration:up      # Apply migrations
```

### Testing
```bash
pnpm test:api:unit             # Run unit tests
pnpm test:api:integration      # Run integration tests with Docker
```

### Code Quality
```bash
pnpm lint                      # Check code with Biome linter
pnpm lint:fix                  # Fix linting issues
pnpm format                    # Format code
pnpm typecheck                 # Type checking
```

## Tech Stack

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with MikroORM
- **Authentication**: better-auth with organization plugin
- **API Contracts**: ts-rest for type-safe APIs
- **Email**: Brevo (Sendinblue)
- **Validation**: Zod schemas

### Frontend  
- **Framework**: React with TypeScript
- **Routing**: TanStack Router
- **State Management**: TanStack Query
- **UI**: Shadcn/ui with Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Drag & Drop**: dnd-kit
- **Calendar**: FullCalendar

### Shared Packages
- `@dropit/contract` - API contracts using ts-rest
- `@dropit/schemas` - Zod validation schemas
- `@dropit/permissions` - Better-auth access control and roles
- `@dropit/i18n` - Internationalization with French and English

## Authentication & Authorization

Uses better-auth with organization-based permissions:
- **Roles**: owner, admin, member
- **Permissions**: Managed client-side by better-auth
- **Backend**: Only verifies authentication (AuthGuard)
- **Frontend**: Handles permission-based UI rendering

## Environment Setup

Single `.env` file at project root controls all services. Copy `.env.example` to `.env` and configure:
- Database connection settings
- Better-auth secret and trusted origins
- Email service credentials
- API URLs

## Important Patterns

### API Development
- Use Clean Architecture layers consistently
- Create contracts in `@dropit/contract` package first
- Define Zod schemas in `@dropit/schemas` package
- Follow existing controller/use-case patterns

### Frontend Development  
- Use TanStack Query for server state
- Follow feature-based directory structure
- Use Shadcn/ui components consistently
- Implement permission checks with better-auth hooks

### Database Operations
- Always create migrations for schema changes
- Use seeders for development data
- Follow MikroORM entity patterns
- Test with integration tests using Docker

## Testing Strategy

- **Unit tests**: Business logic and use cases
- **Integration tests**: Full API endpoints with database
- **Docker testing**: Isolated test database environment
- Use `@faker-js/faker` for test data generation

## External Libraries Documentation

**IMPORTANT**: Always refer to the official documentation when working with external libraries. The ecosystem evolves rapidly and this ensures accuracy:

- **ts-rest**: https://ts-rest.com/contract/overview - Type-safe API contracts
- **Better-auth**: https://www.better-auth.com/docs/introduction - Authentication and organization management
- **NestJS**: https://docs.nestjs.com/ - Backend framework patterns and best practices
- **MikroORM**: https://mikro-orm.io/docs/quick-start - Entity definitions, migrations, and queries
- **TanStack Router**: https://tanstack.com/router/latest/docs/framework/react/overview - File-based routing patterns
- **TanStack Query**: https://tanstack.com/query/latest/docs/framework/react/overview - Server state management
- **Zod**: https://zod.dev/ - Schema validation patterns
- **Shadcn/ui**: https://ui.shadcn.com/docs/installation - Component library usage
- **Turborepo**: https://turborepo.com/docs - Monorepo configuration

Consult these docs before implementing new features or modifying existing integrations.