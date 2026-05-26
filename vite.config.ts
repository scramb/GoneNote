import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, 'src/lib'),
      $components: path.resolve(__dirname, 'src/components'),
    },
  },
  test: {
    env: {
      SECRET_KEY: 'fa6c697a47d1390f9e306033e5fff1b6c08a64125a788d80fc09a27f7c29d8dc',
      MAX_NOTE_LENGTH: '102400',
      DEFAULT_TTL: '604800',
      REDIS_URL: 'redis://localhost:6379',
    },
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    environment: 'node',
  },
});
