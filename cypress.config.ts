import { defineConfig } from 'cypress';
import coverage from '@cypress/code-coverage/task';
import cypressSplit from 'cypress-split';
import installLogsPrinter from 'cypress-terminal-report/src/installLogsPrinter';
import { readPdf } from './cypress/scripts/readPDF';

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.stage' });

export default defineConfig({
  e2e: {
    baseUrl: process.env.REACT_APP_BASE_URL,
    chromeWebSecurity: false,
    defaultCommandTimeout: 60000,
    pageLoadTimeout: 300000,
    responseTimeout: 120000,
    retries: {
      openMode: 1, // Retry once during interactive mode
      runMode: 2, // Retry twice during CI runs
    },
    setupNodeEvents(on, config) {
      coverage(on, config);
      cypressSplit(on, config);
      installLogsPrinter(on, {
        printLogsToConsole: 'always',
        printLogsToFile: 'onFail',
      });

      on('task', {
        readPdf,
      });

      on('task', {
        // Get the latest file that starts with 'WR'
        findFileStartingWith({ folder, prefix }) {
          return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 20;
            
            const checkForFile = () => {
              const files = fs.readdirSync(folder)
                .filter(file => file.startsWith(prefix));

              if (files.length > 0) {
                resolve(path.join(folder, files[0])); 
              } else if (attempts < maxAttempts) {
                attempts += 1;
                setTimeout(checkForFile, 500);
              } else {
                resolve(null); 
              }
            };

            checkForFile();
          });
        },

        // Delete existing files starting with a prefix
        deleteFilesStartingWith({ folder, prefix }) {
          if (!fs.existsSync(folder)) return null;
          fs.readdirSync(folder)
            .filter(file => file.startsWith(prefix))
            .forEach(file => fs.unlinkSync(path.join(folder, file)));
          return null;
        },

        // Get all downloaded files sorted by time
        downloads: (downloadspath) =>
          fs.readdirSync(downloadspath)
            .map((name: string) => ({
              name,
              time: fs.statSync(`${downloadspath}/${name}`).mtime.getTime(),
            }))
            .sort((a: { time: number }, b: { time: number }) => a.time - b.time)
            .map((f: { name: string }) => f.name),
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
