<script lang="ts">
    import { rainState } from '../../lib/sharedState.svelte';

    let canvas: HTMLCanvasElement;

    interface Raindrop {
        x: number;
        y: number;
        length: number;
        speed: number;
        bucket: number;
    }

    const DROP_RATE = 5;
    const OPACITY_BUCKETS = [0.1, 0.2, 0.3, 0.4];

    $effect(() => {
        const maybeCtx = canvas.getContext('2d');
        if (!maybeCtx) {
            return;
        }
        const ctx = maybeCtx;

        let dpr = window.devicePixelRatio || 1;
        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        const bucketStyles = OPACITY_BUCKETS.map(
            (o) => `rgba(174, 194, 224, ${o})`,
        );

        const drops: Raindrop[] = Array.from(
            { length: rainState.dropCount },
            () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                length: 15 + Math.random() * 25,
                speed: DROP_RATE + Math.random() * DROP_RATE * 2,
                bucket: Math.floor(Math.random() * OPACITY_BUCKETS.length),
            }),
        );

        // Pre-sort so contiguous runs share the same stroke style
        drops.sort((a, b) => a.bucket - b.bucket);

        let animationId: number;

        function draw() {
            ctx.clearRect(0, 0, width, height);
            ctx.lineWidth = 1;

            let currentBucket = -1;
            for (const drop of drops) {
                if (drop.bucket !== currentBucket) {
                    if (currentBucket !== -1) {
                        ctx.stroke();
                    }

                    currentBucket = drop.bucket;
                    ctx.beginPath();
                    ctx.strokeStyle = bucketStyles[currentBucket];
                }

                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x, drop.y + drop.length);

                drop.y += drop.speed;
                if (drop.y > height) {
                    drop.y = -drop.length;
                    drop.x = Math.random() * width;
                }
            }
            if (currentBucket !== -1) {
                ctx.stroke();
            }

            animationId = requestAnimationFrame(draw);
        }

        draw();

        const onResize = () => {
            dpr = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', onResize);
        };
    });
</script>

<canvas
    bind:this={canvas}
    class="fixed inset-0 z-0 pointer-events-none"
    aria-hidden="true"
></canvas>
