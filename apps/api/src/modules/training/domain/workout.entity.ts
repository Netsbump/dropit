import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { TrainingSession } from './training-session.entity';
import { WorkoutCategory } from './workout-category.entity';
import { WorkoutElement } from './workout-element.entity';
import { User } from '../../identity/domain/auth/user.entity'

@Entity()
export class Workout {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  description!: string;

  @ManyToOne(() => WorkoutCategory)
  category!: WorkoutCategory;

  @ManyToOne(() => User, { nullable: true, deleteRule: 'cascade'})
  createdBy!: User | null;

  @OneToMany(
    () => WorkoutElement,
    (workoutElement) => workoutElement.workout
  )
  elements = new Collection<WorkoutElement>(this);

  @OneToMany(
    () => TrainingSession,
    (trainingSession) => trainingSession.workout
  )
  trainingSessions = new Collection<TrainingSession>(this);

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
