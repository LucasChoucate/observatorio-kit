import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        // Bibliotecas grandes em arquivos próprios: ficam em cache entre as telas.
        codeSplitting: {
          groups: [
            {
              name: 'graficos',
              test: /node_modules[\\/](recharts|d3-|victory-vendor|es-toolkit|immer|@reduxjs|react-redux|reselect|decimal\.js-light)/,
            },
            { name: 'supabase', test: /node_modules[\\/]@supabase/ },
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
            },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
});
