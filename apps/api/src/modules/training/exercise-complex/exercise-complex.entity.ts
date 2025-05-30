import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Complex } from '../complex/complex.entity';
import { Exercise } from '../exercise/exercise.entity';

@Entity()
export class ExerciseComplex {
  @ManyToOne(() => Complex, { primary: true })
  complex!: Complex;

  @ManyToOne(() => Exercise, { primary: true })
  exercise!: Exercise;

  @Property()
  order!: number;

  @Property({ default: 1 })
  reps!: number;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
