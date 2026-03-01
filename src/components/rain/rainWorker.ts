/// <reference lib="webworker" />

import { RainShaderGLRenderer } from './rainShaderGL';
import type { ToWorkerMsg } from './types';

let renderer: RainShaderGLRenderer | undefined;

function onMessageCallback(event: MessageEvent<ToWorkerMsg>): void {
    const msg = event.data;

    switch (msg.type) {
        case 'init': {
            try {
                renderer?.stop();
                renderer = new RainShaderGLRenderer(msg.canvas);
                renderer.start();
            } catch (error) {
                console.error(
                    'Failed to initialize RainShaderGLRenderer:',
                    error,
                );
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

        case 'setVisibility': {
            renderer?.setVisibility(msg.hidden);
            break;
        }
    }
}

// Bind message handler
self.onmessage = onMessageCallback;
