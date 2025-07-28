import {describe, it, expect} from 'vitest';
import type {EditableQuotationItem} from 'models/quotation';
import type {VatView} from 'models/vat';
import {
  syncVatLegalNotesWithNotes,
  removeObsoleteVatNotes,
} from 'utils/article-utils';

import {taxRatesOne, prevTaxRates, prevTaxRatesTwo} from './mocks/tax-rates';
import {
  oldItemsForVatChange,
  newItemsForVatChange,
  oldItemsForObsoleteVat,
  newItemsForObsoleteVat,
  oldItemsForUnchangedVat,
  newItemsForUnchangedVat,
} from './mocks/mixed-position';

describe('syncVatLegalNotesWithNotes / removeObsoleteVatNotes', () => {
  it('appends a new VAT legal note when an item’s VAT changes', () => {
    const currentNotes = '';
    const updatedNotes = syncVatLegalNotesWithNotes({
      oldArticles: oldItemsForVatChange as EditableQuotationItem[],
      newArticles: newItemsForVatChange as EditableQuotationItem[],
      currentNotes,
      taxRates: taxRatesOne as VatView[],
    });

    expect(updatedNotes).toContain('Test for 7%');
  });

  it('does not duplicate a VAT note if it’s already present', () => {
    const currentNotes = '<p>Test for 7%</p>';
    const updatedNotes = syncVatLegalNotesWithNotes({
      oldArticles: oldItemsForVatChange.filter(
        (item) => item.unitAmount?.percentageVat === 7,
      ) as EditableQuotationItem[],
      newArticles: newItemsForVatChange.filter(
        (item) => item.unitAmount?.percentageVat === 7,
      ) as EditableQuotationItem[],
      currentNotes,
      taxRates: taxRatesOne as VatView[],
    });

    expect(updatedNotes).toBe('<p>Test for 7%</p>');
  });

  it('removes obsolete VAT notes when a VAT is dropped', () => {
    const currentNotes =
      '<p>Test for 7%</p><p>Test name for 19%</p><p>Testing 12%</p>';

    const resultNotes = removeObsoleteVatNotes(
      currentNotes,
      oldItemsForObsoleteVat as EditableQuotationItem[],
      newItemsForObsoleteVat as EditableQuotationItem[],
      prevTaxRatesTwo as VatView[],
    );

    expect(resultNotes).toContain('Test for 7%');
    expect(resultNotes).toContain('Testing 12%');
    expect(resultNotes).not.toContain('Test name for 19%');
  });

  it('keeps notes for VATs that remain unchanged', () => {
    const currentNotes = '<p>Test for 7%</p>';

    const resultNotes = removeObsoleteVatNotes(
      currentNotes,
      oldItemsForUnchangedVat as EditableQuotationItem[],
      newItemsForUnchangedVat as EditableQuotationItem[],
      prevTaxRates as VatView[],
    );

    expect(resultNotes).toBe('<p>Test for 7%</p>');
  });
});
