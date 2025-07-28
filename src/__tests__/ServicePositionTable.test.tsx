import {describe, it, expect, vi, beforeEach} from 'vitest';
import {screen} from '@testing-library/react';
import {Discount} from 'models/invoice';
import {EditableServiceOrderItem} from 'models/service-order';
import {
  PropertyOwnerAdditionalInfo,
  PropertyOwnerView,
} from 'models/propertyManager';

const fakeVats = [
  {
    id: '3c4a5e70-a256-4744-b52d-b92105d4d122',
    percentage: 7,
    name: 'VAT 7%',
    isDefault: true,
  },
  {
    id: '9bac97d7-87f5-4110-8c79-62da1108c271',
    percentage: 19,
    name: 'VAT 19%',
    isDefault: false,
  },
];

let mockCustomer:
  | (Partial<PropertyOwnerView> & {
      additionalInfo?: Partial<PropertyOwnerAdditionalInfo>;
    })
  | undefined;

vi.mock('hooks/reactQuery/useVats', () => ({
  useVats: () => ({data: fakeVats}),
}));

vi.mock('hooks/reactQuery/useCustomers', () => ({
  useGetCustomer: () => ({data: mockCustomer}),
}));

vi.mock('utils/currency', () => ({
  useCurrentCurrency: () => ({code: 'EUR', symbol: '€', fractionDigits: 2}),
  formatCurrency: (value: number) => `€${value.toFixed(2)}`,
  centsToMoney: (_currency: string, cents: number) => cents / 100,
}));

vi.mock('hooks/useMainPosition', () => ({
  __esModule: true,
  default: () => ({
    handleDeleteConfirm: () => {},
    renderDragCell: () => null,
    renderUserSeqNumberCell: () => null,
    renderNameCell: () => null,
    renderArticleTypeCell: () => null,
    renderUnitPurchaseAmountCell: () => null,
    renderMarginCell: () => null,
    renderUnitAmountCell: () => null,
    renderQuantityCell: () => null,
    renderVatIdCell: () => null,
    renderUnitCell: () => null,
    renderDiscountCell: () => null,
    renderTotalPriceCell: () => null,
    confirmDialog: null,
  }),
}));

describe('<ServiceOrderPositionTable /> – handleAddNewPosition branches', () => {
  beforeEach(() => {
    mockCustomer = undefined;
    vi.clearAllMocks();
  });

  it('sets article.unit = "pcs" (unit default)', async () => {
    const {createFormMethods, renderWithProviders} = await import(
      './utils/serviceOrderDetails'
    );
    const ServiceOrderPositionTable = (
      await import(
        'pages/ServiceOrderDetails/Tabs/Overview/ServiceOrderPositions/ServiceOrderPositionTable'
      )
    ).default;

    const formMethods = createFormMethods<{
      items: EditableServiceOrderItem[];
      discount?: Discount;
    }>({
      items: [],
    });

    renderWithProviders(
      <ServiceOrderPositionTable
        formMethods={formMethods}
        onRecalcServiceOrder={vi.fn()}
        onAddPosition={vi.fn()}
        serviceOrderAmountDetail={undefined}
        disableInlineEditing={false}
        autoOpenAdd
        onEditDiscount={vi.fn()}
        serviceOrder={undefined}
      />,
    );

    await screen.findByTestId('main-row-0');

    const items = formMethods.getValues('items');
    expect(items).toHaveLength(1);

    expect(items[0].article?.unit).toBe('pcs');
  });

  it('pulls VAT from customerData.additionalInfo.vat when present', async () => {
    mockCustomer = {
      additionalInfo: {
        vat: {
          id: '9bac97d7-87f5-4110-8c79-62da1108c271',
          percentage: 19,
          name: 'VAT 19%',
          legalNote: 'Test note',
        },
      },
    } as PropertyOwnerView;

    const {createFormMethods, renderWithProviders} = await import(
      './utils/serviceOrderDetails'
    );
    const ServiceOrderPositionTable = (
      await import(
        'pages/ServiceOrderDetails/Tabs/Overview/ServiceOrderPositions/ServiceOrderPositionTable'
      )
    ).default;

    const formMethods = createFormMethods<{
      items: EditableServiceOrderItem[];
      discount?: Discount;
    }>({
      items: [],
    });

    renderWithProviders(
      <ServiceOrderPositionTable
        formMethods={formMethods}
        onRecalcServiceOrder={vi.fn()}
        onAddPosition={vi.fn()}
        serviceOrderAmountDetail={undefined}
        disableInlineEditing={false}
        autoOpenAdd // ← triggers the append logic
        onEditDiscount={vi.fn()}
        serviceOrder={undefined}
      />,
    );

    await screen.findByTestId('main-row-0');

    const items = formMethods.getValues('items');
    expect(items).toHaveLength(1);
    const ua = items[0].unitAmount;
    expect(ua.percentageVat).toBe(19);
    expect(ua.vatId).toBe('9bac97d7-87f5-4110-8c79-62da1108c271');
    expect(ua.vatName).toBe('VAT 19%');
  });

  it('falls back to defaultVat when customerData.additionalInfo.vat is missing', async () => {
    mockCustomer = undefined;

    const {createFormMethods, renderWithProviders} = await import(
      './utils/serviceOrderDetails'
    );
    const ServiceOrderPositionTable = (
      await import(
        'pages/ServiceOrderDetails/Tabs/Overview/ServiceOrderPositions/ServiceOrderPositionTable'
      )
    ).default;

    const formMethods = createFormMethods<{
      items: EditableServiceOrderItem[];
      discount?: Discount;
    }>({
      items: [],
    });

    renderWithProviders(
      <ServiceOrderPositionTable
        formMethods={formMethods}
        onRecalcServiceOrder={vi.fn()}
        onAddPosition={vi.fn()}
        serviceOrderAmountDetail={undefined}
        disableInlineEditing={false}
        autoOpenAdd
        onEditDiscount={vi.fn()}
        serviceOrder={undefined}
      />,
    );

    await screen.findByTestId('main-row-0');

    const items = formMethods.getValues('items');
    expect(items).toHaveLength(1);
    const ua = items[0].unitAmount;
    expect(ua.percentageVat).toBe(7);
    expect(ua.vatId).toBe('3c4a5e70-a256-4744-b52d-b92105d4d122');
    expect(ua.vatName).toBe('VAT 7%');
  });
});
