import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { User } from "../auth/user.entity";
import { Organization } from "./organization.entity";

/**
 * Store members of an organization
 */
@Entity({ tableName: 'member' })
export class Member {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => User, { fieldName: 'userId' })
  user!: User;

  @ManyToOne(() => Organization, { fieldName: 'organizationId' })
  organization!: Organization;

  @Property({ default: 'member' })
  role = 'member';

  @Property({ fieldName: 'createdAt' })
  createdAt: Date = new Date();
}