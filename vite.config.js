import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        motor: resolve(__dirname, 'motor-hidraulico.html'),
        itaipu: resolve(__dirname, 'itaipu.html'),
      },
    },
  },
});
