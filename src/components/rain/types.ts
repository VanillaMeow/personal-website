export type ToWorkerMsg =
    | { type: 'init'; canvas: OffscreenCanvas }
    | { type: 'resize'; width: number; height: number; dpr: number }
    | { type: 'setDrops'; count: number }
    | { type: 'visibility'; hidden: boolean };
