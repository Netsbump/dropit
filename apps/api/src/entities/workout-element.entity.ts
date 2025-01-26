import {
  Check,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Complex } from './complex.entity';
import { Exercise } from './exercise.entity';
import { TrainingParams } from './training-params.entity';
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
    (CASE WHEN exercise_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN complex_id IS NOT NULL THEN 1 ELSE 0 END) = 1
  `,
})
export class WorkoutElement {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  type!: WorkoutElementType;

  @ManyToOne(() => Workout)
  workout!: Workout;

  @ManyToOne(() => Exercise, { nullable: true })
  exercise?: Exercise;

  @ManyToOne(() => Complex, { nullable: true })
  complex?: Complex;

  @Property()
  order!: number;

  @ManyToOne(() => TrainingParams)
  trainingParams!: TrainingParams;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
