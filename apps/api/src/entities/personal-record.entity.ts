import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Athlete } from './athlete.entity';
import { Exercise } from './exercise.entity';

@Entity()
export class PersonalRecord {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => Exercise)
  exercise!: Exercise;

  @Property({ type: 'float' })
  weight!: number;

  @ManyToOne(() => Athlete)
  athlete!: Athlete;

  @Property()
  date: Date = new Date();

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
