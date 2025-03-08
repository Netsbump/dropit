import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Member } from './member.entity';

@Entity()
export class CoachAthlete {
  @ManyToOne(() => Member, { primary: true })
  coach!: Member;

  @ManyToOne(() => Member, { primary: true })
  athlete!: Member;

  @Property()
  startDate: Date = new Date();

  @Property({ nullable: true })
  endDate?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
