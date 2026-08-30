import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { AthleteEntity } from './athlete.entity';

@Entity({ tableName: 'physical_metric' })
export class PhysicalMetricEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ nullable: true })
  weight!: number | null;

  @Property({ type: 'float', nullable: true })
  height!: number | null;

  @Property()
  date!: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => AthleteEntity)
  athlete!: AthleteEntity;
}
