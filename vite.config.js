import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base ensures the static build works in cPanel public_html root OR any subfolder
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
  server: {
    host: true,
    port: 5173,
  },
});
