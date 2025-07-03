import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Athlete } from '../../members/athlete/domain/athlete.entity';

@Entity()
export class PhysicalMetric {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ nullable: true })
  weight?: number;

  @Property({ type: 'float', nullable: true })
  height?: number;

  @Property()
  date!: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => Athlete)
  athlete!: Athlete;
}
