import { resolve } from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

const swcPlugin = swc.vite({
  module: { type: 'es6' },
});

const resolveAlias = {
  src: resolve(__dirname, './src'),
  'better-auth/node': resolve(
    __dirname,
    './src/test/mocks/better-auth-node.mock.ts'
  ),
};

const setupFiles = [resolve(__dirname, './src/test/setup/test.setup.ts')];

export default defineConfig({
  build: {
    sourcemap: true,
  },
  server: {
    fs: {
      strict: false,
    },
  },
  plugins: [swcPlugin],
  resolve: {
    alias: resolveAlias,
  },
  test: {
    environment: 'node',
    globals: true,
    globalSetup: resolve(__dirname, './src/test/setup/test.global-setup.ts'),
    projects: [
      {
        plugins: [swcPlugin],
        resolve: { alias: resolveAlias },
        test: {
          name: 'unit',
          globals: true,
          environment: 'node',
          include: ['src/**/*.spec.ts'],
          exclude: ['src/test/**/*.spec.ts'],
          setupFiles,
        },
      },
      {
        plugins: [swcPlugin],
        resolve: { alias: resolveAlias },
        test: {
          name: 'integration',
          globals: true,
          environment: 'node',
          include: ['src/test/**/*.integration.spec.ts'],
          setupFiles,
          pool: 'threads',
          fileParallelism: false,
          maxWorkers: 1,
          hookTimeout: 60000,
          testTimeout: 60000,
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
    },
  },
});
