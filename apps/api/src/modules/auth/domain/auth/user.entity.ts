import {
    Entity,
    PrimaryKey,
    Property,
    Unique,
  } from '@mikro-orm/core';

/**
 * Store user information
 */
@Entity({ tableName: 'user' })
export class User {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  name!: string;

  @Property()
  @Unique()
  email!: string;

  @Property({ fieldName: 'emailVerified' })
  emailVerified = false

  @Property({ nullable: true })
  image?: string

  @Property({ fieldName: 'createdAt' })
  createdAt: Date = new Date()

  @Property({ fieldName: 'updatedAt', onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  @Property()
  isSuperAdmin = false;
}