import { useNavigate } from '@tanstack/react-router';
import { getBackOfficeAccessState } from './auth-access';

/**
 * Handles post-login navigation from UI flows (e.g. admin login, OTP login).
 *
 * This hook is a UX helper used after authentication succeeds in a component.
 * It does not replace route-level guards: `beforeLoad` guards remain the
 * source of truth and will re-validate session and role permissions.
 */
export function useAuthRedirect() {
  const navigate = useNavigate();

  /**
   * Resolves current access state and redirects users to their landing page:
   * - Back-office users (coach/super admin): /dashboard
   * - Other authenticated users: /download-app
   */
  const redirectBasedOnRole = async () => {
    const accessState = await getBackOfficeAccessState();

    if (accessState.hasBackOfficeAccess) {
      navigate({ to: '/dashboard', replace: true });
    } else {
      navigate({ to: '/download-app', replace: true });
    }
  };

  return { redirectBasedOnRole };
}
