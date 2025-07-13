import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Workout } from './workout.entity';
import { User } from '../../identity/domain/auth/user.entity';

@Entity()
export class WorkoutCategory {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  name!: string;

  @OneToMany(
    () => Workout,
    (workout) => workout.category
  )
  workouts = new Collection<Workout>(this);

  @ManyToOne(() => User, { nullable: true })
  createdBy!: User | null;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
