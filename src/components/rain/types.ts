export type ToWorkerMsg =
    | {
          type: 'init';
          canvas: OffscreenCanvas;
          width: number;
          height: number;
          dpr: number;
          count: number;
          hidden: boolean;
      }
    | { type: 'resize'; width: number; height: number; dpr: number }
    | { type: 'setDrops'; count: number }
    | { type: 'setVisibility'; hidden: boolean };

export type FromWorkerMsg = { type: 'ready' };
