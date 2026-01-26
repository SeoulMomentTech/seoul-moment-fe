import { describe, it, expect } from 'vitest';

import { isHexCode } from './color';

describe('isHexCode', () => {
  it('should return true for valid 6-digit hex codes', () => {
    expect(isHexCode('#ffffff')).toBe(true);
    expect(isHexCode('#000000')).toBe(true);
    expect(isHexCode('#FF0000')).toBe(true);
    expect(isHexCode('#1a2b3c')).toBe(true);
  });

  it('should return true for valid 3-digit hex codes', () => {
    expect(isHexCode('#fff')).toBe(true);
    expect(isHexCode('#000')).toBe(true);
    expect(isHexCode('#F00')).toBe(true);
  });

  it('should return false for invalid hex codes', () => {
    expect(isHexCode('ffffff')).toBe(false); // No #
    expect(isHexCode('#ff')).toBe(false); // Too short
    expect(isHexCode('#ffff')).toBe(false); // Invalid length (4)
    expect(isHexCode('#fffff')).toBe(false); // Invalid length (5)
    expect(isHexCode('#fffffff')).toBe(false); // Too long
    expect(isHexCode('#gggggg')).toBe(false); // Invalid characters
    expect(isHexCode('')).toBe(false);
  });
});