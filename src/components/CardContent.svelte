<!-- @unocss-skip-start -->

<script lang="ts">
    import type { Component } from 'svelte';
    import { onMount, untrack } from 'svelte';
    import { cubicOut } from 'svelte/easing';
    import { Tween } from 'svelte/motion';
    import { fade, fly } from 'svelte/transition';

    import { INTRO_TRANSITION_DURATION, TABS } from '../lib/data';
    import { introState } from '../lib/sharedState.svelte';
    import RainSlider from './rain/RainSlider.svelte';
    import TabNav from './TabNav.svelte';
    import HomeView from './views/HomeView.svelte';
    import PortfolioView from './views/PortfolioView.svelte';

    const VIEWS: Record<string, Component> = {
        home: HomeView,
        portfolio: PortfolioView,
    };

    let activeTab = $state(TABS[0]);
    let mounted = $state(false);
    let measured = $state(false);

    let transitions = $state(0);
    let heights = $state<Partial<Record<string, number>>>({});
    const height = new Tween(0, { duration: 500, easing: cubicOut });
    const moving = $derived(
        transitions > 0 || height.current !== height.target,
    );

    onMount(() => {
        mounted = true;
    });

    $effect(() => {
        const nextHeight = heights[activeTab.key];
        if (nextHeight !== undefined) {
            untrack(() => {
                void height.set(
                    nextHeight,
                    measured ? undefined : { duration: 0 },
                );
                measured = true;
            });
        }
    });

    function switchView(key: string): void {
        const tab = TABS.find((tab) => tab.key === key);
        if (tab && tab.key !== activeTab.key && measured && !moving) {
            activeTab = tab;
        }
    }
</script>

<!-- @unocss-skip-end -->

<div class="card-space flex justify-center">
    <div
        class="card glass-card w-full relative overflow-hidden backdrop-blur-xl"
        class:moving
        style:max-width={activeTab.maxWidth}
    >
        <div
            class="flex items-center justify-between mb-6 select-none"
            in:fade={{
                duration: INTRO_TRANSITION_DURATION,
                delay: INTRO_TRANSITION_DURATION,
                easing: cubicOut,
            }}
            onintroend={() => {
                introState.complete = true;
            }}
        >
            <RainSlider />
            <TabNav view={activeTab.key} onchange={switchView} />
        </div>

        <div
            class="view-container"
            style:height={measured ? `${height.current}px` : 'auto'}
            onintrostartcapture={() => transitions++}
            onintroendcapture={() => transitions--}
            onoutrostartcapture={() => transitions++}
            onoutroendcapture={() => transitions--}
        >
            {#each TABS as tab (tab.key)}
                {#if mounted && activeTab.key === tab.key}
                    {@const View = VIEWS[tab.key]}
                    <div
                        class="view-panel"
                        data-view={tab.key}
                        style:--view-max-width={tab.maxWidth}
                        bind:clientHeight={heights[tab.key]}
                        in:fly={{ ...tab.transition, easing: cubicOut }}
                        out:fade={{ duration: 200, easing: cubicOut }}
                        onoutrostart={(event) => {
                            event.currentTarget.inert = true;
                        }}
                    >
                        <View />
                    </div>
                {/if}
            {/each}
        </div>
    </div>
</div>

<style>
    .card-space {
        container-type: inline-size;
    }

    .card {
        --card-padding: 1rem;
        padding: var(--card-padding);
        transition: max-width 500ms cubic-bezier(0.33, 1, 0.68, 1);
    }

    @media (prefers-reduced-motion: no-preference) {
        .card {
            /* Fade the filtered element itself, not an ancestor backdrop root */
            transition:
                max-width 500ms cubic-bezier(0.33, 1, 0.68, 1),
                opacity 500ms ease-in-out;

            @starting-style {
                opacity: 0;
            }
        }
    }

    @media (min-width: 640px) {
        .card {
            --card-padding: 1.5rem;
        }
    }

    @media (min-width: 768px) {
        .card {
            --card-padding: 2rem;
        }
    }

    .view-container {
        display: grid;
        grid-template: 1fr / 1fr;
    }

    .view-panel {
        grid-area: 1 / 1;
        align-self: start;

        /* Measure at the view's final width, not the animated card width */
        /* -2px comes from glass-card's border */
        width: calc(
            min(100cqw, var(--view-max-width)) - 2 * var(--card-padding) - 2px
        );

        max-height: 70dvh;
        overflow: hidden auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
    }

    .card.moving .view-panel {
        /* Let both views animate into the padding; the card clips its edges */
        overflow: visible;
    }
</style>
