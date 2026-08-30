// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  redirects: {
    '/projects/see-more-rebranding': '/projects/see-more',
    '/projects/see-more-web': '/projects/see-more',
    '/projects/detalles': '/projects/mi-pronto',
  },
  vite: {
    plugins: [tailwindcss()]
  }
});