import * as React from 'react';
import ReactDOM from 'react-dom';
import {QueryClient, QueryClientProvider} from 'react-query';
import {ReactQueryDevtools} from 'react-query/devtools';
import CssBaseline from '@mui/material/CssBaseline';
import {ThemeProvider} from '@mui/material/styles';
import {MutationErrorHandler, queryErrorHandler} from 'reactQuery/handlers';
import {SnackbarProvider} from 'notistack';
import {App} from './App';
import {theme} from './theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      useErrorBoundary: true,
      onError: queryErrorHandler,
    },
    mutations: {
      onError: MutationErrorHandler,
    },
  },
});

ReactDOM.render(
  <ThemeProvider theme={theme}>
    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
    <CssBaseline />
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider
        autoHideDuration={2000}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        maxSnack={3}>
        <App />
      </SnackbarProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  </ThemeProvider>,
  document.querySelector('#root'),
);
