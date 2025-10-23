# DropIt API

Backend API for DropIt application, built with NestJS and MikroORM.

## Technologies

- **NestJS**: Modern, progressive Node.js framework
- **MikroORM**: TypeScript ORM with support for Node.js
- **PostgreSQL**: Primary database
- **ts-rest**: Type-safe REST API contracts
- **Zod**: Schema validation and type inference
- **@dropit/contract**: Internal package for API contracts
- **@dropit/schemas**: Internal package for shared schemas and validations

## Available Scripts

```bash
# Start the API in development mode with hot reload
pnpm dev

# Build the API for production
pnpm build

# Run the production build
pnpm start

# Run tests
pnpm test          # Unit tests
pnpm test:watch    # Run tests in watch mode
pnpm test:e2e      # End-to-end tests
pnpm test:cov      # Test coverage
pnpm test:debug    # Debug tests
pnpm test:e2e:docker  # Run e2e tests in Docker

# Database operations
pnpm db:create     # Create database and run migrations
pnpm db:sync       # Sync database schema
pnpm db:fresh      # Reset database and run seeders
pnpm db:migration:up     # Run pending migrations
pnpm db:migration:down   # Revert last migration
pnpm db:migration:create # Create a new migration
pnpm db:migration:list   # List all migrations
pnpm db:seed      # Run database seeders
```

## Database Migrations

When making changes to entities, follow these steps to create and apply migrations:

1. Make changes to your entity files (e.g., `src/entities/*.entity.ts`)

2. Generate a migration (replace `<MigrationName>` with a descriptive name):
```bash
pnpm db:migration:create --name <MigrationName>
```

3. Review the generated migration in `src/migrations`

4. Apply the migration:
```bash
pnpm db:migration:up
```

**Note:** For production migrations with real user data, see the [Production Migrations Guide](../../docs/migrations-production.md) which details backup strategies, rollback procedures, and security best practices.

## Database Seeding

The application includes seeders to populate the database with initial data:
- Exercise categories (Haltérophilie, Endurance, Cardio, Musculation)
- Exercises with English names and short names
- Complex categories (EMOM, TABATA, etc.)
- Sample complexes with ordered exercises and training parameters
- Workout categories (Saisons, Deload, etc.)
- Sample workouts with ordered elements and training parameters

To reset and seed the database:
```bash
pnpm db:fresh
```

## Project Structure

```
src/
├── entities/         # Database entities
├── migrations/       # Database migrations
├── modules/         # Feature modules
│   ├── exercise/    # Exercise module
│   ├── complex/     # Complex module
│   └── media/       # Media module
├── seeders/         # Database seeders
└── main.ts          # Application entry point
```

## API Documentation

The API documentation is automatically generated from ts-rest contracts and is available at `http://localhost:3001/api`. 

### Features
- Interactive Swagger/OpenAPI documentation
- Generated from shared ts-rest contracts (`packages/contract`)
- Type-safe endpoints and responses
- Request/response schema validation
- Try-it-out functionality

### Accessing the Documentation
1. Start the API server: `pnpm dev`
2. Navigate to `http://localhost:3001/api` in your browser
3. Explore available endpoints, schemas, and test API calls directly

The documentation is automatically kept in sync with the API contracts defined in the shared packages, ensuring that it's always up-to-date with the latest API changes.

## Architecture

This API follows a hexagonal architecture (Ports & Adapters) approach to separate business logic from infrastructure concerns. For a comprehensive guide on the architecture patterns, dependency injection, and implementation details, see the [Hexagonal Architecture Guide](../../docs/architecture-hexagonale.md).

