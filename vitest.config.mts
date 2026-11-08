import { defineConfig } from 'vitest/config';

// Convex function tests (convex/**/*.test.ts) run in the same edge runtime as Convex.
export default defineConfig({
  test: {
    environment: 'edge-runtime',
    include: ['convex/**/*.test.ts'],
    server: { deps: { inline: ['convex-test'] } },
  },
});
