# Instructions

- Use Bun as the runtime, package manager, and test runner.
- Use `bun add` to add packages.
- Use `bun run dev` to start the dev server.
- Use Astro as the site framework with Svelte for interactive components.
- Write all code in strict TypeScript.
- Prefer single quotes.
- Use Biome for linting and formatting.
- Prefer Svelte 5 runes (`$state`, `$derived`, `$effect`) over legacy reactive syntax.
- Only use Svelte components where interactivity is needed; default to plain `.astro` files for static pages.
- Keep components small and focused — one concern per file.
- Avoid shipping unnecessary JavaScript to the browser. Use `client:` directives only when a component needs interactivity.
- Use UnoCSS with the Wind preset for utility CSS. Prefer utility classes over custom CSS when practical.
- Prefer native HTML/CSS over JS solutions when possible (e.g., `<details>` over a JS accordion).
- Use CSS scoped to components (`<style>` blocks in `.astro`/`.svelte` files) over global stylesheets.
- No React. No Vue. No jQuery.
- Avoid over-engineering. No abstractions for one-time operations.
- Only add comments where the logic isn't self-evident.
- Target deployment on Cloudflare Pages.
