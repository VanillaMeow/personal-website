<script lang="ts">
    import { TABS, type Tab } from '../lib/data';

    interface Props {
        view: string;
        onchange: (key: string) => void;
    }

    let { view, onchange }: Props = $props();

    const viewButtonBaseCss: string =
        'px-3 py-1.5 text-sm rounded-lg transition-all cursor-pointer';

    const focusVisibleCss: string =
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50';
</script>

{#snippet viewButton(tab: Tab)}
    <button
        type="button"
        role="tab"
        onclick={() => onchange(tab.key)}
        aria-selected={view === tab.key}
        class="{viewButtonBaseCss} {focusVisibleCss} {view === tab.key
            ? 'text-white bg-white/10'
            : 'text-white/70 hover:text-white hover:bg-white/10'}"
    >
        {tab.label}
    </button>
{/snippet}

<div class="flex gap-1" role="tablist">
    {#each TABS as tab (tab.key)}
        {@render viewButton(tab)}
    {/each}
</div>
