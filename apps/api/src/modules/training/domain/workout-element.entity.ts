import {
  Check,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Enum,
} from '@mikro-orm/core';
import { Complex } from './complex.entity';
import { Exercise } from './exercise.entity';
import { Workout } from './workout.entity';

export const WORKOUT_ELEMENT_TYPES = {
  EXERCISE: 'exercise',
  COMPLEX: 'complex',
} as const;

export type WorkoutElementType =
  (typeof WORKOUT_ELEMENT_TYPES)[keyof typeof WORKOUT_ELEMENT_TYPES];

@Entity()
@Check({
  name: 'check_one_element_type',
  expression: `
    (type = 'exercise' AND exercise_id IS NOT NULL AND complex_id IS NULL) OR
    (type = 'complex' AND complex_id IS NOT NULL AND exercise_id IS NULL)
  `,
})
export class WorkoutElement {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  // @Property({ type: 'string' })
  // @Check({ 
  //   name: 'valid_workout_element_type',
  //   expression: `type IN ('exercise', 'complex')`
  // })
  @Enum({ items: () => Object.values(WORKOUT_ELEMENT_TYPES) })
  type!: WorkoutElementType;

  @ManyToOne(() => Workout)
  workout!: Workout;

  @ManyToOne(() => Exercise, { nullable: true })
  exercise?: Exercise;

  @ManyToOne(() => Complex, { nullable: true })
  complex?: Complex;

  @Property()
  order!: number;

  @Property({ default: 1 })
  sets!: number;

  @Property({ default: 1 })
  reps!: number;

  @Property({ nullable: true })
  rest?: number;

  @Property({ nullable: true })
  duration?: number;

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: true })
  startWeight_percent?: number;

  @Property({ nullable: true })
  endWeight_percent?: number;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
