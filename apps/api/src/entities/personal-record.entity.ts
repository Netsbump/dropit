import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Exercise } from './exercise.entity';
import { Member } from './member.entity';

@Entity()
export class PersonalRecord {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => Exercise)
  exercise!: Exercise;

  @Property({ type: 'float' })
  weight!: number;

  @ManyToOne(() => Member)
  athlete!: Member;

  @Property()
  date: Date = new Date();

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
