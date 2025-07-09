import {act, PropsWithChildren, ReactElement, ReactNode} from 'react';
import {QueryClient, QueryClientProvider} from 'react-query';
import {I18nextProvider} from 'react-i18next';
import {SnackbarProvider} from 'notistack';
import {render, RenderOptions} from '@testing-library/react';
import i18n from 'i18n';
import {theme} from 'theme';
import {ThemeProvider} from '@mui/material/styles';
import {LanguageProvider} from 'context/LanguageProvider';
import {DropzoneProvider} from 'context/DropzoneProvider';
import {UserCompanyProvider} from 'context/UserCompanyProvider';
import {PdfStylesProvider} from 'context/PdfStylesProvider';
import CssBaseline from '@mui/material/CssBaseline';

// Create a mock user company context for testing to avoid state update warnings
const MockUserCompanyProvider = ({children}: PropsWithChildren<unknown>) => (
  // You can provide mock values here instead of using the real provider
  // This prevents async state updates that cause act() warnings
  // eslint-disable-next-line react/jsx-no-useless-fragment
  <>{children}</>
);

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  useMockUserCompany?: boolean; // Option to use mock instead of real provider
}

const AllTheProviders = ({
  children,
  queryClient,
  useMockUserCompany = true,
}: {
  children: ReactNode;
  queryClient: QueryClient;
  useMockUserCompany?: boolean;
}) => {
  const UserProvider = useMockUserCompany
    ? MockUserCompanyProvider
    : UserCompanyProvider;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LanguageProvider>
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
            <DropzoneProvider>
              <SnackbarProvider
                maxSnack={3}
                preventDuplicate
                dense
                // Disable animations in tests to prevent act warnings
                disableWindowBlurListener>
                <UserProvider>
                  <PdfStylesProvider>{children}</PdfStylesProvider>
                </UserProvider>
              </SnackbarProvider>
            </DropzoneProvider>
          </QueryClientProvider>
        </I18nextProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {},
) {
  const {
    queryClient = createQueryClient(),
    useMockUserCompany = true,
    ...renderOptions
  } = options;

  const Wrapper = ({children}: {children: ReactNode}) => (
    <AllTheProviders
      queryClient={queryClient}
      useMockUserCompany={useMockUserCompany}>
      {children}
    </AllTheProviders>
  );

  return render(ui, {wrapper: Wrapper, ...renderOptions});
}

// Async version that wraps rendering in act()
export async function renderWithProvidersAsync(
  ui: ReactElement,
  options: CustomRenderOptions = {},
) {
  let result: ReturnType<typeof render>;

  await act(async () => {
    result = renderWithProviders(ui, options);
  });

  return result!;
}

// Utility for creating a test wrapper component (useful for hooks testing)
export function createTestWrapper(options: CustomRenderOptions = {}) {
  const {queryClient = createQueryClient(), useMockUserCompany = true} =
    options;

  return function ({children}: {children: ReactNode}) {
    return (
      <AllTheProviders
        queryClient={queryClient}
        useMockUserCompany={useMockUserCompany}>
        {children}
      </AllTheProviders>
    );
  };
}

// Helper to wait for any pending promises/state updates
export const waitForStateUpdates = () =>
  act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });
