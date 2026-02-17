<script lang="ts">
    import type { Component } from 'svelte';
    import { cubicOut } from 'svelte/easing';
    import { fade, fly } from 'svelte/transition';

    import { GITHUB_OWNER, REPO_BASE, REPO_SLUGS, TABS } from '../lib/data';
    import { fetchRepos } from '../lib/github.svelte';
    import { createViewTransition, INTRO_TRANSITION_DURATION } from '../lib/viewTransition.svelte';
    import RainSlider from './rain/RainSlider.svelte';
    import TabNav from './TabNav.svelte';
    import HomeView from './views/HomeView.svelte';
    import PortfolioView from './views/PortfolioView.svelte';

    const VIEWS: Record<string, Component> = {
        home: HomeView,
        portfolio: PortfolioView,
    };

    const vt = createViewTransition();

    // Lazy fetch repos on mount
    $effect(() => {
        fetchRepos(REPO_SLUGS, GITHUB_OWNER, REPO_BASE);
    });

    let cardEl: HTMLDivElement;
    let containerEl: HTMLDivElement;
</script>

<div
    bind:this={cardEl}
    class="card glass-card w-full p-4 sm:p-6 md:p-8 relative overflow-hidden {vt.activeTab.maxWidth}"
    in:fade={{ duration: INTRO_TRANSITION_DURATION, easing: cubicOut }}
>
    <!-- Header row: rain control + tabs -->
    <div
        class="flex items-center justify-between mb-6 select-none"
        in:fade={{
            duration: INTRO_TRANSITION_DURATION,
            delay: INTRO_TRANSITION_DURATION,
            easing: cubicOut,
        }}
    >
        <RainSlider />
        <TabNav view={vt.view} onchange={(v) => vt.switchView(v, cardEl, containerEl)} />
    </div>

    <div
        bind:this={containerEl}
        class="view-container"
        style:overflow-y={vt.clipping ? 'clip' : 'auto'}
        style:height={vt.ready ? vt.containerHeight + 'px' : 'auto'}
    >
        {#each TABS as tab (tab.key)}
            {#if vt.view === tab.key}
                {@const View = VIEWS[tab.key]}
                <div
                    class="view-panel {tab.panelMaxWidth ?? ''}"
                    data-view={tab.key}
                    bind:clientHeight={vt.rawHeights[tab.key]}
                    in:fly={{
                        ...tab.transition,
                        duration: 400,
                        delay: INTRO_TRANSITION_DURATION / 2,
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
    .card {
        interpolate-size: allow-keywords;
        transition: height 0.3s cubic-bezier(0.33, 1, 0.68, 1);
    }

    .view-container {
        display: grid;
        grid-template: 1fr / 1fr;
        max-height: 70dvh;
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
    }

    .view-panel {
        grid-area: 1 / 1;
        align-self: start;
    }
</style>
