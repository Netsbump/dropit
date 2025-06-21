import {
  Entity,
  Enum,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';

export enum UserRole {
  ATHLETE = 'athlete',
  COACH = 'coach',
  ADMIN = 'admin',
}

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

  @Property({ default: 'athlete' })
  role = 'athlete'

  @Property({ fieldName: 'createdAt' })
  createdAt: Date = new Date()

  @Property({ fieldName: 'updatedAt', onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}

/**
 * Stocke les sessions d'authentification active
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

  @ManyToOne(() => User, { fieldName: 'userId' })
  user!: User
}

/**
 * Stocke les comptes tiers liés (OAuth, etc)
 */
@Entity({ tableName: 'account' })
export class Account {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string

  @Property({ fieldName: 'accountId' })
  accountId!: string

  @Property({ fieldName: 'providerId' })
  providerId!: string

  @ManyToOne(() => User, { fieldName: 'userId' })
  user!: User

  @Property({ fieldName: 'accessToken', nullable: true })
  accessToken?: string

  @Property({ fieldName: 'refreshToken', nullable: true })
  refreshToken?: string

  @Property({ fieldName: 'idToken', nullable: true })
  idToken?: string

  @Property({ fieldName: 'accessTokenExpiresAt', nullable: true })
  accessTokenExpiresAt?: Date

  @Property({ fieldName: 'refreshTokenExpiresAt', nullable: true })
  refreshTokenExpiresAt?: Date

  @Property({ nullable: true })
  scope?: string

  @Property({ nullable: true })
  password?: string

  @Property({ fieldName: 'createdAt' })
  createdAt: Date = new Date()

  @Property({ fieldName: 'updatedAt', onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}

/**
 * Stocke les jetons de vérification (email, réinitialisation de mot de passe, etc)
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
