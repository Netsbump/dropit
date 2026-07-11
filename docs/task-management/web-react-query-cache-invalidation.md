# Web React Query Cache Invalidation

## Objective

Stabilize React Query query keys and cache invalidation patterns in the web app.

## Rules

- Each feature exposes its query keys from `lib/*-query-keys.ts`.
- Mutations use shared query keys instead of raw string arrays.
- `lib/*-query-invalidation.ts` helpers are reserved for multi-query or business-level invalidation flows.
- Do not create one-line invalidation helpers unless the function name carries useful business intent.
- Keep `useQueryClient()` inside hooks/components that trigger mutations; pass the client into feature invalidation helpers when needed.

## Initial Scope

- Auth: replace raw `['user', 'me']` keys with shared auth query keys.
- Athletes: centralize `['athletes']` and athlete detail keys if present.
- Workouts: centralize `['workouts']` and workout detail keys if present.
- Exercises: align exercise list/detail/category keys with feature query keys.
- Complexes: align complex list/detail/category keys with feature query keys.
- Admin: keep `adminQueryKeys`; add invalidation helpers only for grouped admin flows.

## Acceptance Criteria

- No new raw query keys are introduced in mutation invalidations.
- Existing repeated raw keys are migrated where touched by this cleanup.
- Multi-query invalidation flows are named after the business event they refresh.
- Simple one-query invalidations remain inline with shared query keys.
