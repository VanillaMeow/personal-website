<script lang="ts">
    import { rainState } from '../../lib/sharedState.svelte';

    let canvas: HTMLCanvasElement;

    interface Raindrop {
        x: number;
        y: number;
        length: number;
        speed: number;
    }

    const BASE_DROP_COUNT = rainState.dropCount;
    const DROP_SPEED = 333;

    const OPACITY_BUCKETS = [0.1, 0.2, 0.3, 0.4];
    const BUCKET_STYLES = OPACITY_BUCKETS.map((o) => `rgba(174, 194, 224, ${o})`);

    const BASELINE_WIDTH = 1920;
    function _getScaledDropCount(): number {
        return Math.round(BASE_DROP_COUNT * (window.innerWidth / BASELINE_WIDTH));
    }

    function resizeCanvas(ctx: CanvasRenderingContext2D) {
        const dpr = window.devicePixelRatio || 1;
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    rainState.dropCount = _getScaledDropCount();
    let width: number;
    let height: number;

    $effect(() => {
        const maybeCtx = canvas.getContext('2d');
        if (!maybeCtx) {
            return;
        }
        const ctx = maybeCtx;

        // Set initial canvas ctx
        resizeCanvas(ctx);
        ctx.lineWidth = 1;

        // Allocate drops
        const DROPS: Raindrop[][] = Array.from({ length: OPACITY_BUCKETS.length }, () => []);
        for (let i = 0; i < rainState.dropCount; i++) {
            DROPS[i % OPACITY_BUCKETS.length].push({
                x: Math.random() * width,
                y: Math.random() * height,
                length: 15 + Math.random() * 25,
                speed: DROP_SPEED + Math.random() * DROP_SPEED * 2,
            });
        }

        // Animation state
        let animationId: number;
        let lastTime = performance.now();
        let deltaTime = 1;

        // Main draw loop
        function draw(currentTime: DOMHighResTimeStamp) {
            deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;

            ctx.clearRect(0, 0, width, height);

            for (const [b, style] of BUCKET_STYLES.entries()) {
                ctx.beginPath();
                ctx.strokeStyle = style;
                for (const drop of DROPS[b]) {
                    ctx.moveTo(drop.x, drop.y);
                    ctx.lineTo(drop.x, drop.y + drop.length);

                    drop.y += drop.speed * deltaTime;
                    if (drop.y > height) {
                        drop.y = ((drop.y + drop.length) % (height + drop.length)) - drop.length;
                        drop.x = Math.random() * width;
                    }
                }
                ctx.stroke();
            }

            animationId = requestAnimationFrame(draw);
        }

        // Begin drawing rain
        draw(lastTime);

        // Resize canvas on window resize
        let resizeTimeout: ReturnType<typeof setTimeout>;
        function onResize() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                resizeCanvas(ctx);
                rainState.dropCount = _getScaledDropCount();
            }, 25);
        }
        window.addEventListener('resize', onResize);

        // Reset time on visibility change
        function onVisibilityChange() {
            if (!document.hidden) {
                lastTime = performance.now();
            }
        }
        document.addEventListener('visibilitychange', onVisibilityChange);

        // Cleanup
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', onResize);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    });
</script>

<canvas bind:this={canvas} class="fixed inset-0 z-0 pointer-events-none" aria-hidden="true"></canvas>
