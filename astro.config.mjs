// @ts-check
import svelte from '@astrojs/svelte';
import UnoCSS from '@unocss/astro';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: 'https://vanillameow.github.io',
    base: '/personal-website',
    integrations: [svelte(), UnoCSS({ injectReset: true })],
});
