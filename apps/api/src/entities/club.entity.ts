import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Media } from './media.entity';

@Entity()
export class Club {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ unique: true })
  name!: string;

  @ManyToOne(() => Media, { nullable: true })
  logo?: Media;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
