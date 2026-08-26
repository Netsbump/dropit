import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Exercise } from '../../training/domain/exercise.entity';
import { AthleteEntity } from './athlete.entity';

@Entity({ tableName: 'personal_record' })
export class PersonalRecordEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'float' })
  weight!: number;

  @Property()
  date: Date = new Date();

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => AthleteEntity)
  athlete!: AthleteEntity;

  @ManyToOne(() => Exercise)
  exercise!: Exercise;
}
