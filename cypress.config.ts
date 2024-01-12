import {defineConfig} from 'cypress';

require('dotenv').config({path: '.env.stage'});

export default defineConfig({
  e2e: {
    baseUrl: process.env.REACT_APP_BASE_URL,
    chromeWebSecurity: false,
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
  env: {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  },
  pageLoadTimeout: 90000
});
