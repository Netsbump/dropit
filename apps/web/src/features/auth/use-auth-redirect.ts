import { useNavigate } from "@tanstack/react-router";
import { getSession, getMemberRole } from "./auth-queries";
import { GLOBAL_ROLE, ORGANIZATION_ROLE, globalRoleSchema, organizationRoleSchema } from '@dropit/schemas';
import { canAccessBackOffice } from './auth-role';

export function useAuthRedirect() {
  const navigate = useNavigate();

  const redirectBasedOnRole = async () => {
    const { data: session } = await getSession();
    const { data: memberRole } = await getMemberRole();

    const parsedUserRole = globalRoleSchema.safeParse(session?.user?.role);
    const parsedOrganizationRole = organizationRoleSchema.safeParse(memberRole?.role);

    const hasBackOfficeAccess = canAccessBackOffice({
      userRole: parsedUserRole.success ? parsedUserRole.data : GLOBAL_ROLE.USER,
      organizationRole: parsedOrganizationRole.success ? parsedOrganizationRole.data : ORGANIZATION_ROLE.MEMBER,
    });

    if (hasBackOfficeAccess) {
      navigate({ to: '/dashboard', replace: true });
    } else {
      navigate({ to: '/download-app', replace: true });
    }
  };

  return { redirectBasedOnRole };
}
