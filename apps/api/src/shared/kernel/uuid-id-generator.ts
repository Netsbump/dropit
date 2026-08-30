import type { IdGenerator } from './id-generator.port';
import { generateUuid } from '../utils/uuid';

export class UuidIdGenerator implements IdGenerator {
  generate(): string {
    return generateUuid();
  }
}
