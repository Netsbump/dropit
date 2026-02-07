# Upgrade better-auth to 1.4.x

## Current state

- Installed version: `1.3.25` (package.json declares `^1.2.7`)
- Latest stable: `1.4.18`
- Two `as any` casts required because of broken type inference on `ac` (access control)

Affected files:
- `apps/api/src/modules/auth/better-auth.config.ts` — `ac: ac as any`
- `apps/web/src/lib/auth-client.ts` — `ac: ac as any`

## Why upgrade

### 1. Access control type inference fix

The `createAccessControl()` result with custom statements (our `@dropit/permissions` package) is not assignable to the type expected by `organization()` and `organizationClient()`. This forces `as any` casts.

Fixed in commit [`c051c75`](https://github.com/better-auth/better-auth/commit/c051c758) (March 2025):
> "fix(organization): custom permissions access control type inference breaking on the client"

After upgrade, `ac` can be passed directly without `as any`.

### 2. Custom session type inference fix

`auth.$Infer.Session` does not include fields added by `customSession` plugin on the server side.

Fixed in [PR #5009](https://github.com/better-auth/better-auth/pull/5009) (October 2025). Closes [#2818](https://github.com/better-auth/better-auth/issues/2818).

## Risks and checks

- **better-auth 1.4 is 100% ESM** — verify NestJS compatibility
- **`better-auth-mikro-orm@0.3.0`** — check peer dependency supports 1.4.x
- Review the [1.4 migration guide](https://www.better-auth.com/blog/1-4) for breaking changes
- Run full test suite after upgrade (unit + integration)

## After upgrade

Remove `as any` casts and biome-ignore comments in:
- `apps/api/src/modules/auth/better-auth.config.ts`
- `apps/web/src/lib/auth-client.ts`
