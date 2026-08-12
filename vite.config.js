import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Project site at https://dylan-bayley.github.io/mobile-core-networks/
// Change to '/' if a custom domain or a <user>.github.io repo is used later.
export default defineConfig({
  base: '/mobile-core-networks/',
  plugins: [react(), tailwindcss()],
});
