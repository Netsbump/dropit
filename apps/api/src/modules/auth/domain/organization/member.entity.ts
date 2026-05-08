import {
  Check,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { ORGANIZATION_ROLE, type OrganizationRole } from '@dropit/schemas';
import { User } from '../auth/user.entity';
import { Organization } from './organization.entity';

/**
 * Store members of an organization
 */
@Entity({ tableName: 'member' })
@Check({
  name: 'member_role_check',
  expression: `"role" in ('member', 'admin', 'owner')`,
})
export class Member {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => User, { fieldName: 'userId', deleteRule: 'cascade' })
  user!: User;

  @ManyToOne(() => Organization, { fieldName: 'organizationId' })
  organization!: Organization;

  @Property({ default: ORGANIZATION_ROLE.MEMBER })
  role: OrganizationRole = ORGANIZATION_ROLE.MEMBER;

  @Property({ fieldName: 'createdAt' })
  createdAt: Date = new Date();
}
