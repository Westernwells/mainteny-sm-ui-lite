import {describe, expect, it} from 'vitest';
import {DiscountType, InvoiceItemRecord} from 'models/invoice';
import {calculateInvoiceAmount} from 'utils/calculate-total';

const createMockInvoiceItem = (
  overrides: Partial<InvoiceItemRecord> = {},
): InvoiceItemRecord => {
  const defaultItem: InvoiceItemRecord = {
    name: 'Default Article',
    unitAmount: {
      currency: 'EUR',
      netAmount: 5000,
      percentageVat: 15,
    },
    quantity: 1,
    discount: {
      type: DiscountType.NONE,
    },
  };

  return {
    ...defaultItem,
    ...overrides,
  };
};

describe('calculateInvoiceAmount', () => {
  it('should calculate invoice amount correctly (single VAT - no discounts)', () => {
    const mockItems = [
      createMockInvoiceItem({
        name: 'Article 1',
        unitAmount: {
          currency: 'EUR',
          netAmount: 100000,
          percentageVat: 7,
        },
        quantity: 1,
      }),
      createMockInvoiceItem({
        name: 'Article 2',
        unitAmount: {
          currency: 'EUR',
          netAmount: 200000,
          percentageVat: 7,
        },
        quantity: 2,
      }),
    ];
    const result = calculateInvoiceAmount({items: mockItems});

    expect(result).toStrictEqual({
      amountBeforeGlobalDiscount: 5000,
      amountAfterGlobalDiscount: 5000,
      vats: [{percentageVat: 7, vat: 350}],
      amountAfterGlobalDiscountWithVAT: 5350,
    });
  });

  it('should calculate invoice amount correctly (multiple VAT - no discounts)', () => {
    const mockItems = [
      createMockInvoiceItem({
        name: 'Article 1',
        unitAmount: {
          currency: 'EUR',
          netAmount: 100000,
          percentageVat: 7,
        },
        quantity: 1,
      }),
      createMockInvoiceItem({
        name: 'Article 2',
        unitAmount: {
          currency: 'EUR',
          netAmount: 200000,
          percentageVat: 7,
        },
        quantity: 2,
      }),
      createMockInvoiceItem({
        name: 'Article 3',
        unitAmount: {
          currency: 'EUR',
          netAmount: 200000,
          percentageVat: 19,
        },
        quantity: 2,
      }),
    ];
    const result = calculateInvoiceAmount({items: mockItems});

    expect(result).toStrictEqual({
      amountBeforeGlobalDiscount: 9000,
      amountAfterGlobalDiscount: 9000,
      vats: [
        {percentageVat: 7, vat: 350},
        {percentageVat: 19, vat: 760},
      ],
      amountAfterGlobalDiscountWithVAT: 10110,
    });
  });

  it('should calculate invoice amount correctly (single VAT)', () => {
    const mockItems = [
      createMockInvoiceItem({
        name: 'Article 1',
        unitAmount: {
          currency: 'EUR',
          netAmount: 100000,
          percentageVat: 7,
        },
        quantity: 1,
        discount: {
          type: DiscountType.PERCENTAGE,
          percentage: 10,
        },
      }),
      createMockInvoiceItem({
        name: 'Article 2',
        unitAmount: {
          currency: 'EUR',
          netAmount: 200000,
          percentageVat: 7,
        },
        quantity: 2,
        discount: {
          type: DiscountType.AMOUNT,
          amount: {
            value: 500,
            currency: 'EUR',
          },
        },
      }),
      createMockInvoiceItem({
        name: 'Article 3',
        unitAmount: {
          currency: 'EUR',
          netAmount: 200000,
          percentageVat: 7,
        },
        quantity: 2,
        discount: {
          type: DiscountType.PERCENTAGE,
          percentage: 15,
        },
      }),
    ];
    const result = calculateInvoiceAmount({
      items: mockItems,
      globalDiscount: {
        type: DiscountType.AMOUNT,
        amount: {
          value: 500,
          currency: 'EUR',
        },
      },
    });

    expect(result).toStrictEqual({
      amountBeforeGlobalDiscount: 7800,
      amountAfterGlobalDiscount: 7300,
      vats: [{percentageVat: 7, vat: 510.99}],
      amountAfterGlobalDiscountWithVAT: 7810.99,
    });
  });

  it('should calculate invoice amount correctly (multiple VAT)', () => {
    const mockItems = [
      createMockInvoiceItem({
        name: 'Article 1',
        unitAmount: {
          currency: 'EUR',
          netAmount: 100000,
          percentageVat: 7,
        },
        quantity: 1,
        discount: {
          type: DiscountType.PERCENTAGE,
          percentage: 10,
        },
      }),
      createMockInvoiceItem({
        name: 'Article 2',
        unitAmount: {
          currency: 'EUR',
          netAmount: 200000,
          percentageVat: 7,
        },
        quantity: 2,
        discount: {
          type: DiscountType.AMOUNT,
          amount: {
            value: 500,
            currency: 'EUR',
          },
        },
      }),
      createMockInvoiceItem({
        name: 'Article 3',
        unitAmount: {
          currency: 'EUR',
          netAmount: 200000,
          percentageVat: 19,
        },
        quantity: 2,
        discount: {
          type: DiscountType.PERCENTAGE,
          percentage: 15,
        },
      }),
    ];

    const result = calculateInvoiceAmount({
      items: mockItems,
      globalDiscount: {
        type: DiscountType.AMOUNT,
        amount: {
          value: 500,
          currency: 'EUR',
        },
      },
    });

    expect(result).toStrictEqual({
      amountBeforeGlobalDiscount: 7800,
      amountAfterGlobalDiscount: 7300,
      vats: [
        {percentageVat: 7, vat: 288.25},
        {percentageVat: 19, vat: 604.59},
      ],
      amountAfterGlobalDiscountWithVAT: 8192.84,
    });
  });

  it('should calculate invoice amount correctly (with proper rounding)', () => {
    let result = calculateInvoiceAmount({
      items: [
        createMockInvoiceItem({
          name: 'Article 1',
          unitAmount: {
            currency: 'EUR',
            netAmount: 7000,
            percentageVat: 19,
          },
          quantity: 12,
        }),
        createMockInvoiceItem({
          name: 'Article 2',
          unitAmount: {
            currency: 'EUR',
            netAmount: 12500,
            percentageVat: 19,
          },
          quantity: 50,
        }),
      ],
      globalDiscount: {
        type: DiscountType.AMOUNT,
        amount: {
          value: 254,
          currency: 'EUR',
        },
      },
    });

    expect(result).toStrictEqual({
      amountBeforeGlobalDiscount: 7090,
      amountAfterGlobalDiscount: 6836,
      vats: [{percentageVat: 19, vat: 1298.84}],
      amountAfterGlobalDiscountWithVAT: 8134.84,
    });

    result = calculateInvoiceAmount({
      items: [
        createMockInvoiceItem({
          name: 'Article 1',
          unitAmount: {
            currency: 'EUR',
            netAmount: 7000,
            percentageVat: 19,
          },
          quantity: 12,
        }),
        createMockInvoiceItem({
          name: 'Article 2',
          unitAmount: {
            currency: 'EUR',
            netAmount: 12500,
            percentageVat: 19,
          },
          quantity: 50,
        }),
      ],
      globalDiscount: {
        type: DiscountType.AMOUNT,
        amount: {
          value: 254.5,
          currency: 'EUR',
        },
      },
    });

    expect(result).toStrictEqual({
      amountBeforeGlobalDiscount: 7090,
      amountAfterGlobalDiscount: 6835.5,
      vats: [{percentageVat: 19, vat: 1298.74}],
      amountAfterGlobalDiscountWithVAT: 8134.24,
    });

    result = calculateInvoiceAmount({
      items: [
        createMockInvoiceItem({
          name: 'Article 1',
          unitAmount: {
            currency: 'EUR',
            netAmount: 1235,
            percentageVat: 19,
          },
          quantity: 1,
        }),
        createMockInvoiceItem({
          name: 'Article 2',
          unitAmount: {
            currency: 'EUR',
            netAmount: 3160,
            percentageVat: 19,
          },
          quantity: 1,
        }),
        createMockInvoiceItem({
          name: 'Article 3',
          unitAmount: {
            currency: 'EUR',
            netAmount: 3271,
            percentageVat: 19,
          },
          quantity: 1,
        }),
        createMockInvoiceItem({
          name: 'Article 4',
          unitAmount: {
            currency: 'EUR',
            netAmount: 2334,
            percentageVat: 19.5,
          },
          quantity: 1,
        }),
      ],
    });

    expect(result).toStrictEqual({
      amountBeforeGlobalDiscount: 100,
      amountAfterGlobalDiscount: 100,
      vats: [
        {percentageVat: 19, vat: 14.56},
        {percentageVat: 19.5, vat: 4.55},
      ],
      amountAfterGlobalDiscountWithVAT: 119.11,
    });

    result = calculateInvoiceAmount({
      items: [
        createMockInvoiceItem({
          name: 'Article 1',
          unitAmount: {
            currency: 'EUR',
            netAmount: 1235,
            percentageVat: 19.5,
          },
          quantity: 12,
          discount: {
            type: DiscountType.PERCENTAGE,
            percentage: 10,
          },
        }),
        createMockInvoiceItem({
          name: 'Article 2',
          unitAmount: {
            currency: 'EUR',
            netAmount: 3160,
            percentageVat: 19,
          },
          quantity: 13,
        }),
        createMockInvoiceItem({
          name: 'Article 3',
          unitAmount: {
            currency: 'EUR',
            netAmount: 3271,
            percentageVat: 19,
          },
          quantity: 1,
        }),
        createMockInvoiceItem({
          name: 'Article 4',
          unitAmount: {
            currency: 'EUR',
            netAmount: 2334,
            percentageVat: 19,
          },
          quantity: 1,
        }),
      ],
      globalDiscount: {
        type: DiscountType.AMOUNT,
        amount: {
          value: 120,
          currency: 'EUR',
        },
      },
    });

    expect(result).toStrictEqual({
      amountBeforeGlobalDiscount: 600.23,
      amountAfterGlobalDiscount: 480.23,
      vats: [
        {percentageVat: 19.5, vat: 20.81},
        {percentageVat: 19, vat: 70.97},
      ],
      amountAfterGlobalDiscountWithVAT: 572.01,
    });

    result = calculateInvoiceAmount({
      items: [
        createMockInvoiceItem({
          name: 'Article 1',
          unitAmount: {
            currency: 'EUR',
            netAmount: 1235,
            percentageVat: 19,
          },
          quantity: 1,
          discount: {
            type: DiscountType.PERCENTAGE,
            percentage: 10,
          },
        }),
        createMockInvoiceItem({
          name: 'Article 2',
          unitAmount: {
            currency: 'EUR',
            netAmount: 3160,
            percentageVat: 19,
          },
          quantity: 1,
        }),
        createMockInvoiceItem({
          name: 'Article 3',
          unitAmount: {
            currency: 'EUR',
            netAmount: 3271,
            percentageVat: 19,
          },
          quantity: 1,
        }),
        createMockInvoiceItem({
          name: 'Article 4',
          unitAmount: {
            currency: 'EUR',
            netAmount: 2334,
            percentageVat: 19,
          },
          quantity: 1,
        }),
      ],
    });

    expect(result).toStrictEqual({
      amountBeforeGlobalDiscount: 98.76,
      amountAfterGlobalDiscount: 98.76,
      vats: [{percentageVat: 19, vat: 18.75}],
      amountAfterGlobalDiscountWithVAT: 117.51,
    });

    result = calculateInvoiceAmount({
      items: [
        createMockInvoiceItem({
          name: 'Article 1',
          unitAmount: {
            currency: 'EUR',
            netAmount: 1235,
            percentageVat: 19,
          },
          quantity: 1.91,
        }),
        createMockInvoiceItem({
          name: 'Article 2',
          unitAmount: {
            currency: 'EUR',
            netAmount: 3160,
            percentageVat: 19,
          },
          quantity: 1,
        }),
        createMockInvoiceItem({
          name: 'Article 3',
          unitAmount: {
            currency: 'EUR',
            netAmount: 3271,
            percentageVat: 19,
          },
          quantity: 1,
        }),
        createMockInvoiceItem({
          name: 'Article 4',
          unitAmount: {
            currency: 'EUR',
            netAmount: 2334,
            percentageVat: 19,
          },
          quantity: 1,
        }),
      ],
    });

    expect(result).toStrictEqual({
      amountBeforeGlobalDiscount: 111.24,
      amountAfterGlobalDiscount: 111.24,
      vats: [{percentageVat: 19, vat: 21.12}],
      amountAfterGlobalDiscountWithVAT: 132.36,
    });

    result = calculateInvoiceAmount({
      items: [
        createMockInvoiceItem({
          name: 'Article 1',
          unitAmount: {
            currency: 'EUR',
            netAmount: 7460,
            percentageVat: 19,
          },
          quantity: 4.5,
        }),
        createMockInvoiceItem({
          name: 'Article 2',
          unitAmount: {
            currency: 'EUR',
            netAmount: 220,
            percentageVat: 19,
          },
          quantity: 4.5,
        }),
        createMockInvoiceItem({
          name: 'Article 3',
          unitAmount: {
            currency: 'EUR',
            netAmount: 1250,
            percentageVat: 19,
          },
          quantity: 1,
        }),
        createMockInvoiceItem({
          name: 'Article 4',
          unitAmount: {
            currency: 'EUR',
            netAmount: 4300,
            percentageVat: 19,
          },
          quantity: 1,
        }),
      ],
    });

    expect(result).toStrictEqual({
      amountBeforeGlobalDiscount: 401.1,
      amountAfterGlobalDiscount: 401.1,
      vats: [{percentageVat: 19, vat: 76.21}],
      amountAfterGlobalDiscountWithVAT: 477.31,
    });
  });
});
