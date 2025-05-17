import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { AthleteRepository } from '../modules/athlete/athlete.repository';
import { User } from '../modules/auth/auth.entity';
import { AthleteSession } from './athlete-session.entity';
import { Club } from './club.entity';
import { CompetitorStatus } from './competitor-status.entity';
import { PersonalRecord } from './personal-record.entity';
import { PhysicalMetric } from './physical-metric.entity';

@Entity({ repository: () => AthleteRepository })
export class Athlete {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  firstName!: string;

  @Property()
  lastName!: string;

  @Property()
  birthday!: Date;

  @Property({ nullable: true })
  country?: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @OneToOne(() => User, { owner: true, nullable: true })
  user?: User;

  @ManyToOne(() => Club)
  club!: Club;

  @OneToMany(
    () => AthleteSession,
    (athleteSession) => athleteSession.athlete
  )
  sessions = new Collection<AthleteSession>(this);

  @OneToMany(
    () => PhysicalMetric,
    (physicalMetric) => physicalMetric.athlete
  )
  physicalMetrics = new Collection<PhysicalMetric>(this);

  @OneToMany(
    () => PersonalRecord,
    (personalRecord) => personalRecord.athlete
  )
  personalRecords = new Collection<PersonalRecord>(this);

  @OneToMany(
    () => CompetitorStatus,
    (competitorStatus) => competitorStatus.athlete
  )
  competitorStatuses = new Collection<CompetitorStatus>(this);
}
