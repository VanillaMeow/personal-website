<script lang="ts">
    import { cubicOut } from 'svelte/easing';
    import { fly } from 'svelte/transition';
    import { REPOS } from '../lib/data';
</script>

<div>
    <h2 class="text-sm font-medium text-white/80 mb-4">projects</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {#each REPOS as repo, i}
            <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                class="glass-link flex-col items-start gap-2"
                in:fly={{
                    x: -20,
                    duration: 400,
                    delay: i * 75,
                    easing: cubicOut,
                }}
            >
                <div class="flex items-center gap-2 w-full">
                    <span class="i-simple-icons-github text-sm text-white/40"
                    ></span>
                    <span class="text-sm font-medium text-white/90"
                        >{repo.name}</span
                    >
                </div>
                <p class="text-xs text-white/40">
                    {repo.description}
                </p>
                {#if repo.language}
                    <span class="text-xs text-white/30">{repo.language}</span>
                {/if}
            </a>
        {/each}
    </div>
</div>
