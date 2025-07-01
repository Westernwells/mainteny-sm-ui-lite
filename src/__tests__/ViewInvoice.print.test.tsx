import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
  type Mock,
} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from 'react-query';
import {ViewInvoice} from 'pages/InvoiceDetails/ViewInvoice';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {
  useInvoiceDetail,
  usePrintInvoice,
  useFetchXInvoiceByInvoiceId,
  useCancelInvoice,
  useInvoicePaymentStatus,
  useDeleteInvoice,
  useSendInvoice,
  useUpdateInvoice,
  useFetchServiceOrderInvoices,
  useInvoiceAmountDetailQuery,
  useInfiniteInvoiceComments,
  useAddInvoicePayment,
} from 'hooks/reactQuery/useInvoice';
import {InvoiceView} from 'models/invoice';
import {testPartialInvoice} from './mocks/ViewInvoice';

// -----------------------------------------------------------------------------
//   Mocks & helpers
// -----------------------------------------------------------------------------
vi.mock('hooks/reactQuery/useDownloadUrl', () => ({
  __esModule: true,
  useDownloadUrl: vi.fn(),
  useDownloadFileWithCustomName: vi
    .fn()
    .mockReturnValue({downloadFile: vi.fn().mockResolvedValue(undefined)}),
}));

vi.mock('pdfjs-dist/webpack', () => ({GlobalWorkerOptions: {workerSrc: ''}}));

vi.mock('theme', () => ({
  theme: {
    palette: {
      success: {main: '#00FF00', darkSuccess: '#009900'},
      action: {active: '#000000'},
      error: {main: '#FF0000'},
      primary: {
        main: '#000034',
        mainLight: '#0F4C64',
        light: '',
        dark: '',
        contrastText: '',
      },
      secondary: {
        main: '#00D1FF',
        light: '',
        dark: '',
        contrastText: '',
        mainLight: '',
      },
      warning: {main: '#FFA500'},
      grey: {200: '#CCCCCC', 500: '#888888'},
    },
    breakpoints: {up: () => '', down: () => ''},
  },
}));

vi.mock('notistack', () => ({useSnackbar: () => ({enqueueSnackbar: vi.fn()})}));

vi.mock('@react-pdf/renderer', () => ({
  Document: () => null,
  Page: () => null,
  Text: () => null,
  View: () => null,
  Image: () => null,
  StyleSheet: {create: (styles: any) => styles},
  Font: {
    register: () => {},
    registerFont: () => {},
    getSource: () => null,
    registerHyphenationCallback: () => {},
  },
  pdf: () => ({
    toBlob: async () => new Blob([]),
    toString: async () => '<svg/>',
  }),
  Link: () => null,
  Note: () => null,
}));

vi.mock('@react-pdf/font', () => ({register: () => {}}));

vi.mock('@mui/material/styles', () => ({
  createTheme: () => ({
    typography: {h4: {}},
    breakpoints: {up: () => '', down: () => ''},
  }),
  useTheme: () => ({
    typography: {h4: {}},
    breakpoints: {up: () => '', down: () => ''},
  }),
}));

vi.mock('hooks/reactQuery/useFormatDate', () => ({
  useFormatDate: () => (date: string) => date,
}));

vi.mock('hooks/reactQuery/useCurrentCurrency', () => ({
  useCurrentCurrency: () => 'EUR',
}));

vi.mock('hooks/reactQuery/useCompanies', () => ({
  useCompanyById: () => ({data: {}, isLoading: false}),
  useCompanyJobTypes: () => ({data: [], isLoading: false}),
  useOldCompanyJobTypes: () => ({data: [], isLoading: false}),
}));

vi.mock('print-js', () => ({__esModule: true, default: vi.fn()}));

vi.mock('hooks/reactQuery/useInvoice', () => ({
  useInvoiceDetail: vi.fn(),
  usePrintInvoice: vi.fn(),
  useFetchXInvoiceByInvoiceId: vi.fn(),
  useCancelInvoice: vi.fn(),
  useInvoicePaymentStatus: vi.fn(),
  useDeleteInvoice: vi.fn(),
  useSendInvoice: vi.fn(),
  useUpdateInvoice: vi.fn(),
  useFetchServiceOrderInvoices: vi.fn(),
  useInvoiceAmountDetailQuery: vi.fn(),
  useInfiniteInvoiceComments: vi.fn(),
  useAddInvoicePayment: vi.fn(),
}));

vi.mock('hooks/reactQuery/useVats', () => ({
  useVats: () => ({data: [], isLoading: false}),
}));

vi.mock('hooks/reactQuery/useEmail', () => ({
  useFetchCompanyEmailConfig: () => ({data: {bccEmails: []}, isLoading: false}),
}));

vi.mock('hooks/useInvoiceMenuActions', () => ({
  __esModule: true,
  default: (opts: {onPrint: () => void}) => ({
    actions: [
      {label: 'Print', icon: null, onClick: opts.onPrint, showBorder: false},
    ],
  }),
}));

vi.mock('hooks/reactQuery/useCustomers', () => ({
  __esModule: true,
  useGetCustomer: vi.fn(),
  useInfiniteCustomerNotes: vi.fn(),
  useTotalNotesData: vi.fn().mockReturnValue({
    data: {pages: [], pageParams: []},
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isFetching: false,
  }),
}));

vi.mock('hooks/useTotalNotesData', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    data: {pages: [], pageParams: []},
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isFetching: false,
  })),
}));

const mockedUseDownloadUrl = vi.mocked(useDownloadUrl) as unknown as Mock;

interface DummyInvoiceProps {
  invoice: InvoiceView;
  downloadMap: Record<string, string>;
}

function setupMockHooks({invoice, downloadMap}: DummyInvoiceProps) {
  (vi.mocked(useInvoiceDetail) as Mock).mockReturnValue({
    data: invoice,
    refetch: vi.fn().mockResolvedValue({data: invoice}),
  });

  mockedUseDownloadUrl.mockImplementation((paths: string[]) => {
    const dataMap = paths.reduce<Record<string, string>>((acc, p) => {
      acc[p] = downloadMap[p] ?? '';
      return acc;
    }, {});
    return {
      data: dataMap,
      refetch: vi.fn().mockResolvedValue({data: dataMap}),
      isLoading: false,
    };
  });

  const mockPrintInvoiceFn = vi
    .fn()
    .mockImplementation((_args: any, {onSuccess}: any) => {
      onSuccess?.();
      return Promise.resolve();
    });
  (vi.mocked(usePrintInvoice) as Mock).mockReturnValue({
    mutateAsync: mockPrintInvoiceFn,
  });

  (vi.mocked(useFetchXInvoiceByInvoiceId) as Mock).mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue(new Blob()),
  });
  (vi.mocked(useCancelInvoice) as Mock).mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
  });
  (vi.mocked(useInvoicePaymentStatus) as Mock).mockReturnValue({
    mutate: vi.fn().mockResolvedValue(undefined),
  });
  (vi.mocked(useDeleteInvoice) as Mock).mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
  });
  (vi.mocked(useSendInvoice) as Mock).mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
  });
  const mockUpdateInvoiceFn = vi
    .fn()
    .mockImplementation((_args, {onSuccess}) => {
      onSuccess?.();
      return Promise.resolve();
    });
  (vi.mocked(useUpdateInvoice) as Mock).mockReturnValue({
    mutateAsync: mockUpdateInvoiceFn,
  });
  (vi.mocked(useFetchServiceOrderInvoices) as Mock).mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
  });
  (vi.mocked(useInvoiceAmountDetailQuery) as Mock).mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
  });
  (vi.mocked(useInfiniteInvoiceComments) as Mock).mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
  });
  (vi.mocked(useAddInvoicePayment) as Mock).mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
  });

  vi.mock('hooks/reactQuery/useUploadSignedUrl', () => ({
    useUploadFiles: () => ({mutateAsync: vi.fn().mockResolvedValue([])}),
  }));

  return {mockPrintInvoiceFn};
}

function renderViewInvoice(i: InvoiceView) {
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <ViewInvoice
          invoice={i}
          invoiceActivities={[]}
          companyNextNumber={{value: 'INV-001'}}
          refetchCompanyNextNumber={vi.fn()}
          pdfConfig={{}}
          headerInfo={{path: '', width: 0, height: 0, posX: 0, posY: 0}}
          footerInfo={{path: '', width: 0, height: 0, posX: 0, posY: 0}}
          headerUrl=""
          footerUrl=""
          checklistProps={{
            serviceOrderCheckLists: [],
            signatureImageUrl: '',
            sortedChecklistComponents: [],
          }}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ViewInvoice – Print flow (PDF only)', () => {
  let invoice: InvoiceView;
  let downloadMap: Record<string, string>;
  let mockPrintInvoiceFn: Mock;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let originalWarn: typeof console.warn;

  beforeAll(() => {
    if (typeof URL !== 'undefined') {
      URL.createObjectURL = vi.fn(() => 'blob://fake-url');
    } else {
      (global as any).URL = {createObjectURL: vi.fn(() => 'blob://fake-url')};
    }

    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    originalWarn = console.warn;
    vi.spyOn(console, 'warn').mockImplementation((msg, ...args) => {
      if (
        typeof msg === 'string' &&
        msg.includes('React Router Future Flag Warning')
      )
        return;
      originalWarn(msg, ...args);
    });
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
    console.warn = originalWarn;
  });

  beforeEach(() => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({text: () => Promise.resolve('<root/>')});
    vi.clearAllMocks();

    invoice = {...testPartialInvoice};
    invoice.externalId = 'INV-0001';
    invoice.additionalInfo.pdfPath = `server/uploads/invoices/${invoice.id}.pdf`;
    invoice.additionalInfo.xmlPath = `server/uploads/invoices/${invoice.id}.xml`;

    downloadMap = {
      [invoice.additionalInfo.pdfPath!]: 'http://test-pdf-url',
      [invoice.additionalInfo.xmlPath!]: 'http://test-xml-url',
    };

    mockedUseDownloadUrl.mockReturnValue({
      data: downloadMap,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      status: 'success',
      refetch: vi.fn().mockResolvedValue({data: downloadMap}),
    } as any);

    mockPrintInvoiceFn = vi
      .fn()
      .mockImplementation((_args: any, {onSuccess}: any) => {
        onSuccess?.();
        return Promise.resolve();
      });
    (usePrintInvoice as Mock).mockReturnValue({
      mutateAsync: mockPrintInvoiceFn,
      mutate: vi.fn(),
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      status: 'success',
    } as any);

    ({mockPrintInvoiceFn} = setupMockHooks({invoice, downloadMap}));
  });

  it('invokes printInvoice.mutateAsync(...) after clicking “Print”', async () => {
    renderViewInvoice(invoice);
    expect(screen.getByText(invoice.externalId)).toBeInTheDocument();

    const moreButton = await screen.findByTestId('more-button');
    fireEvent.click(moreButton);

    const printMenuItem = await screen.findByText(/^Print$/i);
    fireEvent.click(printMenuItem);

    const printButtons = await screen.findAllByRole('button', {
      name: /^Print$/i,
    });
    expect(printButtons.length).toBeGreaterThan(0);
    fireEvent.click(printButtons[0]);

    // Verify that `printInvoice.mutateAsync(...)` was called with the correct shape
    await waitFor(() => {
      expect(mockPrintInvoiceFn).toHaveBeenCalledWith(
        expect.objectContaining({
          id: invoice.id,
          body: expect.objectContaining({
            externalId: 'INV-0001',
          }),
        }),
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );
    });
  });
});
