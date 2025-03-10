import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { AthleteSession } from './athlete-session.entity';
import { Club } from './club.entity';
import { User } from './user.entity';

@Entity()
export class Athlete {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  firstName!: string;

  @Property()
  lastName!: string;

  @Property()
  birthday!: Date;

  @Property({ nullable: true })
  country?: string;

  @OneToOne(() => User, { owner: true, nullable: true })
  user?: User;

  @ManyToOne(() => Club)
  club!: Club;

  @OneToMany(
    () => AthleteSession,
    (athleteSession) => athleteSession.athlete
  )
  sessions = new Collection<AthleteSession>(this);

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
