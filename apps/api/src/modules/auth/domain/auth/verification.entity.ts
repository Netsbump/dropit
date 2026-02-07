import {
    Entity,
    PrimaryKey,
    Property,
  } from '@mikro-orm/core';

/**
 * Store verification tokens (email, password reset, etc)
 */
@Entity({ tableName: 'verification' })
export class Verification {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string

  @Property()
  identifier!: string

  @Property()
  value!: string

  @Property({ fieldName: 'expiresAt' })
  expiresAt!: Date

  @Property({ fieldName: 'createdAt' })
  createdAt: Date = new Date()

  @Property({ fieldName: 'updatedAt', onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}