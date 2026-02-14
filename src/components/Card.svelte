<script lang="ts">
    import { fly, fade } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import PortfolioView from './PortfolioView.svelte';
    import HomeView from './HomeView.svelte';

    let view = $state<'home' | 'portfolio'>('home');

    // Raw bindings (go to 0 on unmount)
    let rawHomeHeight = $state(0);
    let rawPortfolioHeight = $state(0);

    // Cached heights that ignore 0 from unmount
    let homeHeight = $state(0);
    let portfolioHeight = $state(0);

    // Whether initial measurement is done (prevents animate-from-0 on load)
    let ready = $state(false);

    $effect(() => {
        if (rawHomeHeight > 0) {
            homeHeight = rawHomeHeight;
            if (!ready) ready = true;
        }
    });

    $effect(() => {
        if (rawPortfolioHeight > 0) {
            portfolioHeight = rawPortfolioHeight;
        }
    });

    // Only update container height when target view has a real measurement.
    // This holds the previous height until the new panel reports in.
    // Capped at 70vh so the card doesn't overflow the viewport.
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
        const target = view === 'home' ? homeHeight : portfolioHeight;
        if (target > 0) {
            containerHeight = Math.min(target, maxHeight);
        }
    });

    let overflowing = $derived(
        (view === 'home' ? homeHeight : portfolioHeight) > maxHeight,
    );
</script>

<div
    class="glass-card w-full p-8 relative overflow-hidden transition-all duration-500 ease-out
    {view === 'home' ? 'max-w-md' : 'max-w-2xl'}"
>
    <nav class="flex gap-1 justify-end mb-6">
        <button
            onclick={() => (view = 'home')}
            class="px-3 py-1.5 text-sm rounded-lg transition-all cursor-pointer {view ===
            'home'
                ? 'text-white bg-white/10'
                : 'text-white/70 hover:text-white hover:bg-white/10'}"
        >
            home
        </button>
        <button
            onclick={() => (view = 'portfolio')}
            class="px-3 py-1.5 text-sm rounded-lg transition-all cursor-pointer {view ===
            'portfolio'
                ? 'text-white bg-white/10'
                : 'text-white/70 hover:text-white hover:bg-white/10'}"
        >
            portfolio
        </button>
    </nav>

    <div
        class="view-container"
        class:animate={ready}
        class:scrollable={overflowing}
        style="height: {ready ? containerHeight + 'px' : 'auto'}"
    >
        {#if view === 'home'}
            <div
                class="view-panel max-w-sm"
                bind:clientHeight={rawHomeHeight}
                in:fly={{ y: 20, duration: 400, delay: 200, easing: cubicOut }}
                out:fade={{ duration: 200 }}
            >
                <HomeView />
            </div>
        {/if}

        {#if view === 'portfolio'}
            <div
                class="view-panel"
                bind:clientHeight={rawPortfolioHeight}
                in:fly={{ x: -20, duration: 400, delay: 200, easing: cubicOut }}
                out:fade={{ duration: 200 }}
            >
                <PortfolioView />
            </div>
        {/if}
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
