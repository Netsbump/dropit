import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Exercise } from './exercise.entity';

@Entity()
export class ExerciseType {
  @PrimaryKey()
  id!: number;

  @OneToMany(
    () => Exercise,
    (exercise) => exercise.exerciseType
  )
  exercises = new Collection<Exercise>(this);

  @Property()
  name!: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
