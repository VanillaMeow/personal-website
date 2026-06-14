import { tick } from 'svelte';
import type { Tab } from './data';

export interface ViewTransitionElements {
    card: HTMLElement;
    container: HTMLElement;
}

export interface ViewTransitionOptions<TTab extends Tab = Tab> {
    tabs: readonly TTab[];
    initialView?: string;
}

interface ResolvedViewTransitionConfig {
    transitionDuration: number;
    transitionEasing: string;
    clipDuration: number;
}

export class ViewTransitionController<TTab extends Tab = Tab> {
    readonly tabs: readonly TTab[];
    readonly initialView: string;

    view = $state('');
    ready = $state(false);
    transitioning = $state(false);
    clipping = $state(false);
    initialIntroDone = $state(false);
    rawHeights = $state<Record<string, number>>({});
    containerHeight = $state(0);

    #animations = new Set<Animation>();
    #clipTimer: ReturnType<typeof setTimeout> | undefined;
    #transitionId = 0;

    constructor(options: ViewTransitionOptions<TTab>) {
        this.tabs = options.tabs;
        this.initialView = options.initialView ?? options.tabs[0]?.key ?? '';

        this._validateTabs();

        // Set initial view after mount so {#if} insertion triggers in: transitions
        $effect(() => {
            if (!this.view && this.initialView) {
                this.view = this.initialView;
            }
        });

        // Sync container height to active panel when not animating
        $effect(() => {
            const nextHeight = this.rawHeights[this.view];
            if (nextHeight && nextHeight > 0 && !this.transitioning) {
                this.containerHeight = nextHeight;
                this.ready = true;
            }
        });
    }

    get activeView(): TTab | null {
        return this._getTab(this.view) ?? this.tabs[0] ?? null;
    }

    get overflowY(): 'visible' | 'clip' | 'auto' {
        if (!this.initialIntroDone) {
            return 'visible';
        }

        return this.clipping ? 'clip' : 'auto';
    }

    public switchView(newView: string, elements: ViewTransitionElements): void {
        if (
            newView === this.view ||
            !this.ready ||
            this.transitioning ||
            !this._hasView(newView)
        ) {
            return;
        }

        const transitionConfig = this._resolveTransitionConfig(newView);
        const oldWidth = elements.card.offsetWidth;
        const oldHeight = this.containerHeight;
        const transitionId = ++this.#transitionId;

        this.transitioning = true;
        this._clipFor(transitionConfig.clipDuration);

        this.view = newView;

        void this._animateResizeAfterDomUpdate(
            transitionId,
            newView,
            elements,
            oldWidth,
            oldHeight,
            transitionConfig,
        );
    }

    public handleIntroEnd(viewKey: string): void {
        if (!this.initialIntroDone && viewKey === this.initialView) {
            this.initialIntroDone = true;
        }
    }

    public destroy(): void {
        this.#transitionId += 1;
        this._clearClipTimer();

        for (const animation of this.#animations) {
            animation.cancel();
        }

        this.#animations.clear();
        this.transitioning = false;
        this.clipping = false;
    }

    private _hasView(key: string): boolean {
        return this._getTab(key) !== undefined;
    }

    private async _animateResizeAfterDomUpdate(
        transitionId: number,
        newView: string,
        elements: ViewTransitionElements,
        oldWidth: number,
        oldHeight: number,
        transitionConfig: ResolvedViewTransitionConfig,
    ): Promise<void> {
        const animations: Animation[] = [];

        try {
            await tick();

            if (transitionId !== this.#transitionId) {
                return;
            }

            const newWidth = elements.card.offsetWidth;

            // Query the incoming panel directly because bind:clientHeight
            // may not have fired yet since ResizeObserver is async
            const incomingPanel = this._findPanel(elements.container, newView);
            const newHeight = incomingPanel?.offsetHeight ?? oldHeight;
            this.containerHeight = newHeight;

            // WAAPI width animation is visual only, layout is already at the final width
            if (oldWidth !== newWidth) {
                const widthAnimation = elements.card.animate(
                    { maxWidth: [`${oldWidth}px`, `${newWidth}px`] },
                    {
                        duration: transitionConfig.transitionDuration,
                        easing: transitionConfig.transitionEasing,
                    },
                );
                animations.push(widthAnimation);
                this.#animations.add(widthAnimation);
            }

            // WAAPI height animation drives the explicit container height
            if (oldHeight !== newHeight) {
                const heightAnimation = elements.container.animate(
                    { height: [`${oldHeight}px`, `${newHeight}px`] },
                    {
                        duration: transitionConfig.transitionDuration,
                        easing: transitionConfig.transitionEasing,
                    },
                );
                animations.push(heightAnimation);
                this.#animations.add(heightAnimation);
            }

            await Promise.allSettled(
                animations.map((animation) => animation.finished),
            );
        } finally {
            for (const animation of animations) {
                this.#animations.delete(animation);
            }

            if (transitionId === this.#transitionId) {
                this.transitioning = false;
            }
        }
    }

    private _resolveTransitionConfig(
        viewKey: string,
    ): ResolvedViewTransitionConfig {
        const tab = this._getTab(viewKey);
        if (!tab) {
            throw new Error(
                `Missing per-view transition config for "${viewKey}"`,
            );
        }

        return {
            ...tab.viewTransition,
            clipDuration:
                tab.transition.duration +
                tab.transition.delay +
                (tab.viewTransition.clipExtraDuration ?? 0),
        };
    }

    private _validateTabs(): void {
        const seenKeys = new Set<string>();

        for (const tab of this.tabs) {
            if (!tab.key) {
                throw new Error('Missing tab key');
            }

            if (seenKeys.has(tab.key)) {
                throw new Error(`Duplicate tab key "${tab.key}"`);
            }

            seenKeys.add(tab.key);

            if (!tab.viewTransition) {
                throw new Error(
                    `Missing per-view transition config for "${tab.key}"`,
                );
            }
        }

        if (this.initialView && !this._hasView(this.initialView)) {
            throw new Error(`Missing initial view "${this.initialView}"`);
        }
    }

    private _getTab(viewKey: string): TTab | undefined {
        return this.tabs.find((tab) => tab.key === viewKey);
    }

    private _findPanel(
        container: HTMLElement,
        viewKey: string,
    ): HTMLElement | undefined {
        return Array.from(container.children).find(
            (element): element is HTMLElement =>
                element instanceof HTMLElement &&
                element.dataset.view === viewKey,
        );
    }

    private _clipFor(duration: number): void {
        this.clipping = true;
        this._clearClipTimer();

        this.#clipTimer = setTimeout(() => {
            this.clipping = false;
            this.#clipTimer = undefined;
        }, duration);
    }

    private _clearClipTimer(): void {
        if (this.#clipTimer) {
            clearTimeout(this.#clipTimer);
            this.#clipTimer = undefined;
        }
    }
}
