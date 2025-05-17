import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Athlete } from '../../members/athlete/athlete.entity';
import { Exercise } from '../../training/exercise/exercise.entity';

@Entity()
export class PersonalRecord {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ type: 'float' })
  weight!: number;

  @Property()
  date: Date = new Date();

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => Athlete)
  athlete!: Athlete;

  @ManyToOne(() => Exercise)
  exercise!: Exercise;
}
