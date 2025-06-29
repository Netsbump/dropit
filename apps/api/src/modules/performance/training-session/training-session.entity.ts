import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Workout } from '../../training/workout/workout.entity';
import { AthleteSession } from '../athlete-session/athlete-session.entity';

@Entity()
export class TrainingSession {
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
