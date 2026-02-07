import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Media {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  url!: string;

  @Property()
  bucket!: string;

  @Property({ nullable: true })
  fileName?: string;

  @Property({ nullable: true })
  mimeType?: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
