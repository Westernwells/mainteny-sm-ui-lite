import { defineConfig } from 'cypress';
import coverage from '@cypress/code-coverage/task';
import cypressSplit from 'cypress-split'


require('dotenv').config({ path: '.env.stage' });

export default defineConfig({
  e2e: {
    baseUrl: process.env.REACT_APP_BASE_URL,
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {
      coverage(on, config);
      cypressSplit(on, config);
      return config;
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    setupNodeEvents(on, config) {
      coverage(on, config);
      return config;
    },
  },
  env: {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  },
  pageLoadTimeout: 90000,
  defaultCommandTimeout: 15000,
});
