import { describe, it, expect } from 'vitest';

import type { ProductFormValues, VariantForm } from './types';
import {
  createInitialValues,
  duplicateVariant,
  findDuplicateOptionNumbers,
  findDuplicateSkuNumbers,
  parseOptionValueIds,
  validateProductForm,
} from './utils';

const variant = (sku: string, optionValueIds: string): VariantForm => ({
  sku,
  stockQuantity: '10',
  optionValueIds,
  optionValueBadgeList: [],
});

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

  it('should filter out negative numbers', () => {
    const input = '1,-5,2';
    const result = parseOptionValueIds(input);
    expect(result).toEqual([1, 2]);
  });

  it('should filter out floating point numbers', () => {
    const input = '1, 2.5, 3';
    const result = parseOptionValueIds(input);
    expect(result).toEqual([1, 3]);
  });

  it('should handle complex mixed input', () => {
    const input = '1, 0, -5, 2.5, abc, 3, , ';
    const result = parseOptionValueIds(input);
    expect(result).toEqual([1, 3]);
  });
});

describe('duplicateVariant', () => {
  it('should copy sku, stock and options', () => {
    const source: VariantForm = {
      sku: 'NK-RED-M',
      stockQuantity: '5',
      optionValueIds: '1, 2',
      optionValueBadgeList: [
        { id: 1, label: '빨강' },
        { id: 2, label: 'M' },
      ],
    };
    const copy = duplicateVariant(source);

    expect(copy).toEqual(source);
    expect(copy.optionValueBadgeList).not.toBe(source.optionValueBadgeList);
  });
});

describe('findDuplicateOptionNumbers', () => {
  it('should ignore option order', () => {
    expect(
      findDuplicateOptionNumbers([
        variant('A', '1, 2'),
        variant('B', '3'),
        variant('C', '2, 1'),
      ]),
    ).toEqual([1, 3]);
  });

  it('should return undefined when combinations differ', () => {
    expect(
      findDuplicateOptionNumbers([variant('A', '1, 2'), variant('B', '1, 3')]),
    ).toBeUndefined();
  });

  it('should skip variants without options', () => {
    expect(
      findDuplicateOptionNumbers([variant('A', ''), variant('B', '')]),
    ).toBeUndefined();
  });
});

describe('findDuplicateSkuNumbers', () => {
  it('should ignore surrounding whitespace', () => {
    expect(
      findDuplicateSkuNumbers([
        variant('NK-RED-M', '1'),
        variant('NK-RED-L', '2'),
        variant(' NK-RED-M ', '3'),
      ]),
    ).toEqual([1, 3]);
  });

  it('should skip empty skus', () => {
    expect(
      findDuplicateSkuNumbers([variant('', '1'), variant('  ', '2')]),
    ).toBeUndefined();
  });
});

describe('validateProductForm variants', () => {
  const baseValues = (variants: VariantForm[]): ProductFormValues => ({
    ...createInitialValues(),
    productId: '1',
    price: '1000',
    shippingCost: '0',
    shippingInfo: '1',
    mainImagePreview: 'https://example.com/a.png',
    variants,
  });

  it('should reject duplicate option combinations', () => {
    const errors = validateProductForm(
      baseValues([variant('A', '1, 2'), variant('B', '2, 1')]),
    );
    expect(errors.variants).toBe(
      '옵션 값 조합이 같은 변형이 있습니다. (변형 #1, 변형 #2)',
    );
  });

  it('should reject duplicate skus', () => {
    const errors = validateProductForm(
      baseValues([variant('A', '1'), variant('B', '2'), variant('A', '3')]),
    );
    expect(errors.variants).toBe(
      'SKU가 같은 변형이 있습니다. (변형 #1, 변형 #3)',
    );
  });

  it('should report duplicate skus before duplicate options', () => {
    const source = variant('A', '1');
    const errors = validateProductForm(
      baseValues([source, duplicateVariant(source)]),
    );
    expect(errors.variants).toBe(
      'SKU가 같은 변형이 있습니다. (변형 #1, 변형 #2)',
    );
  });

  it('should report missing fields before duplicates', () => {
    const errors = validateProductForm(
      baseValues([variant('A', '1'), variant('', '1')]),
    );
    expect(errors.variants).toBe('옵션(재고) 정보를 모두 입력해주세요.');
  });
});
