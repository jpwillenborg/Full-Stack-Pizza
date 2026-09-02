import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev
export default defineConfig({
  plugins: [react()],
  
  // 📍 CRITICAL WHITE PAGE FIX: Forces all asset paths to compile relatively
  base: './'
});