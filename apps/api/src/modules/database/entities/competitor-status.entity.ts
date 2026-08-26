import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import {
  CompetitorLevel,
  SexCategory,
} from '../../athletes/domain/competitor-status';
import { AthleteEntity } from './athlete.entity';

@Entity({ tableName: 'competitor_status' })
export class CompetitorStatusEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Enum(() => CompetitorLevel)
  level!: CompetitorLevel;

  @Enum(() => SexCategory)
  sexCategory!: SexCategory;

  @Property({ nullable: true })
  weightCategory!: number | null;

  @Property({ nullable: true })
  endDate!: Date | null;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => AthleteEntity)
  athlete!: AthleteEntity;
}
