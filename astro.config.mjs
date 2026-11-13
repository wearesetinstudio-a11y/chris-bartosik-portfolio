// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  redirects: {
    '/projects/see-more-rebranding': '/projects/see-more',
    '/projects/see-more-web': '/projects/see-more',
    '/projects/detalles': '/projects',
    '/projects/mi-pronto': '/projects',
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-dom/client'],
    },
  }
});