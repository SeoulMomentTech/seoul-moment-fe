import { describe, it, expect } from 'vitest';

import { parseOptionValueIds } from './utils';

describe('parseOptionValueIds', () => {
  it('should parse valid comma-separated IDs', () => {
    const input = '1,2,3';
    const result = parseOptionValueIds(input);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should handle whitespace', () => {
    const input = ' 1 , 2 , 3 ';
    const result = parseOptionValueIds(input);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should filter out 0', () => {
    const input = '1,0,2,0';
    const result = parseOptionValueIds(input);
    expect(result).toEqual([1, 2]);
  });

  it('should filter out non-number values', () => {
    const input = '1,abc,2';
    const result = parseOptionValueIds(input);
    expect(result).toEqual([1, 2]);
  });

  it('should handle empty string', () => {
    const input = '';
    const result = parseOptionValueIds(input);
    expect(result).toEqual([]);
  });

  it('should handle negative numbers', () => {
    // Assuming negative numbers are valid or at least not filtered by the "0" check
    const input = '1,-5,2';
    const result = parseOptionValueIds(input);
    expect(result).toEqual([1, -5, 2]);
  });
});
