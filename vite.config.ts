import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 'base: "./"' is critical for GitHub Pages or any deployment 
  // where the app is not at the root domain (e.g. example.com/my-app/)
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});