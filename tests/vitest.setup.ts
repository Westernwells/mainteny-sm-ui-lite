import '@testing-library/jest-dom';
import {cleanup} from '@testing-library/react';
import {afterAll, afterEach, beforeEach, vi} from 'vitest';
import React from 'react';

declare global {
  interface PromiseConstructor {
    withResolvers<T = unknown>(): {
      promise: Promise<T>;
      resolve: (value: T | PromiseLike<T>) => void;
      reject: (reason?: any) => void;
    };
  }
}

if (!Promise.withResolvers) {
  Promise.withResolvers = function withResolvers<T = unknown>() {
    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (reason?: any) => void;
    const promise = new Promise<T>((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    return {promise, resolve: resolve!, reject: reject!};
  };
}

beforeEach(() => {
  vi.useRealTimers();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  // Reference: https://testing-library.com/docs/using-fake-timers/
  vi.useRealTimers();
});

afterAll(() => {
  vi.unstubAllGlobals();
});

vi.mock('pdfjs-dist', () => ({}));
vi.mock('vite', async () => {
  const actual = await vi.importActual('vite');
  return {
    ...actual,
    defineConfig: vi.fn(),
  };
});

vi.stubGlobal('import.meta', {
  env: {
    REACT_APP_API_URL: 'http://localhost:5173',
  },
});

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.Worker = vi.fn().mockImplementation(() => ({
  postMessage: vi.fn(),
  terminate: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  onmessage: null,
  onerror: null,
  onmessageerror: null,
}));

if (typeof window !== 'undefined') {
  window.URL.createObjectURL = vi.fn(() => 'mock-url');
  window.URL.revokeObjectURL = vi.fn();
}

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(() => Promise.resolve({data: []})),
      post: vi.fn(() => Promise.resolve({data: {}})),
      put: vi.fn(() => Promise.resolve({data: {}})),
      delete: vi.fn(() => Promise.resolve({data: {}})),
    })),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({t: (key: string) => key}),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
  I18nextProvider: ({children}: {children: React.ReactNode}) => children,
}));

vi.mock('hooks/useSnackbar', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: () => {},
    showError: () => {},
  }),
}));

vi.mock('heic2any', () => ({
  __esModule: true,
  default: () => Promise.resolve(new Blob()),
}));

vi.mock('hooks/reactQuery/useUserSession', () => ({
  useUserSession: () => ({
    user: {
      userAccount: {
        serviceCompany: {
          id: 'company-1',
          settings: {invoiceQRCodeEnabled: false},
          contact: {email: 'foo@bar.com'},
        },
      },
      contact: {email: 'foo@bar.com'},
    },
  }),
}));

vi.mock('hooks/reactQuery/useCompanies', () => ({
  __esModule: true,
  useCompanyNextNumber: () => ({data: null, isLoading: false, error: null}),
}));

vi.setConfig({
  testTimeout: 60000,
});
