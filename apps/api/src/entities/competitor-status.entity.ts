import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Member } from './member.entity';

export enum CompetitorLevel {
  ROOKIE = 'rookie',
  REGIONAL = 'regional',
  NATIONAL = 'national',
  INTERNATIONAL = 'international',
  ELITE = 'elite',
}

export enum SexCategory {
  MEN = 'men',
  WOMEN = 'women',
}

@Entity()
export class CompetitorStatus {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => Member)
  member!: Member;

  @Enum(() => CompetitorLevel)
  level!: CompetitorLevel;

  @Enum(() => SexCategory)
  sexCategory!: SexCategory;

  @Property({ nullable: true })
  weightCategory?: string;

  @Property()
  startDate: Date = new Date();

  @Property({ nullable: true })
  endDate?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
