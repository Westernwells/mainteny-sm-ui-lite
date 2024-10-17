import * as React from 'react';
import {QueryClient, QueryClientProvider} from 'react-query';
import {ReactQueryDevtools} from 'react-query/devtools';
import {createRoot} from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import {ThemeProvider} from '@mui/material/styles';
import {MutationErrorHandler, queryErrorHandler} from 'reactQuery/handlers';
import {SnackbarProvider} from 'notistack';
import {LanguageProvider} from 'context/LanguageProvider';
import * as Sentry from '@sentry/react';
import {UserCompanyProvider} from 'context/UserCompanyProvider';
import {App} from './App';
import {theme} from './theme';
import './assets/fonts/Aventa/Aventa-Regular.ttf';
import {LicenseInfo} from '@mui/x-license-pro';
import BigNumber from 'bignumber.js';
import './utils/withResolversPolyfill';

BigNumber.config({DECIMAL_PLACES: 2});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      useErrorBoundary: false,
      onError: queryErrorHandler,
      // refetchOnWindowFocus: false,
    },
    mutations: {
      onError: MutationErrorHandler,
    },
  },
});

const isProduction = import.meta.env.MODE === 'prod';

// disable Sentry in Cypress e2e tests
if (!window.Cypress) {
  Sentry.init({
    dsn: import.meta.env.REACT_APP_SENTRY_DSN,
    environment: isProduction ? 'production' : import.meta.env.MODE,
    debug: !isProduction,
    replaysSessionSampleRate: isProduction ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });
}

// Add the script tag dynamically
const script = document.createElement('script');
script.src = 'https://design.kalasar.com/static/0.0.2/kalasar.js';
script.async = true;
document.head.appendChild(script);

// Updated part for React 18
const container = document.querySelector('#root') as Element;
const root = createRoot(container); // Create a root.

LicenseInfo.setLicenseKey(import.meta.env.REACT_APP_MUI_PRO_LICENSE);

root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
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
          <UserCompanyProvider>
            <App />
          </UserCompanyProvider>
        </SnackbarProvider>

        {window.Cypress ? null : <ReactQueryDevtools />}
      </QueryClientProvider>
    </LanguageProvider>
  </ThemeProvider>,
);
