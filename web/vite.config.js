import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base matches the GitHub Pages path: https://<user>.github.io/cybersecurity-training-apps/
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/cybersecurity-training-apps/' : '/',
});
