import {describe, it, expect} from 'vitest';
import {getDecimalSeparator, getThousandsSeparator} from 'utils/currency';

describe('getDecimalSeparator()', () => {
  it('returns comma for German (DE) locale', () => {
    expect(getDecimalSeparator('DE')).toBe(',');
  });

  it('returns comma for Serbian (SR) locale', () => {
    expect(getDecimalSeparator('SR')).toBe(',');
  });

  it('returns dot for other locales', () => {
    expect(getDecimalSeparator('EN')).toBe('.');
    expect(getDecimalSeparator('US')).toBe('.');
    expect(getDecimalSeparator('')).toBe('.');
  });
});

describe('getThousandsSeparator()', () => {
  it('returns dot for German (DE) locale', () => {
    expect(getThousandsSeparator('DE')).toBe('.');
  });

  it('returns dot for Serbian (SR) locale', () => {
    expect(getThousandsSeparator('SR')).toBe('.');
  });

  it('returns comma for other locales', () => {
    expect(getThousandsSeparator('EN')).toBe(',');
    expect(getThousandsSeparator('US')).toBe(',');
    expect(getThousandsSeparator('')).toBe(',');
  });
});
