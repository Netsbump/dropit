import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Session } from '../../performance/session/session.entity';
import { WorkoutCategory } from '../workout-category/workout-category.entity';
import { WorkoutElement } from '../workout-element/workout-element.entity';

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

  @OneToMany(
    () => WorkoutElement,
    (workoutElement) => workoutElement.workout
  )
  elements = new Collection<WorkoutElement>(this);

  @OneToMany(
    () => Session,
    (session) => session.workout
  )
  sessions = new Collection<Session>(this);

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
