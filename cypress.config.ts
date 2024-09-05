import {defineConfig} from 'cypress';
import coverage from '@cypress/code-coverage/task';
import cypressSplit from 'cypress-split';
import {readPdf} from './cypress/scripts/readPDF';

const fs = require('fs');

require('dotenv').config({path: '.env.stage'});

export default defineConfig({
  e2e: {
    baseUrl: process.env.REACT_APP_BASE_URL,
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {
      coverage(on, config);
      cypressSplit(on, config);
      on('task', {
        readPdf,
      });
      on('task', {
        downloads: (downloadspath) =>
          fs
            .readdirSync(downloadspath)
            .map((name: string) => ({
              name,
              time: fs.statSync(`${downloadspath}/${name}`).mtime.getTime(),
            }))
            .sort((a: {time: number}, b: {time: number}) => a.time - b.time) // ascending
            .map((f: {name: string}) => f.name),
      });

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
