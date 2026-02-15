<script lang="ts">
    import type { Component } from 'svelte';
    import { cubicOut } from 'svelte/easing';
    import { fade, fly } from 'svelte/transition';

    import { TABS } from '../lib/data';
    import RainSlider from './rain/RainSlider.svelte';
    import TabNav from './TabNav.svelte';
    import HomeView from './views/HomeView.svelte';
    import PortfolioView from './views/PortfolioView.svelte';

    const IN_TRANSITION_DURATION = 400;

    const VIEWS: Record<string, Component> = {
        home: HomeView,
        portfolio: PortfolioView,
    };

    // Set initial view after mount so {#if} insertion triggers in: transitions
    let view = $state('');
    let activeTab = $derived(TABS.find((t) => t.key === view) ?? TABS[0]);
    $effect(() => {
        if (!view) {
            view = TABS[0].key;
        }
    });

    // Cache the active view's height, ignoring 0 from unmount
    let rawHeights: Record<string, number> = $state({});
    let cachedHeight = $state(0);
    let ready = $state(false);
    $effect(() => {
        const h = rawHeights[view];
        if (h && h > 0) {
            cachedHeight = h;
            ready = true;
        }
    });

    let maxHeight = $state(600);

    $effect(() => {
        const getVh = () => window.visualViewport?.height ?? window.innerHeight;
        maxHeight = Math.round(getVh() * 0.7);
        const onResize = () => {
            maxHeight = Math.round(getVh() * 0.7);
        };
        window.addEventListener('resize', onResize);
        window.visualViewport?.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
            window.visualViewport?.removeEventListener('resize', onResize);
        };
    });

    let containerHeight = $derived(Math.min(cachedHeight, maxHeight));
    let overflowing = $derived(cachedHeight > maxHeight);
</script>

<div
    class="glass-card w-full p-4 sm:p-6 md:p-8 relative overflow-hidden transition-all duration-500 ease-out {activeTab.maxWidth}"
    in:fade={{ duration: IN_TRANSITION_DURATION, easing: cubicOut }}
>
    <!-- Header row: rain control + tabs -->
    <div
        class="flex items-center justify-between mb-6 select-none"
        in:fade={{
            duration: IN_TRANSITION_DURATION,
            delay: IN_TRANSITION_DURATION * 1.5,
            easing: cubicOut,
        }}
    >
        <RainSlider />
        <TabNav {view} onchange={(key) => (view = key)} />
    </div>

    <div
        class="view-container"
        class:animate={ready}
        class:scrollable={overflowing}
        style="height: {ready ? containerHeight + 'px' : 'auto'}"
    >
        {#each TABS as tab (tab.key)}
            {#if view === tab.key}
                {@const View = VIEWS[tab.key]}
                <div
                    class="view-panel {tab.panelMaxWidth ?? ''}"
                    bind:clientHeight={rawHeights[tab.key]}
                    in:fly={{
                        ...tab.transition,
                        duration: 400,
                        delay: IN_TRANSITION_DURATION / 2,
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
