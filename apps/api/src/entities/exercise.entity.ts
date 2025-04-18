import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { ExerciseCategory } from './exercise-category.entity';
import { ExerciseComplex } from './exercise-complex.entity';
import { Media } from './media.entity';
import { PersonalRecord } from './personal-record.entity';

@Entity()
export class Exercise {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: true })
  englishName?: string;

  @Property({ nullable: true })
  shortName?: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => ExerciseCategory)
  exerciseCategory!: ExerciseCategory;

  @ManyToOne(() => Media, { nullable: true })
  video?: Media;

  @OneToMany(
    () => ExerciseComplex,
    (exerciseComplex) => exerciseComplex.exercise
  )
  complexes = new Collection<ExerciseComplex>(this);

  @OneToMany(
    () => PersonalRecord,
    (personalRecord) => personalRecord.exercise
  )
  personalRecords = new Collection<PersonalRecord>(this);
}
