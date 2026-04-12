import { authClient } from "@/lib/auth-client";

// ---- BETTER-AUTH HOOKS ----

/**
 * Use in React components that need to display or react to session data.
 * Subscribes to session changes and triggers re-renders automatically.
 *
 * @example
 * const { sessionData, isSessionPending } = useSession();
 * return <span>{sessionData?.user?.name}</span>
 */
export function useSession() {
  const { data: sessionData, isPending: isSessionPending, error } = authClient.useSession();

  if (error) throw error;

  return {
    sessionData,
    isSessionPending
  }
}

// ---- BETTER-AUTH CALLBACKS ----

/**
 * Use in async contexts outside of React rendering — primarily TanStack Router
 * beforeLoad() guards. Does NOT trigger re-renders.
 *
 * @example
 * beforeLoad: async () => {
 *   const { data: session } = await getSession();
 *   if (!session) throw redirect({ to: '/login' });
 * }
 */
export function getSession() {
  return authClient.getSession();
}

/**
 * Use in TanStack Router beforeLoad() guards to check the user's organization role.
 * Returns the role of the active member in the current organization ('admin' | 'member' | 'owner').
 *
 * @example
 * const { data: memberRole } = await getMemberRole();
 * const isCoach = memberRole?.role === 'admin';
 */
export function getMemberRole() {
  return authClient.organization.getActiveMemberRole();
}
