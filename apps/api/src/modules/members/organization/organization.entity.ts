import {
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Collection,
} from '@mikro-orm/core';
import { User } from '../auth/auth.entity';

/**
 * Entités pour le plugin organization de Better Auth
 */

@Entity({ tableName: 'organization' })
export class Organization {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  slug?: string;

  @Property({ nullable: true })
  logo?: string;

  @Property({ nullable: true })
  metadata?: string;

  @Property({ fieldName: 'createdAt' })
  createdAt: Date = new Date();

  @OneToMany(() => Member, (member) => member.organization)
  members = new Collection<Member>(this);

  @OneToMany(() => Invitation, (invitation) => invitation.organization)
  invitations = new Collection<Invitation>(this);
}

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

  @Property({ default: 'member' })
  role = 'member';

  @Property({ default: 'pending' })
  status = 'pending';

  @Property({ fieldName: 'expiresAt' })
  expiresAt!: Date;

  @Property({ fieldName: 'createdAt' })
  createdAt: Date = new Date();
} 