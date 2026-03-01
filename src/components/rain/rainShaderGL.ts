import * as twgl from 'twgl.js';
import fragSrc from './rainShader.frag?raw';
import vertSrc from './rainShader.vert?raw';

const INITIAL_CAPACITY = 1024;
const U16_RANGE = 65536;

function randomU16(): number {
    return Math.floor(Math.random() * U16_RANGE);
}

export class RainShaderGLRenderer {
    private readonly gl: WebGL2RenderingContext;
    private readonly programInfo: twgl.ProgramInfo;
    private bufferInfo!: twgl.BufferInfo;

    // Configuration
    private dropCount = 0;
    private resolution: [number, number] = [1, 1];
    private capacity = 0;

    // Data buffers
    private xData: Uint16Array = new Uint16Array();
    private speedData: Uint16Array = new Uint16Array();
    private lengthData: Uint16Array = new Uint16Array();
    private phaseData: Uint16Array = new Uint16Array();

    // Rendering state
    private paused = false;
    private accumulatedTime = 0;
    private lastTimestamp = 0;
    private animationFrameId: number | null = null;

    public constructor(canvas: OffscreenCanvas) {
        const ctx = canvas.getContext('webgl2');
        if (!ctx) {
            throw new Error('WebGL2 is unavailable for RainShaderGLRenderer.');
        }

        this.gl = ctx;
        this.programInfo = twgl.createProgramInfo(this.gl, [vertSrc, fragSrc]);
        this.gl.useProgram(this.programInfo.program);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.clearColor(0, 0, 0, 0);

        this.resolution = [Math.max(1, this.gl.drawingBufferWidth), Math.max(1, this.gl.drawingBufferHeight)];
        this._ensureCapacity(INITIAL_CAPACITY);
        this._syncResolutionUniform();
        this._syncDropCountUniform();
    }

    private _fillRandomRange(start: number, end: number): void {
        for (let i = start; i < end; i++) {
            this.xData[i] = randomU16();
            this.speedData[i] = randomU16();
            this.lengthData[i] = randomU16();
            this.phaseData[i] = randomU16();
        }
    }

    private _uploadAllAttributes(): void {
        if (!this.bufferInfo.attribs) {
            return;
        }

        twgl.setAttribInfoBufferFromArray(this.gl, this.bufferInfo.attribs.a_x, this.xData);
        twgl.setAttribInfoBufferFromArray(this.gl, this.bufferInfo.attribs.a_speed_t, this.speedData);
        twgl.setAttribInfoBufferFromArray(this.gl, this.bufferInfo.attribs.a_length_t, this.lengthData);
        twgl.setAttribInfoBufferFromArray(this.gl, this.bufferInfo.attribs.a_phase, this.phaseData);
    }

    private _syncResolutionUniform(): void {
        twgl.setUniforms(this.programInfo, { u_resolution: this.resolution });
    }

    private _syncDropCountUniform(): void {
        twgl.setUniforms(this.programInfo, { u_drop_count: this.dropCount });
    }

    private _initAttributeBuffers(): void {
        this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, {
            a_x: {
                numComponents: 1,
                data: this.xData,
                type: this.gl.UNSIGNED_SHORT,
                normalize: true,
                divisor: 1,
                drawType: this.gl.DYNAMIC_DRAW,
            },
            a_speed_t: {
                numComponents: 1,
                data: this.speedData,
                type: this.gl.UNSIGNED_SHORT,
                normalize: true,
                divisor: 1,
                drawType: this.gl.DYNAMIC_DRAW,
            },
            a_length_t: {
                numComponents: 1,
                data: this.lengthData,
                type: this.gl.UNSIGNED_SHORT,
                normalize: true,
                divisor: 1,
                drawType: this.gl.DYNAMIC_DRAW,
            },
            a_phase: {
                numComponents: 1,
                data: this.phaseData,
                type: this.gl.UNSIGNED_SHORT,
                normalize: true,
                divisor: 1,
                drawType: this.gl.DYNAMIC_DRAW,
            },
        });
        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo);
    }

    private _ensureCapacity(required: number): void {
        if (required <= this.capacity) {
            return;
        }

        const previousCapacity = this.capacity;
        let nextCapacity = Math.max(INITIAL_CAPACITY, this.capacity || INITIAL_CAPACITY);
        while (nextCapacity < required) {
            nextCapacity *= 2;
        }

        const nextX = new Uint16Array(nextCapacity);
        const nextSpeed = new Uint16Array(nextCapacity);
        const nextLength = new Uint16Array(nextCapacity);
        const nextPhase = new Uint16Array(nextCapacity);

        if (previousCapacity > 0) {
            nextX.set(this.xData.subarray(0, previousCapacity));
            nextSpeed.set(this.speedData.subarray(0, previousCapacity));
            nextLength.set(this.lengthData.subarray(0, previousCapacity));
            nextPhase.set(this.phaseData.subarray(0, previousCapacity));
        }

        this.xData = nextX;
        this.speedData = nextSpeed;
        this.lengthData = nextLength;
        this.phaseData = nextPhase;
        this.capacity = nextCapacity;

        this._fillRandomRange(previousCapacity, nextCapacity);

        if (previousCapacity === 0) {
            this._initAttributeBuffers();
        } else {
            this._uploadAllAttributes();
        }
    }

    private _drawFrame(now: DOMHighResTimeStamp): void {
        if (!this.paused) {
            this.accumulatedTime += (now - this.lastTimestamp) / 1000;
            this._render(this.accumulatedTime);
        }

        this.lastTimestamp = now;
        this.animationFrameId = requestAnimationFrame(this._drawFrame.bind(this));
    }

    private _render(time: number): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        twgl.setUniforms(this.programInfo, { u_time: time });
        this.gl.drawArraysInstanced(this.gl.LINES, 0, 2, this.dropCount);
    }

    public start(): void {
        if (this.animationFrameId !== null) {
            return;
        }

        const now = performance.now();
        this.lastTimestamp = now;

        // Let's just render once to kick off the animation
        this._render(0);

        // Then start the animation loop
        this._drawFrame(now);
    }

    public stop(): void {
        if (this.animationFrameId === null) {
            return;
        }

        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
    }

    public resize(width: number, height: number, dpr: number): void {
        const canvas = this.gl.canvas as OffscreenCanvas;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        this.resolution = [Math.max(1, canvas.width), Math.max(1, canvas.height)];
        this._syncResolutionUniform();
    }

    public setDrops(count: number): void {
        this.dropCount = count;
        if (count > 0) {
            this._ensureCapacity(count);
        }
        this._syncDropCountUniform();
    }

    public setVisibility(hidden: boolean): void {
        this.paused = hidden;
        if (!hidden) {
            this.lastTimestamp = performance.now();
        }
    }
}
