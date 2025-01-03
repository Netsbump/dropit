import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

interface VideoMetadata {
  title: string;
  description: string;
  thumbnail: string;
}

@Entity()
export class Video {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  src!: string;

  @Property({ nullable: true })
  metadata?: VideoMetadata;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
