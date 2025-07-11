import { CompetitorLevel, SexCategory } from '@dropit/schemas';
import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Athlete } from './athlete.entity';

@Entity()
export class CompetitorStatus {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Enum(() => CompetitorLevel)
  level!: CompetitorLevel;

  @Enum(() => SexCategory)
  sexCategory!: SexCategory;

  @Property({ nullable: true })
  weightCategory?: number;

  @Property({ nullable: true })
  endDate?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => Athlete)
  athlete!: Athlete;
}
