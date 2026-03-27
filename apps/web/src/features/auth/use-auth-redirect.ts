import { useNavigate } from "@tanstack/react-router";
import { getSession, getMemberRole } from "./auth-queries";

export function useAuthRedirect() {
  const navigate = useNavigate();

  const redirectBasedOnRole = async () => {
    const { data: session } = await getSession();
    const { data: memberRole } = await getMemberRole();

    const isSuperAdmin = session?.user?.role === 'admin';
    const role = memberRole?.role;

    if (isSuperAdmin || role === 'admin') {
      navigate({ to: '/dashboard', replace: true });
    } else {
      navigate({ to: '/download-app', replace: true });
    }
  };

  return { redirectBasedOnRole };
}
