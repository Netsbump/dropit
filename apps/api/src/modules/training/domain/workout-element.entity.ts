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
import { BlockConfigDto } from '@dropit/schemas';

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

  @Enum({ items: () => Object.values(WORKOUT_ELEMENT_TYPES) })
  type!: WorkoutElementType;

  @ManyToOne(() => Workout, { deleteRule: 'cascade' })
  workout!: Workout;

  @ManyToOne(() => Exercise, { nullable: true, deleteRule: 'cascade' })
  exercise?: Exercise;

  @ManyToOne(() => Complex, { nullable: true, deleteRule: 'cascade' })
  complex?: Complex;

  @Property({ type: 'jsonb' })
  blocks: BlockConfigDto[] = [];

  @Property()
  order!: number;

  @Property({ nullable: true })
  tempo?: string;

  @Property({ nullable: true })
  commentary?: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
