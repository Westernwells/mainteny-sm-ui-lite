import {defineConfig} from 'cypress';
import coverage from '@cypress/code-coverage/task';
import cypressSplit from 'cypress-split';
import installLogsPrinter from 'cypress-terminal-report/src/installLogsPrinter';
import {readPdf} from './cypress/scripts/readPDF';

const fs = require('fs');

require('dotenv').config({path: '.env.stage'});

export default defineConfig({
  e2e: {
    baseUrl: process.env.REACT_APP_BASE_URL,
    chromeWebSecurity: false,
    defaultCommandTimeout: 60000,
    setupNodeEvents(on, config) {
      coverage(on, config);
      cypressSplit(on, config);
      installLogsPrinter(on);
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
  pageLoadTimeout: 180000,
  retries: {
    openMode: 0,
    runMode: 1,
  },
  defaultCommandTimeout: 15000,
});
