import { Check, Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { GLOBAL_ROLE, type GlobalRole } from '@dropit/schemas';

/**
 * Store user information
 */
@Entity({ tableName: 'user' })
@Check({ name: 'user_role_check', expression: `"role" in ('user', 'admin')` })
export class User {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  name!: string;

  @Property()
  @Unique()
  email!: string;

  @Property({ fieldName: 'emailVerified' })
  emailVerified = false;

  @Property({ nullable: true })
  image!: string | null;

  @Property({ fieldName: 'createdAt' })
  createdAt: Date = new Date();

  @Property({ fieldName: 'updatedAt', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  // Admin plugin fields (app-level: admin = super admin, user = all others)
  @Property({ default: GLOBAL_ROLE.USER })
  role: GlobalRole = GLOBAL_ROLE.USER;

  @Property({ nullable: true })
  banned!: boolean | null;

  @Property({ fieldName: 'banReason', nullable: true })
  banReason!: string | null;

  @Property({ fieldName: 'banExpires', nullable: true })
  banExpires!: Date | null;
}
