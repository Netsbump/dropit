import { describe, expect, it } from 'vitest';
import { createUuid, isUuid, parseUuid } from './uuid';

const validUuid = '0c4a4c20-7c6d-417e-87ec-77c9170e9cc3';

describe('uuid helpers', () => {
  it('accepts standard UUID values', () => {
    expect(isUuid(validUuid)).toBe(true);
    expect(parseUuid(validUuid)).toBe(validUuid);
  });

  it('rejects invalid UUID values', () => {
    expect(isUuid('not-a-uuid')).toBe(false);
    expect(() => parseUuid('not-a-uuid')).toThrow('Invalid UUID: not-a-uuid');
  });

  it('generates valid UUID values', () => {
    expect(isUuid(createUuid())).toBe(true);
  });
});
