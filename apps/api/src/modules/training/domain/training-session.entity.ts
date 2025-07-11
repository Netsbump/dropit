import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Workout } from './workout.entity';
import { AthleteTrainingSession } from './athlete-training-session.entity';
import { Organization } from '../../identity/organization/organization.entity';

@Entity()
export class TrainingSession {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => Workout)
  workout!: Workout;

  @ManyToOne(() => Organization)
  organization!: Organization;

  @OneToMany(
    () => AthleteTrainingSession,
    (athleteTrainingSession) => athleteTrainingSession.trainingSession
  )
  athletes = new Collection<AthleteTrainingSession>(this);

  @Property()
  scheduledDate!: Date;

  @Property({ nullable: true })
  completedDate?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
