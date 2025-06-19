import {describe, it, expect} from 'vitest';
import {resolveVatFromBackend} from 'utils/utils';
import {taxRatesOne} from './mocks/tax-rates';

describe('resolveVatFromBackend', () => {
  const taxRates = [taxRatesOne[0]];

  it('should use taxRates if vatId matches and percentageVat differs', () => {
    const result = resolveVatFromBackend(
      '3c4a5e70-a256-4744-b52d-b92105d4d122',
      0,
      '0%',
      taxRates,
    );

    expect(result).toEqual({
      percentageVat: 19,
      vatName: '19%',
    });
  });

  it('should fallback to backend if vatId matches and percentageVat matches', () => {
    const result = resolveVatFromBackend(
      '3c4a5e70-a256-4744-b52d-b92105d4d122',
      19,
      'Backend VAT Name',
      taxRates,
    );

    expect(result).toEqual({
      percentageVat: 19,
      vatName: 'Backend VAT Name',
    });
  });

  it('should fallback to backend if vatId is not found', () => {
    const result = resolveVatFromBackend('non-existing-id', 7, '7%', taxRates);

    expect(result).toEqual({
      percentageVat: 7,
      vatName: '7%',
    });
  });

  it('should fallback safely if vatId and percentageVat are undefined', () => {
    const result = resolveVatFromBackend(
      undefined,
      undefined,
      undefined,
      taxRates,
    );

    expect(result).toEqual({
      percentageVat: 0,
      vatName: '',
    });
  });
});
