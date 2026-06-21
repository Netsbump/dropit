# DropIt Agent Guide

DropIt is a pnpm monorepo for weightlifting club management.

This file is for agent guidance only. Do not duplicate project documentation,
setup steps, command lists, dependency versions, or service details here.

## Rules

- Always read `README.md` before changing setup, commands, dependencies, Docker,
  or environment behavior.
- Inspect the relevant source files before making architecture, auth, API, or
  database changes.
- Follow existing patterns before introducing new abstractions.
- Keep changes focused and run the smallest relevant verification first.

## Documentation

- `README.md` and `package.json` are the source of truth for setup, commands,
  env, and Docker.
- Use existing documentation only when it is directly relevant to the task.
- Prefer nearby README files for module-specific context.
- Do not duplicate human-facing documentation in this file.

## Project Map

- Setup, commands, env, and Docker: `README.md`, `package.json`
- API app: `apps/api`
- Web app: `apps/web`
- Mobile app: `apps/mobile`
- API contracts: `packages/contract`
- Shared schemas: `packages/schemas`
- Shared translations: `packages/i18n`

## API Work

- Check existing module structure under `apps/api/src/modules`.
- For API shape changes, update `packages/schemas` and `packages/contract`
  before app implementation.
- For database schema changes, add MikroORM migrations.
- For auth or permission changes, inspect the current guards, permission config,
  and role schemas before editing.

## Frontend Work

- Check existing route, component, form, and query patterns before adding new
  code.
- Reuse shared schemas and contracts instead of duplicating API shapes.
