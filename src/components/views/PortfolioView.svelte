<!-- @unocss-include -->

<script lang="ts">
    import { cubicOut } from 'svelte/easing';
    import { fly } from 'svelte/transition';
    import { REPO_SLUGS } from '../../lib/data';
    import { repoCache } from '../../lib/github.svelte';
    import { REPO_CARD_TRANSITION_DELAY } from '../../lib/viewTransition.svelte';

    const LANG_ICONS: Record<string, string> = {
        TypeScript: 'i-simple-icons-typescript',
        JavaScript: 'i-simple-icons-javascript',
        Python: 'i-simple-icons-python',
        'Jupyter Notebook': 'i-simple-icons-jupyter',
        Luau: 'i-simple-icons-luau',
        Lua: 'i-simple-icons-lua',
        Rust: 'i-simple-icons-rust',
        Go: 'i-simple-icons-go',
        Java: 'i-simple-icons-openjdk',
        'C#': 'i-simple-icons-csharp',
        'C++': 'i-simple-icons-cplusplus',
        C: 'i-simple-icons-c',
        HTML: 'i-simple-icons-html5',
        CSS: 'i-simple-icons-css',
        Shell: 'i-simple-icons-gnubash',
        Ruby: 'i-simple-icons-ruby',
        Swift: 'i-simple-icons-swift',
        Kotlin: 'i-simple-icons-kotlin',
        Dart: 'i-simple-icons-dart',
    };

    const FALLBACK_ICON = 'i-lucide-code';
</script>

{#snippet descSkeleton()}
    <div class="skeleton text-xs flex-1 h-3 w-9/10 rounded line-clamp-2 min-h-[1lh]"></div>
    <div class="skeleton text-xs flex-1 h-3 w-3/5 rounded line-clamp-2 min-h-[1lh]"></div>
    <div class="skeleton flex text-xs h-3 w-1/5 rounded mt-auto"></div>
{/snippet}

<div>
    <h2 class="text-sm font-medium text-white/80 mb-4 select-none">projects</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {#each REPO_SLUGS as slug, i (slug)}
            {@const repo = repoCache[slug]}
            {#if repo}
                <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="glass-link flex flex-col items-start gap-2"
                    in:fly|global={{
                        x: -30 * (i % 2 === 0 ? 1 : -1),
                        duration: 400,
                        delay: REPO_CARD_TRANSITION_DELAY + i * 75,
                        easing: cubicOut,
                    }}
                >
                    <div class="flex items-center gap-2 w-full">
                        <span class="i-simple-icons-github text-sm text-white/40"></span>
                        <span class="text-sm font-medium text-white/90">{repo.name}</span>
                    </div>
                    {#if repo.loaded}
                        <p class="text-xs text-white/50 flex-1 overflow-hidden line-clamp-2 min-h-[2lh]">
                            {repo.description ?? ''}
                        </p>
                        <span class="flex items-center gap-1.5 text-xs text-white/45 mt-auto">
                            <span class={LANG_ICONS[repo.language ?? ''] ?? FALLBACK_ICON}></span>
                            {repo.language ?? 'Other'}
                        </span>
                    {:else}
                        {@render descSkeleton()}
                    {/if}
                </a>
            {/if}
        {/each}
    </div>
</div>

<style>
    .skeleton {
        background: rgba(255, 255, 255, 0.08);
        animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.4;
        }
    }
</style>
