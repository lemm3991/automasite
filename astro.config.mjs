import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  site: 'https://lemm3991.github.io',
  base: process.env.BASE_PATH || '/',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()]
  }
});