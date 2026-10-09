<!-- @unocss-skip-start -->

<script lang="ts">
    import { onMount, untrack } from 'svelte';
    import { introState, rainState } from '../../lib/sharedState.svelte';
    import type { FromWorkerMsg, ToWorkerMsg } from './types';

    const BASE_DROP_COUNT = 2500;
    const BASELINE_WIDTH = 1920;

    let resizeFrame: number | null = null;
    let canvas: HTMLCanvasElement;
    let worker: Worker;
    let ready = $state(false);

    onMount(() => {
        rainState.dropCount = getScaledDropCount(window.innerWidth);
    });

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

    function startRain() {
        // Create worker
        worker = new Worker(new URL('./rainWorker.ts', import.meta.url), {
            type: 'module',
        });
        worker.onmessage = (event: MessageEvent<FromWorkerMsg>) => {
            if (event.data.type === 'ready') {
                ready = true;
            }
        };

        // Init canvas
        const offscreenCanvas = canvas.transferControlToOffscreen();
        const { width, height } = canvas.getBoundingClientRect();
        let lastWidth = width;
        let lastHeight = height;
        let lastDpr = window.devicePixelRatio;

        // Init worker
        worker.postMessage(
            {
                type: 'init',
                canvas: offscreenCanvas,
                width,
                height,
                dpr: window.devicePixelRatio,
                count: rainState.dropCount,
                hidden: document.hidden,
            } satisfies ToWorkerMsg,
            [offscreenCanvas],
        );

        // Hook resize events
        const resizeObserver = new ResizeObserver(() => {
            const bounds = canvas.getBoundingClientRect();
            if (
                bounds.width === lastWidth &&
                bounds.height === lastHeight &&
                window.devicePixelRatio === lastDpr
            ) {
                return;
            }
            lastWidth = bounds.width;
            lastHeight = bounds.height;
            lastDpr = window.devicePixelRatio;

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
    }

    $effect(() => {
        if (!introState.complete) {
            return;
        }

        // Slider updates must not recreate a transferred canvas or its worker
        return untrack(startRain);
    });

    // Effect 2: Forward dropCount changes to the worker (slider or resize)
    $effect(() => {
        // Subscribe even before the delayed worker exists. Optional chaining
        // otherwise skips this state read and the effect never runs again
        const count = rainState.dropCount;
        worker?.postMessage({
            type: 'setDrops',
            count,
        } satisfies ToWorkerMsg);
    });
</script>

<!-- @unocss-skip-end -->

<canvas
    bind:this={canvas}
    class="fixed inset-0 z-0 pointer-events-none w-screen h-screen"
    class:ready
    aria-hidden="true"
>
</canvas>

<style>
    canvas {
        opacity: 0;
        transition: opacity 1000ms ease-in 200ms;
    }

    canvas.ready {
        opacity: 1;
    }

    @media (prefers-reduced-motion: reduce) {
        canvas {
            transition: none;
        }
    }
</style>
