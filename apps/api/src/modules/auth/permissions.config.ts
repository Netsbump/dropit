/**
 * Application permissions: two org roles (athlete, coach).
 * Used by PermissionsGuard to protect API routes.
 * Super admin is handled in the guard (bypass).
 *
 * DB roles from better-auth: 'member' = athlete, 'admin' = coach.
 */

export const AppAction = {
  read: 'read',
  create: 'create',
  update: 'update',
  delete: 'delete',
} as const;

export type AppAction = (typeof AppAction)[keyof typeof AppAction];

/** Permissions per resource for the athlete role (DB role: member) */
const ATHLETE_PERMISSIONS: Record<string, readonly AppAction[]> = {
  athlete: [AppAction.read, AppAction.create, AppAction.update, AppAction.delete],
  session: [AppAction.read],
  personalRecord: [AppAction.read, AppAction.create],
  trainingSession: [AppAction.read],
  athleteTrainingSession: [AppAction.read, AppAction.update],
  competitorStatus: [AppAction.read],
  invitation: [AppAction.read],
};

/** Permissions per resource for the coach role (DB role: admin) */
const COACH_PERMISSIONS: Record<string, readonly AppAction[]> = {
  workout: [AppAction.read, AppAction.create, AppAction.update, AppAction.delete],
  workoutCategory: [AppAction.read, AppAction.create, AppAction.update, AppAction.delete],
  exercise: [AppAction.read, AppAction.create, AppAction.update, AppAction.delete],
  exerciseCategory: [AppAction.read, AppAction.create, AppAction.update, AppAction.delete],
  complex: [AppAction.read, AppAction.create, AppAction.update, AppAction.delete],
  complexCategory: [AppAction.read, AppAction.create, AppAction.update, AppAction.delete],
  athlete: [AppAction.read, AppAction.create, AppAction.update, AppAction.delete],
  session: [AppAction.read, AppAction.create, AppAction.update, AppAction.delete],
  personalRecord: [AppAction.read, AppAction.create, AppAction.update, AppAction.delete],
  trainingSession: [AppAction.read, AppAction.create, AppAction.update, AppAction.delete],
  athleteTrainingSession: [AppAction.read, AppAction.update],
  competitorStatus: [AppAction.read, AppAction.create, AppAction.update],
  invitation: [AppAction.read, AppAction.create, AppAction.update, AppAction.delete],
};

const ROLE_PERMISSIONS: Record<string, Record<string, readonly AppAction[]>> = {
  member: ATHLETE_PERMISSIONS,
  admin: COACH_PERMISSIONS,
};

/**
 * Returns true if the given org role has at least one of the required actions on the resource.
 */
export function hasPermission(
  orgRole: string,
  resource: string,
  requiredActions: string[]
): boolean {
  const permissions = ROLE_PERMISSIONS[orgRole];
  if (!permissions) return false;
  const resourcePermissions = permissions[resource] ?? [];
  return requiredActions.some((action) => resourcePermissions.includes(action as AppAction));
}
