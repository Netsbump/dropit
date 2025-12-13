import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { ComplexCategory } from './complex-category.entity';
import { ExerciseComplex } from './exercise-complex.entity';
import { User } from '../../identity/domain/auth/user.entity';

@Entity()
export class Complex {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => ComplexCategory)
  complexCategory!: ComplexCategory;

  @OneToMany(
    () => ExerciseComplex,
    (exerciseComplex) => exerciseComplex.complex
  )
  exercises = new Collection<ExerciseComplex>(this);

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => User, { nullable: true, deleteRule: 'cascade'})
  createdBy!: User | null;
}
