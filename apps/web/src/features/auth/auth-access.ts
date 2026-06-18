import {
  GLOBAL_ROLE,
  ORGANIZATION_ROLE,
  globalRoleSchema,
  organizationRoleSchema,
} from '@dropit/schemas';
import { canAccessBackOffice } from './auth-role';
import { getMemberRole, getSession } from './auth-queries';

export function resolveUserRole(role: unknown) {
  const parsedUserRole = globalRoleSchema.safeParse(role);
  return parsedUserRole.success ? parsedUserRole.data : GLOBAL_ROLE.USER;
}

export function resolveOrganizationRole(role: unknown) {
  const parsedOrganizationRole = organizationRoleSchema.safeParse(role);
  return parsedOrganizationRole.success
    ? parsedOrganizationRole.data
    : ORGANIZATION_ROLE.MEMBER;
}

export async function getBackOfficeAccessState() {
  const { data: session } = await getSession();

  if (!session) {
    return {
      isAuthenticated: false,
      userRole: GLOBAL_ROLE.USER,
      organizationRole: ORGANIZATION_ROLE.MEMBER,
      hasBackOfficeAccess: false,
    };
  }

  const { data: memberRole } = await getMemberRole();
  const userRole = resolveUserRole(session.user.role);
  const organizationRole = resolveOrganizationRole(memberRole?.role);

  return {
    isAuthenticated: true,
    userRole,
    organizationRole,
    hasBackOfficeAccess: canAccessBackOffice({ userRole, organizationRole }),
  };
}
