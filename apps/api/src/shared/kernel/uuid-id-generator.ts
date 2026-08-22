import { randomUUID } from 'node:crypto';
import type { IdGenerator } from './id-generator.port';

export class UuidIdGenerator implements IdGenerator {
  generate(): string {
    return randomUUID();
  }
}
