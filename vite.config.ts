import {defineConfig, loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import envCompatible from 'vite-plugin-env-compatible';
import tsconfigPaths from 'vite-tsconfig-paths';
import istanbul from 'vite-plugin-istanbul';

// Function to generate version string in format yyyy_MM_dd_${CI_COMMIT_SHORT_SHA}
function generateVersionString(mode: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const env = loadEnv(mode, process.cwd(), '');

  const commitSha =
    process.env.CI_COMMIT_SHORT_SHA || env.REACT_APP_VERSION || 'dev';

  return `${year}_${month}_${day}_${commitSha}`;
}

export default defineConfig(({mode}) => {
  const version = generateVersionString(mode);

  return {
    envPrefix: 'REACT_APP_',
    build: {
      outDir: 'build',
      rollupOptions: {
        output: {
          // Add version to JavaScript files
          entryFileNames: `assets/${version}-[name].[hash].js`,
          chunkFileNames: `assets/${version}-[name].[hash].js`,
          // Add version to other files
          assetFileNames: () => `assets/${version}-[name].[hash].[ext]`,
        },
      },
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
        exclude: ['node_modules', 'test/'],
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
      setupFiles: ['./tests/setup.js', './tests/vitest.setup.ts'],
      include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,tsup,build,eslint,prettier}.config.*',
        '**/playwright/**',
      ],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
      },
    },
  };
});
