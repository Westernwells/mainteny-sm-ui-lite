import {PropsWithChildren} from 'react';
import {BrowserRouter, useLocation, useNavigate} from 'react-router-dom';
import {UserCompanyProvider} from 'context/UserCompanyProvider';
import {PdfStylesProvider} from 'context/PdfStylesProvider';
import ErrorBoundary from 'components/ErrorBoundary';
import CssBaseline from '@mui/material/CssBaseline';
import {SnackbarProvider} from 'notistack';
import {LanguageProvider} from 'context/LanguageProvider';
import {ThemeProvider} from '@mui/material/styles';
import {QueryClient, QueryClientProvider} from 'react-query';
import {theme} from 'theme';
import {AxiosError} from 'axios';
import {MutationErrorHandler, queryErrorHandler} from 'reactQuery/handlers';
import {DropzoneProvider} from 'context/DropzoneProvider';

// to be used with storybook implementation,
// Needs debugging
// In this implementation the providers do not work as expected when navigated, changing languages
export const RouterDependentContent = ({
  children,
}: PropsWithChildren<unknown>) => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        useErrorBoundary: (error) => {
          const axiosError = error as AxiosError;
          const method = axiosError?.config?.method?.toLowerCase();
          if (method !== 'get') {
            return false;
          }
          return (axiosError?.response?.status || 0) >= 500;
        },
        onError: queryErrorHandler,
        // refetchOnWindowFocus: false,
      },
      mutations: {
        onError: MutationErrorHandler,
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider
            autoHideDuration={6000}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            hideIconVariant
            maxSnack={3}>
            <DropzoneProvider>
              <ErrorBoundary navigate={navigate} location={location}>
                <UserCompanyProvider>
                  <PdfStylesProvider>{children}</PdfStylesProvider>
                </UserCompanyProvider>
              </ErrorBoundary>
            </DropzoneProvider>
          </SnackbarProvider>
        </QueryClientProvider>
        <CssBaseline />
      </LanguageProvider>
    </ThemeProvider>
  );
};

const AddProviders = ({children}: PropsWithChildren<unknown>) => (
  <BrowserRouter>
    <RouterDependentContent>{children}</RouterDependentContent>
  </BrowserRouter>
);

export default AddProviders;
