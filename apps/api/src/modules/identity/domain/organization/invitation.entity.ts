import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { User } from "../auth/user.entity";
import { Organization } from "./organization.entity";

/**
 * Store invitations to join an organization
 */
@Entity({ tableName: 'invitation' })
export class Invitation {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  email!: string;

  @ManyToOne(() => User, { fieldName: 'inviterId' })
  inviter!: User;

  @ManyToOne(() => Organization, { fieldName: 'organizationId' })
  organization!: Organization;

  @Property()
  role!: string;

  @Property()
  status!: string;

  @Property({ fieldName: 'expiresAt' })
  expiresAt!: Date;
} 