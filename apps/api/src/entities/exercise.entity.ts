import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { ExerciseType } from './exerciseType.entity';
import { Video } from './video.entity';

@Entity()
export class Exercise {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => ExerciseType)
  exerciseType!: ExerciseType;

  @ManyToOne(() => Video)
  video?: Video;

  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: true })
  englishName?: string;

  @Property({ nullable: true })
  shortName?: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
