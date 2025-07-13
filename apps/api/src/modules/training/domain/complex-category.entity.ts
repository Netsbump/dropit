import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Complex } from './complex.entity';
import { User } from '../../identity/domain/auth/user.entity';

@Entity()
export class ComplexCategory {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @OneToMany(
    () => Complex,
    (complex) => complex.complexCategory
  )
  complexes = new Collection<Complex>(this);

  @Property()
  name!: string;

  @ManyToOne(() => User, { nullable: true })
  createdBy!: User | null;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
