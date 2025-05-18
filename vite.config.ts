import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import envCompatible from 'vite-plugin-env-compatible';
import tsconfigPaths from 'vite-tsconfig-paths';
import istanbul from 'vite-plugin-istanbul';

export default defineConfig(({ mode }) => ({
  envPrefix: 'REACT_APP_',
  build: {
    outDir: 'build',
  },
  server: {
    watch: {
      ignored: ['**/coverage/**'],
    },
    ...(mode === 'development' && {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    }),
  },
  plugins: [
    react(),
    envCompatible(),
    tsconfigPaths(),
    istanbul({
      include: 'src/*',
      exclude: ['node_modules', 'test/', 'cypress/'],
      extension: ['.js', '.ts', '.tsx'],
      requireEnv: false,
    }),
    svgrPlugin({
      svgrOptions: {
        icon: true,
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
  },
}));
