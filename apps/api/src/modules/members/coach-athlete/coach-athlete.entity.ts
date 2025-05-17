import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Athlete } from '../athlete/athlete.entity';

@Entity()
export class CoachAthlete {
  @ManyToOne(() => Athlete, { primary: true })
  coach!: Athlete;

  @ManyToOne(() => Athlete, { primary: true })
  athlete!: Athlete;

  @Property()
  startDate: Date = new Date();

  @Property({ nullable: true })
  endDate?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
