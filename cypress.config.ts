/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {defineConfig} from 'cypress';
import coverage from '@cypress/code-coverage/task';
import cypressSplit from 'cypress-split';
import installLogsPrinter from 'cypress-terminal-report/src/installLogsPrinter';
import {readPdf} from './cypress/scripts/readPDF';

const fs = require('fs');
const path = require('path');
require('dotenv').config({path: '.env.stage'});

export default defineConfig({
  e2e: {
    baseUrl: process.env.REACT_APP_BASE_URL,
    chromeWebSecurity: false,
    defaultCommandTimeout: 60000,
    pageLoadTimeout: 350000,
    responseTimeout: 120000,
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 1,
    retries: {
      openMode: 1,
      runMode: 1,
    },
    setupNodeEvents(on, config) {
      // Register code coverage and cypress-split
      coverage(on, config);
      cypressSplit(on, config);

      // Install cypress-terminal-report
      installLogsPrinter(on, {
        printLogsToConsole: 'always',
        printLogsToFile: 'onFail',
      });

      // Merge all tasks into a single registration
      on('task', {
        readPdf,
        // Get all downloaded files sorted by time
        ensureDownloadsFolder() {
          const downloadsPath = path.join(__dirname, 'cypress/downloads');
          if (!fs.existsSync(downloadsPath)) {
            fs.mkdirSync(downloadsPath, {recursive: true});
          }
          return null;
        },

        // Get all downloaded files sorted by time
        downloads(downloadspath) {
          if (!fs.existsSync(downloadspath)) {
            return []; // Return empty array if the folder doesn't exist
          }
          return fs
            .readdirSync(downloadspath)
            .map((name: string) => ({
              name,
              time: fs.statSync(`${downloadspath}/${name}`).mtime.getTime(),
            }))
            .sort((a: {time: number}, b: {time: number}) => a.time - b.time)
            .map((f: {name: string}) => f.name);
        },

        ctrLogMessages(_logs) {
          return null;
        },
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
});
