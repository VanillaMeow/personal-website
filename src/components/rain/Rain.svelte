<!-- @unocss-skip-start -->

<script lang="ts">
    import { rainState } from '../../lib/sharedState.svelte';
    import type { ToWorkerMsg } from './types';

    const BASE_DROP_COUNT = 2500;
    const BASELINE_WIDTH = 1920;

    let resizeFrame: number | null = null;
    let canvas: HTMLCanvasElement;
    let worker: Worker;

    function getScaledDropCount(width: number): number {
        width = width * window.devicePixelRatio;
        return Math.round(BASE_DROP_COUNT * (width / BASELINE_WIDTH));
    }

    function resizeRain(worker: Worker): void {
        const { width, height } = canvas.getBoundingClientRect();

        rainState.dropCount = getScaledDropCount(width);
        worker.postMessage({
            type: 'resize',
            width,
            height,
            dpr: window.devicePixelRatio,
        } satisfies ToWorkerMsg);
    }

    // Effect 1: Worker lifecycle — runs once on mount
    // Effect 1 has no reactive reads, so a dropCount change never recreates the worker
    // (which would break transferControlToOffscreen, which can only be called once per canvas)
    $effect(() => {
        // Create worker
        worker = new Worker(new URL('./rainWorker.ts', import.meta.url), {
            type: 'module',
        });

        // Init canvas
        const offscreenCanvas = canvas.transferControlToOffscreen();

        // Init worker
        worker.postMessage(
            { type: 'init', canvas: offscreenCanvas } satisfies ToWorkerMsg,
            [offscreenCanvas],
        );

        // Init resize
        resizeRain(worker);

        // Hook resize events
        const resizeObserver = new ResizeObserver(() => {
            if (resizeFrame !== null) {
                cancelAnimationFrame(resizeFrame);
            }

            resizeFrame = requestAnimationFrame(() => {
                resizeFrame = null;
                resizeRain(worker);
            });
        });
        resizeObserver.observe(canvas);

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
            if (resizeFrame !== null) {
                cancelAnimationFrame(resizeFrame);
            }
            worker.terminate();
            resizeObserver.disconnect();
            document.removeEventListener(
                'visibilitychange',
                onVisibilityChange,
            );
        };
    });

    // Effect 2: Forward dropCount changes to the worker (slider or resize)
    $effect(() => {
        worker?.postMessage({
            type: 'setDrops',
            count: rainState.dropCount,
        } satisfies ToWorkerMsg);
    });
</script>

<!-- @unocss-skip-end -->

<canvas
    bind:this={canvas}
    class="fixed inset-0 z-0 pointer-events-none w-screen h-screen"
    aria-hidden="true"
>
</canvas>
