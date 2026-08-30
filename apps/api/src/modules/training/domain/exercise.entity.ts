import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Media } from '../../media/media.entity';
import { PersonalRecordEntity } from '../../database/entities/personal-record.entity';
import { ExerciseCategory } from './exercise-category.entity';
import { ExerciseComplex } from './exercise-complex.entity';
import { User } from '../../auth/domain/auth/user.entity';

@Entity()
export class Exercise {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  englishName!: string | null;

  @Property({ nullable: true })
  shortName!: string | null;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => User, { nullable: true, deleteRule: 'cascade' })
  createdBy!: User | null;

  @ManyToOne(() => ExerciseCategory)
  exerciseCategory!: ExerciseCategory;

  @ManyToOne(() => Media, { nullable: true })
  video!: Media | null;

  @OneToMany(
    () => ExerciseComplex,
    (exerciseComplex) => exerciseComplex.exercise
  )
  complexes = new Collection<ExerciseComplex>(this);

  @OneToMany(
    () => PersonalRecordEntity,
    (personalRecord) => personalRecord.exercise
  )
  personalRecords = new Collection<PersonalRecordEntity>(this);
}
