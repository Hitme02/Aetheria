import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
  plugins: [react(), imagetools()],
  build: { sourcemap: true },
  server: { port: 5173, open: true },
  preview: { port: 4173 }
});
