import type { IdGenerator } from './id-generator.port';
import { createUuid } from './uuid';

export class UuidIdGenerator implements IdGenerator {
  generate(): string {
    return createUuid();
  }
}
