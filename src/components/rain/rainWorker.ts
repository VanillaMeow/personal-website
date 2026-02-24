/// <reference lib="webworker" />

import { RainShaderGLRenderer } from './rainShaderGL';
import type { ToWorkerMsg } from './types';

let paused = false;
let accumulatedTime = 0;
let lastTimestamp = 0;
let renderer: RainShaderGLRenderer | null = null;
let frameStarted = false;

function draw(now: DOMHighResTimeStamp): void {
    if (!renderer) {
        frameStarted = false;
        return;
    }

    if (!paused) {
        accumulatedTime += (now - lastTimestamp) / 1000;
    }
    lastTimestamp = now;
    renderer.render(accumulatedTime);
    requestAnimationFrame(draw);
}

self.onmessage = (event: MessageEvent<ToWorkerMsg>) => {
    const msg = event.data;

    switch (msg.type) {
        case 'init': {
            if (renderer) {
                break;
            }

            try {
                renderer = new RainShaderGLRenderer(msg.canvas);
                lastTimestamp = performance.now();
                if (!frameStarted) {
                    frameStarted = true;
                    requestAnimationFrame(draw);
                }
            } catch (error) {
                renderer = null;
                frameStarted = false;
                console.error('Failed to initialize RainShaderGLRenderer:', error);
            }
            break;
        }

        case 'resize': {
            renderer?.resize(msg.width, msg.height, msg.dpr);
            break;
        }

        case 'setDrops': {
            renderer?.setDrops(msg.count);
            break;
        }

        case 'visibility': {
            paused = msg.hidden;
            if (!msg.hidden) {
                lastTimestamp = performance.now();
            }
            break;
        }
    }
};
