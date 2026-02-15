<script lang="ts">
    import { TABS } from '../lib/data';

    interface Props {
        view: string;
        onchange: (key: string) => void;
    }

    let { view, onchange }: Props = $props();
</script>

<div class="flex gap-1" role="tablist">
    {#each TABS as tab (tab.key)}
        <button
            onclick={() => onchange(tab.key)}
            role="tab"
            aria-selected={view === tab.key}
            class="px-3 py-1.5 text-sm rounded-lg transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 {view ===
            tab.key
                ? 'text-white bg-white/10'
                : 'text-white/70 hover:text-white hover:bg-white/10'}"
        >
            {tab.label}
        </button>
    {/each}
</div>
