import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Test {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property()
  name!: string;

  constructor(name: string) {
    this.name = name;
  }
}
