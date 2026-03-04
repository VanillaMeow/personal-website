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

export class ViewTransitionController<TTab extends Tab = Tab> {
    readonly tabs: readonly TTab[];
    readonly initialView: string;

    view = $state('');
    ready = $state(false);
    transitioning = $state(false);
    clipping = $state(false);
    rawHeights = $state<Record<string, number>>({});
    containerHeight = $state(0);

    #clipTimer: ReturnType<typeof setTimeout> | undefined;

    constructor(options: ViewTransitionOptions<TTab>) {
        this.tabs = options.tabs;
        this.initialView = options.initialView ?? options.tabs[0]?.key ?? '';

        // Validate
        this._validatePerViewTransitions();

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

        this.transitioning = true;
        this.clipping = true;
        clearTimeout(this.#clipTimer);
        this.#clipTimer = setTimeout(() => {
            this.clipping = false;
        }, transitionConfig.clipDuration);

        this.view = newView;

        tick().then(() => {
            const newWidth = elements.card.offsetWidth;

            // Query the incoming panel directly because bind:clientHeight
            // may not have fired yet since ResizeObserver is async
            const incomingPanel = elements.container.querySelector<HTMLElement>(
                `[data-view="${newView}"]`,
            );
            const newHeight = incomingPanel?.offsetHeight ?? oldHeight;
            this.containerHeight = newHeight;

            // WAAPI width animation is visual only, layout is already at the final width
            if (oldWidth !== newWidth) {
                elements.card.animate(
                    { maxWidth: [`${oldWidth}px`, `${newWidth}px`] },
                    {
                        duration: transitionConfig.transitionDuration,
                        easing: transitionConfig.transitionEasing,
                    },
                );
            }

            // WAAPI height animation drives the explicit container height
            if (oldHeight !== newHeight) {
                elements.container.animate(
                    { height: [`${oldHeight}px`, `${newHeight}px`] },
                    {
                        duration: transitionConfig.transitionDuration,
                        easing: transitionConfig.transitionEasing,
                    },
                ).onfinish = () => {
                    this.transitioning = false;
                };
            } else {
                this.transitioning = false;
            }
        });
    }

    public destroy(): void {
        clearTimeout(this.#clipTimer);
    }

    private _hasView(key: string): boolean {
        return this._getTab(key) !== undefined;
    }

    private _resolveTransitionConfig(viewKey: string): TTab['viewTransition'] {
        const tab = this._getTab(viewKey);
        if (!tab) {
            throw new Error(
                `Missing per-view transition config for "${viewKey}"`,
            );
        }
        return tab.viewTransition;
    }

    private _validatePerViewTransitions(): void {
        for (const tab of this.tabs) {
            if (!tab.viewTransition) {
                throw new Error(
                    `Missing per-view transition config for "${tab.key}"`,
                );
            }
        }
    }

    private _getTab(viewKey: string): TTab | undefined {
        return this.tabs.find((tab) => tab.key === viewKey);
    }
}
