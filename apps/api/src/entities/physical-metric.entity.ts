import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Athlete } from './athlete.entity';

@Entity()
export class PhysicalMetric {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => Athlete)
  athlete!: Athlete;

  @Property({ nullable: true })
  weight?: number;

  @Property({ type: 'float', nullable: true })
  height?: number;

  @Property()
  startDate: Date = new Date();

  @Property({ nullable: true })
  endDate?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
