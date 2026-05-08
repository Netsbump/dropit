import {
  GLOBAL_ROLE,
  ORGANIZATION_ROLE,
  type GlobalRole,
  type OrganizationRole,
} from "@dropit/schemas";

export function isSuperAdmin(params: { userRole: GlobalRole }): boolean {
  return params.userRole === GLOBAL_ROLE.ADMIN;
}

export function isCoach(params: {
  organizationRole: OrganizationRole;
}): boolean {
  return params.organizationRole === ORGANIZATION_ROLE.ADMIN;
}

export function canAccessBackOffice(params: {
  userRole: GlobalRole;
  organizationRole: OrganizationRole;
}): boolean {
  return (
    isSuperAdmin({ userRole: params.userRole }) ||
    isCoach({ organizationRole: params.organizationRole })
  );
}
