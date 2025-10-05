import {
    Entity,
    ManyToOne,
    PrimaryKey,
    Property,
    Unique,
  } from '@mikro-orm/core';
import { User } from './user.entity';

/**
 * Store active authentication sessions
 */
@Entity({ tableName: 'session' })
export class Session {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string

  @Property({ fieldName: 'expiresAt' })
  expiresAt!: Date

  @Property()
  @Unique()
  token!: string

  @Property({ fieldName: 'createdAt' })
  createdAt: Date = new Date()

  @Property({ fieldName: 'updatedAt', onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  @Property({ fieldName: 'ipAddress', nullable: true })
  ipAddress?: string

  @Property({ fieldName: 'userAgent', nullable: true })
  userAgent?: string

  @Property({ fieldName: 'activeOrganizationId', nullable: true })
  activeOrganizationId?: string

  @Property({ fieldName: 'athleteId', nullable: true })
  athleteId?: string

  @ManyToOne(() => User, { fieldName: 'userId' })
  user!: User
}