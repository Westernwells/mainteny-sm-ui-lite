import {describe, it, expect} from 'vitest';
import type {
  EditableInvoiceItem,
  InvoiceItemAmount,
  InvoiceSubItemAmount,
} from 'models/invoice';
import {calculateLaborMaterialTotals} from 'utils/invoice';
import {
  uiItemLabor,
  detailLabor100,
  uiItemMaterial,
  detailMaterial250,
  uiItemPackage50And50,
  detailPackage200,
  uiItemMixLaborMaterial,
  subPayment70,
  subPayment30,
  uiItemMixPackage40And60,
  subPayment100,
  uiItemComboLabor,
  uiItemComboPackage25And75,
  uiItemComboMix,
  makePayment,
} from './mocks/calculateLaborMaterial';

describe('calculateLaborMaterialTotals', () => {
  it('handles a single LABOR item', () => {
    const uiItems: EditableInvoiceItem[] = [uiItemLabor as EditableInvoiceItem];

    const detailItems: InvoiceItemAmount[] = [
      detailLabor100 as InvoiceItemAmount,
    ];

    const result = calculateLaborMaterialTotals(uiItems, detailItems);
    expect(result).toEqual({laborNet: 100, materialNet: 0});
  });

  it('handles a single MATERIAL item', () => {
    const uiItems: EditableInvoiceItem[] = [
      uiItemMaterial as EditableInvoiceItem,
    ];

    const detailItems: InvoiceItemAmount[] = [
      detailMaterial250 as InvoiceItemAmount,
    ];

    const result = calculateLaborMaterialTotals(uiItems, detailItems);
    expect(result).toEqual({laborNet: 0, materialNet: 250});
  });

  it('splits a PACKAGE item according to costPackage percentages', () => {
    const uiItems: EditableInvoiceItem[] = [
      uiItemPackage50And50 as EditableInvoiceItem,
    ];

    const detailItems: InvoiceItemAmount[] = [
      detailPackage200 as InvoiceItemAmount,
    ];

    const result = calculateLaborMaterialTotals(uiItems, detailItems);
    expect(result).toEqual({laborNet: 100, materialNet: 100});
  });

  it('counts subItems for a MIX with LABOR and MATERIAL', () => {
    const uiItems: EditableInvoiceItem[] = [
      uiItemMixLaborMaterial as EditableInvoiceItem,
    ];

    const detailItems: InvoiceItemAmount[] = [
      {
        subItems: [
          subPayment70 as InvoiceSubItemAmount,
          subPayment30 as InvoiceSubItemAmount,
        ],
      } as InvoiceItemAmount,
    ];

    const result = calculateLaborMaterialTotals(uiItems, detailItems);
    expect(result).toEqual({laborNet: 70, materialNet: 30});
  });

  it('splits a PACKAGE subItem under MIX', () => {
    const uiItems: EditableInvoiceItem[] = [
      uiItemMixPackage40And60 as EditableInvoiceItem,
    ];

    const detailItems: InvoiceItemAmount[] = [
      {
        subItems: [subPayment100 as InvoiceSubItemAmount],
      } as InvoiceItemAmount,
    ];

    const result = calculateLaborMaterialTotals(uiItems, detailItems);
    expect(result).toEqual({laborNet: 40, materialNet: 60});
  });

  it('combines multiple items and subItems correctly', () => {
    const laborItem: EditableInvoiceItem =
      uiItemComboLabor as EditableInvoiceItem;

    const packageItem: EditableInvoiceItem =
      uiItemComboPackage25And75 as EditableInvoiceItem;

    const mixItem: EditableInvoiceItem = uiItemComboMix as EditableInvoiceItem;

    const uiItems: EditableInvoiceItem[] = [laborItem, packageItem, mixItem];

    const detailLabor: Partial<InvoiceItemAmount> = {payment: makePayment(0)};
    const detailPackage: Partial<InvoiceItemAmount> = {payment: makePayment(0)};
    const detailMix: Partial<InvoiceItemAmount> = {
      subItems: [
        {payment: makePayment(0)} as InvoiceSubItemAmount,
        {payment: makePayment(0)} as InvoiceSubItemAmount,
      ],
    };

    const detailItems: InvoiceItemAmount[] = [
      detailLabor as InvoiceItemAmount,
      detailPackage as InvoiceItemAmount,
      detailMix as InvoiceItemAmount,
    ];

    detailItems[0].payment.amount!.netAmount = 120;
    detailItems[1].payment.amount!.netAmount = 200;
    detailItems[2].subItems![0].payment.amount!.netAmount = 80;
    detailItems[2].subItems![1].payment.amount!.netAmount = 100;

    const result = calculateLaborMaterialTotals(uiItems, detailItems);
    expect(result).toEqual({laborNet: 180, materialNet: 320});
  });
});
