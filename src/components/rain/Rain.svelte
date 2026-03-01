<script lang="ts">
    import { rainState } from '../../lib/sharedState.svelte';
    import type { ToWorkerMsg } from './types';

    let canvas: HTMLCanvasElement;
    let workerRef: Worker | null = null;

    const BASE_DROP_COUNT = 2500;
    const BASELINE_WIDTH = 1920;
    function getScaledDropCount(): number {
        return Math.round(
            BASE_DROP_COUNT * (window.innerWidth / BASELINE_WIDTH),
        );
    }

    // Effect 1: Worker lifecycle — runs once on mount
    // Effect 1 has no reactive reads, so a dropCount change never recreates the worker
    // (which would break transferControlToOffscreen, which can only be called once per canvas)
    $effect(() => {
        // Create worker
        const worker = new Worker(new URL('./rainWorker.ts', import.meta.url), {
            type: 'module',
        });
        workerRef = worker;

        // Init canvas
        const offscreenCanvas = canvas.transferControlToOffscreen();

        // Init drop count
        rainState.dropCount = getScaledDropCount();

        // Init worker
        worker.postMessage(
            { type: 'init', canvas: offscreenCanvas } satisfies ToWorkerMsg,
            [offscreenCanvas],
        );
        worker.postMessage({
            type: 'resize',
            width: window.innerWidth,
            height: window.innerHeight,
            dpr: window.devicePixelRatio || 1,
        } satisfies ToWorkerMsg);

        // Hook resize event
        let resizeTimeout: ReturnType<typeof setTimeout>;
        function onResize() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                rainState.dropCount = getScaledDropCount();
                worker.postMessage({
                    type: 'resize',
                    width: window.innerWidth,
                    height: window.innerHeight,
                    dpr: window.devicePixelRatio || 1,
                } satisfies ToWorkerMsg);
            }, 25);
        }
        window.addEventListener('resize', onResize);

        // Hook visibility change
        function onVisibilityChange() {
            worker.postMessage({
                type: 'setVisibility',
                hidden: document.hidden,
            } satisfies ToWorkerMsg);
        }
        document.addEventListener('visibilitychange', onVisibilityChange);

        // Cleanup
        return () => {
            workerRef = null;
            worker.terminate();
            clearTimeout(resizeTimeout);
            window.removeEventListener('resize', onResize);
            document.removeEventListener(
                'visibilitychange',
                onVisibilityChange,
            );
        };
    });

    // Effect 2: Forward dropCount changes to the worker (slider or resize)
    $effect(() => {
        workerRef?.postMessage({
            type: 'setDrops',
            count: rainState.dropCount,
        } satisfies ToWorkerMsg);
    });
</script>

<canvas
    bind:this={canvas}
    class="fixed inset-0 z-0 pointer-events-none"
    aria-hidden="true"
>
</canvas>
