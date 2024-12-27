import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

interface VideoMetadata {
  title: string;
  description: string;
  thumbnail: string;
}

@Entity()
export class Video {
  @PrimaryKey()
  id!: number;

  @Property()
  src!: string;

  @Property({ nullable: true })
  metadata?: VideoMetadata;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
