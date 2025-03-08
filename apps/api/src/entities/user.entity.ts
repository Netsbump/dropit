import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Media } from './media.entity';

export enum UserRole {
  ATHLETE = 'athlete',
  COACH = 'coach',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ unique: true })
  email!: string;

  @Property()
  password!: string;

  @Enum(() => UserRole)
  role!: UserRole;

  @ManyToOne(() => Media, { nullable: true })
  avatar?: Media;

  @Property({ nullable: true })
  lastLogin?: Date;

  @Property({ default: false })
  isSuperAdmin = false;

  @Property({ default: true })
  isActive = true;

  @Property({ nullable: true })
  emailVerifiedAt?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
