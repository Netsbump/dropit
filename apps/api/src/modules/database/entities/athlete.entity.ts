import {
  Collection,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { User } from '../../auth/domain/auth/user.entity';
import { AthleteTrainingSession } from '../../training/domain/athlete-training-session.entity';
import { CompetitorStatusEntity } from './competitor-status.entity';
import { PersonalRecordEntity } from './personal-record.entity';
import { PhysicalMetricEntity } from './physical-metric.entity';

@Entity({ tableName: 'athlete' })
export class AthleteEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  firstName!: string;

  @Property()
  lastName!: string;

  @Property({ nullable: true })
  birthday!: Date | null;

  @Property({ nullable: true })
  country!: string | null;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @OneToOne(() => User, { owner: true, deleteRule: 'cascade' })
  user!: User;

  @OneToMany(
    () => AthleteTrainingSession,
    (athleteTrainingSession) => athleteTrainingSession.athlete
  )
  trainingSessions = new Collection<AthleteTrainingSession>(this);

  @OneToMany(
    () => PhysicalMetricEntity,
    (physicalMetric) => physicalMetric.athlete
  )
  physicalMetrics = new Collection<PhysicalMetricEntity>(this);

  @OneToMany(
    () => PersonalRecordEntity,
    (personalRecord) => personalRecord.athlete
  )
  personalRecords = new Collection<PersonalRecordEntity>(this);

  @OneToMany(
    () => CompetitorStatusEntity,
    (competitorStatus) => competitorStatus.athlete
  )
  competitorStatuses = new Collection<CompetitorStatusEntity>(this);
}
