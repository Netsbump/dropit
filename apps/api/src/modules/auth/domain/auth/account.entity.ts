import {
    Entity,
    ManyToOne,
    PrimaryKey,
    Property,
  } from '@mikro-orm/core';
import { User } from './user.entity';

/**
 * Store linked third-party accounts (OAuth, etc)
 */
@Entity({ tableName: 'account' })
export class Account {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string

  @Property({ fieldName: 'accountId' })
  accountId!: string

  @Property({ fieldName: 'providerId' })
  providerId!: string

  @ManyToOne(() => User, { fieldName: 'userId', deleteRule: 'cascade' })
  user!: User

  @Property({ fieldName: 'accessToken', nullable: true })
  accessToken!: string | null

  @Property({ fieldName: 'refreshToken', nullable: true })
  refreshToken!: string | null

  @Property({ fieldName: 'idToken', nullable: true })
  idToken!: string | null

  @Property({ fieldName: 'accessTokenExpiresAt', nullable: true })
  accessTokenExpiresAt!: Date | null

  @Property({ fieldName: 'refreshTokenExpiresAt', nullable: true })
  refreshTokenExpiresAt!: Date | null

  @Property({ nullable: true })
  scope!: string | null

  @Property({ nullable: true })
  password!: string | null

  @Property({ fieldName: 'createdAt' })
  createdAt: Date = new Date()

  @Property({ fieldName: 'updatedAt', onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}
