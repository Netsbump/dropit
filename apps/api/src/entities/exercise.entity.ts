import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { ExerciseCategory } from './exerciseCategory.entity';
import { Video } from './video.entity';

@Entity()
export class Exercise {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => ExerciseCategory)
  exerciseCategory!: ExerciseCategory;

  @ManyToOne(() => Video, { nullable: true })
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
