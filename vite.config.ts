import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import envCompatible from 'vite-plugin-env-compatible';
import tsconfigPaths from 'vite-tsconfig-paths';
import istanbul from 'vite-plugin-istanbul';
import {sentryVitePlugin} from '@sentry/vite-plugin';
// import shimReactPdf from "vite-plugin-shim-react-pdf";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  envPrefix: 'REACT_APP_',
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: 'build',
    sourcemap: 'hidden' as 'hidden',
  },
  server: {
    watch: {
      ignored: ['**/coverage/**'],
    },
  },
  plugins: [
    react(),
    envCompatible(),
    tsconfigPaths(),
    istanbul({
      include: 'src/*',
      exclude: ['node_modules', 'test/', 'cypress/'],
      extension: ['.js', '.ts', '.tsx'],
      requireEnv: false, // Only instrument code when process.env.CYPRESS is true
    }),
    // shimReactPdf(),
    svgrPlugin({
      svgrOptions: {
        icon: true,
        // ...svgr options (https://react-svgr.com/docs/options/)
      },
    }),
    sentryVitePlugin({
      org: 'mainteny',
      project: 'mainteny-web',
      authToken: process.env.REACT_APP_SENTRY_AUTH_TOKEN,
      sourcemaps: {
        filesToDeleteAfterUpload: '**/*.map',
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
  },
}));
