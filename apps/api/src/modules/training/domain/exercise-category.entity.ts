import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Exercise } from './exercise.entity';
import { User } from '../../identity/domain/auth/user.entity';

@Entity()
export class ExerciseCategory {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @OneToMany(
    () => Exercise,
    (exercise) => exercise.exerciseCategory
  )
  exercises = new Collection<Exercise>(this);

  @Property()
  name!: string;

  @ManyToOne(() => User, { nullable: true })
  createdBy!: User | null;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
