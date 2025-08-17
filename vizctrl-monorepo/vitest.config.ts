import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // search for tests inside packages
    include: ['packages/**/src/**/*.test.{ts,tsx}'],
  },
  plugins: [react()],
});