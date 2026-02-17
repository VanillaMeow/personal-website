<script lang="ts">
    import { rainState } from '../../lib/sharedState.svelte';

    function clamp(v: number, min: number, max: number): number {
        return Math.min(Math.max(v, min), max);
    }

    // Root curve: coarse near 0, fine-grained near max
    const MAX = 100_000;
    const EXP = 0.33;

    function sliderToCount(v: number): number {
        v = clamp(v, 0, 1);
        return Math.round(MAX * v ** (1 / EXP));
    }

    function countToSlider(c: number): number {
        c = clamp(c, 0, MAX);
        return (c / MAX) ** EXP;
    }

    function formatCount(n: number): string {
        if (n >= 1000) {
            return `${(n / 1000).toFixed(1)}k`;
        }
        return String(n);
    }

    let sliderValue = $derived(countToSlider(rainState.dropCount));

    function blurOnRelease(e: Event) {
        (e.target as HTMLElement).blur();
    }
</script>

<div class="rain-control group flex items-center gap-2">
    <span class="i-lucide-cloud-rain text-white/40 text-base shrink-0"></span>
    <div class="rain-slider-wrap">
        <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            bind:value={sliderValue}
            oninput={() => {
                rainState.dropCount = sliderToCount(sliderValue);
            }}
            onchange={blurOnRelease}
            class="rain-slider"
            aria-label="Rain drop count"
        />
        <span class="text-xs text-white/40 tabular-nums whitespace-nowrap">
            {formatCount(rainState.dropCount)}
        </span>
    </div>
</div>

<style>
    .rain-slider-wrap {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        max-width: 0;
        opacity: 0;
        overflow: hidden;
        transition:
            max-width 0.3s cubic-bezier(0.33, 1, 0.68, 1),
            opacity 0.3s ease;
    }

    .rain-control:hover .rain-slider-wrap,
    .rain-control:focus-within .rain-slider-wrap {
        max-width: 10rem;
        opacity: 1;
    }

    .rain-slider {
        width: 6rem;
        height: 4px;
        appearance: none;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 2px;
        outline: none;
        cursor: pointer;
    }

    .rain-slider::-webkit-slider-thumb {
        appearance: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transition: background 0.15s;
    }

    .rain-slider::-webkit-slider-thumb:hover {
        background: rgba(255, 255, 255, 0.8);
    }

    .rain-slider::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border: none;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transition: background 0.15s;
    }

    .rain-slider::-moz-range-thumb:hover {
        background: rgba(255, 255, 255, 0.8);
    }
</style>
