import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Complex } from './complex.entity';
import { Exercise } from './exercise.entity';
import { TrainingParams } from './training-params.entity';

@Entity()
export class ExerciseComplex {
  @ManyToOne(() => Complex, { primary: true })
  complex!: Complex;

  @ManyToOne(() => Exercise, { primary: true })
  exercise!: Exercise;

  @Property()
  order!: number;

  @ManyToOne(() => TrainingParams)
  trainingParams!: TrainingParams;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
