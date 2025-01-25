import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class TrainingParams {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ default: 1 })
  sets!: number;

  @Property({ default: 1 })
  reps!: number;

  @Property({ nullable: true })
  rest?: number;

  @Property({ nullable: true })
  duration?: number;

  @Property({ nullable: true })
  startWeight_percent?: number;

  @Property({ nullable: true })
  endWeight_percent?: number;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
