import {
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { ClubName } from './club-name.entity';
import { Media } from './media.entity';

@Entity()
export class Club {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @OneToOne(() => ClubName, { owner: true })
  clubName!: ClubName;

  @ManyToOne(() => Media, { nullable: true })
  logo?: Media;

  @Property()
  endDate?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
