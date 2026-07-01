import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Component/integration tests only (*.test.jsx) run here, in jsdom. The pure
// unit tests (*.test.js) stay on Node's built-in runner — see package.json.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.jsx'],
    setupFiles: ['./vitest.setup.js'],
  },
});
