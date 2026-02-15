<script lang="ts">
    import type { Component } from 'svelte';
    import { cubicOut } from 'svelte/easing';
    import { fade, fly } from 'svelte/transition';

    import { TABS } from '../lib/data';
    import HomeView from './HomeView.svelte';
    import PortfolioView from './PortfolioView.svelte';

    const views: Record<string, Component> = {
        home: HomeView,
        portfolio: PortfolioView,
    };

    let view = $state(TABS[0].key);
    let activeTab = $derived(
        TABS.find((t) => t.key === view) as (typeof TABS)[number],
    );

    let rawHeights: Record<string, number> = $state({});
    let heights: Record<string, number> = $state({});
    let ready = $state(false);

    $effect(() => {
        for (const key of Object.keys(rawHeights)) {
            if (rawHeights[key] > 0) {
                heights[key] = rawHeights[key];
                if (!ready) ready = true;
            }
        }
    });

    let maxHeight = $state(600);
    let containerHeight = $state(0);

    $effect(() => {
        maxHeight = Math.round(window.innerHeight * 0.7);
        const onResize = () => {
            maxHeight = Math.round(window.innerHeight * 0.7);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    });

    $effect(() => {
        const target = heights[view] ?? 0;
        if (target > 0) {
            containerHeight = Math.min(target, maxHeight);
        }
    });

    let overflowing = $derived((heights[view] ?? 0) > maxHeight);
</script>

<div
    class="glass-card w-full p-8 relative overflow-hidden transition-all duration-500 ease-out {activeTab.maxWidth}"
>
    <nav class="flex gap-1 justify-end mb-6">
        {#each TABS as tab (tab.key)}
            <button
                onclick={() => (view = tab.key)}
                class="px-3 py-1.5 text-sm rounded-lg transition-all cursor-pointer {view ===
                tab.key
                    ? 'text-white bg-white/10'
                    : 'text-white/70 hover:text-white hover:bg-white/10'}"
            >
                {tab.label}
            </button>
        {/each}
    </nav>

    <div
        class="view-container"
        class:animate={ready}
        class:scrollable={overflowing}
        style="height: {ready ? containerHeight + 'px' : 'auto'}"
    >
        {#each TABS as tab (tab.key)}
            {#if view === tab.key}
                {@const View = views[tab.key]}
                <div
                    class="view-panel {tab.panelMaxWidth ?? ''}"
                    bind:clientHeight={rawHeights[tab.key]}
                    in:fly={{
                        ...tab.transition,
                        duration: 400,
                        delay: 200,
                        easing: cubicOut,
                    }}
                    out:fade={{ duration: 200 }}
                >
                    <View />
                </div>
            {/if}
        {/each}
    </div>
</div>

<style>
    .view-container {
        display: grid;
        grid-template: 1fr / 1fr;
    }

    .view-container.animate {
        transition: height 0.5s cubic-bezier(0.33, 1, 0.68, 1);
    }

    .view-container.scrollable {
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
    }

    .view-panel {
        grid-area: 1 / 1;
        align-self: start;
    }
</style>
