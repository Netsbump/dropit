import {
  Collection,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { AthleteTrainingSession } from '../../training/domain/athlete-training-session.entity'
import { CompetitorStatus } from './competitor-status.entity';
import { PersonalRecord } from './personal-record.entity';
import { PhysicalMetric } from './physical-metric.entity';
import { User } from '../../identity/domain/auth/user.entity';

@Entity()
export class Athlete {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  firstName!: string;

  @Property()
  lastName!: string;

  @Property({ nullable: true })
  birthday?: Date;

  @Property({ nullable: true })
  country?: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @OneToOne(() => User, { owner: true })
  user!: User;

  @OneToMany(
    () => AthleteTrainingSession,
    (athleteTrainingSession) => athleteTrainingSession.athlete
  )
  trainingSessions = new Collection<AthleteTrainingSession>(this);

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
