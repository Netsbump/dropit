import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { AthleteSession } from './athlete-session.entity';
import { Workout } from './workout.entity';

@Entity()
export class Session {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => Workout)
  workout!: Workout;

  @OneToMany(
    () => AthleteSession,
    (athleteSession) => athleteSession.session
  )
  athletes = new Collection<AthleteSession>(this);

  @Property()
  scheduledDate!: Date;

  @Property({ nullable: true })
  completedDate?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
