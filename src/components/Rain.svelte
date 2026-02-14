<script lang="ts">
    let canvas: HTMLCanvasElement;

    interface Raindrop {
        x: number;
        y: number;
        length: number;
        speed: number;
        opacity: number;
    }

    const DROP_COUNT = 200;

    $effect(() => {
        const maybeCtx = canvas.getContext('2d');
        if (!maybeCtx) return;
        const ctx = maybeCtx;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const drops: Raindrop[] = Array.from({ length: DROP_COUNT }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            length: 15 + Math.random() * 25,
            speed: 4 + Math.random() * 8,
            opacity: 0.1 + Math.random() * 0.3,
        }));

        let animationId: number;

        function draw() {
            ctx.clearRect(0, 0, width, height);
            for (const drop of drops) {
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x, drop.y + drop.length);
                ctx.strokeStyle = `rgba(174, 194, 224, ${drop.opacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();

                drop.y += drop.speed;

                if (drop.y > height) {
                    drop.y = -drop.length;
                    drop.x = Math.random() * width;
                }
            }
            animationId = requestAnimationFrame(draw);
        }

        draw();

        const onResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', onResize);
        };
    });
</script>

<canvas bind:this={canvas} class="fixed inset-0 z-0 pointer-events-none"
></canvas>
