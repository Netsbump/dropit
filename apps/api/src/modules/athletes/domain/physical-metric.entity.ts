import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { AthleteEntity } from '../../database/entities/athlete.entity';

@Entity()
export class PhysicalMetric {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
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
