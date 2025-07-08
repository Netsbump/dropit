import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Athlete } from '../../../members/athlete/domain/athlete.entity';
import { TrainingSession } from './training-session.entity';

@Entity()
export class AthleteTrainingSession {
  @ManyToOne(() => Athlete, { primary: true })
  athlete!: Athlete;

  @ManyToOne(() => TrainingSession, { primary: true })
  trainingSession!: TrainingSession;

  @Property({ nullable: true })
  notes_athlete?: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
