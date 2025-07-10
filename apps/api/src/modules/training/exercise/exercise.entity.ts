import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Media } from '../../core/media/media.entity';
import { PersonalRecord } from '../../athletes/personal-record/personal-record.entity';
import { ExerciseCategory } from '../exercise-category/exercise-category.entity';
import { ExerciseComplex } from '../exercise-complex/exercise-complex.entity';
import { User } from '../../identity/auth/auth.entity';

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

  @ManyToOne(() => User, { nullable: true })
  createdBy!: User | null;

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
