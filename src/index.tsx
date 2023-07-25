import * as React from 'react';
import ReactDOM from 'react-dom';
import {QueryClient, QueryClientProvider} from 'react-query';
import {ReactQueryDevtools} from 'react-query/devtools';
import CssBaseline from '@mui/material/CssBaseline';
import {ThemeProvider} from '@mui/material/styles';
import {MutationErrorHandler, queryErrorHandler} from 'reactQuery/handlers';
import {SnackbarProvider} from 'notistack';
import {LanguageProvider} from 'context/LanguageProvider';
import * as Sentry from '@sentry/react';
import {App} from './App';
import {theme} from './theme';
import './assets/fonts/Aventa/Aventa-Regular.ttf';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      useErrorBoundary: true,
      onError: queryErrorHandler,
      // refetchOnWindowFocus: false,
    },
    mutations: {
      onError: MutationErrorHandler,
    },
  },
});

const isProduction = import.meta.env.MODE === 'prod';

Sentry.init({
  dsn: import.meta.env.REACT_APP_SENTRY_DSN,
  environment: isProduction ? 'production' : import.meta.env.MODE,
  debug: !isProduction,
});

ReactDOM.render(
  <ThemeProvider theme={theme}>
    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
    <CssBaseline />
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider
          autoHideDuration={6000}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          maxSnack={3}>
          <App />
        </SnackbarProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </LanguageProvider>
  </ThemeProvider>,
  document.querySelector('#root'),
);
