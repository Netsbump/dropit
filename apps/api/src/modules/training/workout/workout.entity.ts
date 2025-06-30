import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { TrainingSession } from '../../performance/training-session/training-session.entity';
import { WorkoutCategory } from '../workout-category/workout-category.entity';
import { WorkoutElement } from '../workout-element/workout-element.entity';
import { User } from '../../members/auth/auth.entity'

@Entity()
export class Workout {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  title!: string;

  @Property()
  description!: string;

  @ManyToOne(() => WorkoutCategory)
  category!: WorkoutCategory;

  @ManyToOne(() => User, { nullable: true })
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
