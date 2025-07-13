import { Entity, PrimaryKey, Property, OneToMany, Collection } from "@mikro-orm/core";
import { Member } from "./member.entity";
import { Invitation } from "./invitation.entity";

/**
 * Store organization information
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