import { authClient } from "@/lib/auth-client";

// ---- BETTER-AUTH HOOKS ----
export function useSession() {
  const { data: sessionData, isPending: isSessionPending, error } = authClient.useSession();

  if (error) throw error;

  return {
    sessionData,
    isSessionPending
  }
}

// ---- BETTER-AUTH CALLBACKS ----
export function getSession() {
  return authClient.getSession();
}

export function getMemberRole() {
  return authClient.organization.getActiveMemberRole();
}
