import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Test {
  @PrimaryKey()
  id!: number;

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
