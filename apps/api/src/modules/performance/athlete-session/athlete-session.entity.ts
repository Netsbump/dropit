import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Athlete } from '../../members/athlete/athlete.entity';
import { Session } from '../session/session.entity';

@Entity()
export class AthleteSession {
  @ManyToOne(() => Athlete, { primary: true })
  athlete!: Athlete;

  @ManyToOne(() => Session, { primary: true })
  session!: Session;

  @Property({ nullable: true })
  notes_athlete?: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
