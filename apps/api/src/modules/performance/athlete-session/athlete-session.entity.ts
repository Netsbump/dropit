import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Athlete } from '../../members/athlete/athlete.entity';
import { TrainingSession } from '../session/session.entity';

@Entity()
export class AthleteSession {
  @ManyToOne(() => Athlete, { primary: true })
  athlete!: Athlete;

  @ManyToOne(() => TrainingSession, { primary: true })
  session!: TrainingSession;

  @Property({ nullable: true })
  notes_athlete?: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
