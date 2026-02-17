import { tick } from 'svelte';

import { TABS } from './data';

export const INTRO_TRANSITION_DURATION = 750;

export const REPO_CARD_TRANSITION_DELAY = 400;

const TRANSITION_DURATION = 500;
const TRANSITION_EASING = 'cubic-bezier(0.33, 1, 0.68, 1)';

// How long to keep overflow clipped after a view switch — long enough
// for the slowest child animation (staggered repo cards) to finish
const CLIP_DURATION = 1500;

export function createViewTransition() {
    let view = $state('');
    let activeTab = $derived(TABS.find((t) => t.key === view) ?? TABS[0]);
    let ready = $state(false);
    let transitioning = $state(false);
    let clipping = $state(false);
    let clipTimer: ReturnType<typeof setTimeout> | undefined;

    // Panel heights tracked via bind:clientHeight
    let rawHeights: Record<string, number> = $state({});

    // The explicit pixel height applied to the container
    let containerHeight = $state(0);

    // Set initial view after mount so {#if} insertion triggers in: transitions
    $effect(() => {
        if (!view) {
            view = TABS[0].key;
        }
    });

    // Sync container height to active panel when not animating
    $effect(() => {
        const h = rawHeights[view];
        if (h && h > 0 && !transitioning) {
            containerHeight = h;
            ready = true;
        }
    });

    function switchView(newView: string, cardEl: HTMLElement, containerEl: HTMLElement) {
        if (newView === view || !ready || transitioning) {
            return;
        }

        const oldWidth = cardEl.offsetWidth;
        const oldHeight = containerHeight;

        transitioning = true;
        clipping = true;
        clearTimeout(clipTimer);
        clipTimer = setTimeout(() => {
            clipping = false;
        }, CLIP_DURATION);

        view = newView;

        tick().then(() => {
            const newWidth = cardEl.offsetWidth;

            // Query the incoming panel directly — bind:clientHeight may
            // not have fired yet since ResizeObserver is async
            const newPanel = containerEl.querySelector<HTMLElement>(`[data-view="${newView}"]`);
            const newHeight = newPanel?.offsetHeight ?? oldHeight;
            containerHeight = newHeight;

            // WAAPI width — visual only, layout already at final width
            if (oldWidth !== newWidth) {
                cardEl.animate(
                    { maxWidth: [`${oldWidth}px`, `${newWidth}px`] },
                    { duration: TRANSITION_DURATION, easing: TRANSITION_EASING },
                );
            }

            // WAAPI height — animates the explicit container height
            if (oldHeight !== newHeight) {
                containerEl.animate(
                    { height: [`${oldHeight}px`, `${newHeight}px`] },
                    { duration: TRANSITION_DURATION, easing: TRANSITION_EASING },
                ).onfinish = () => {
                    transitioning = false;
                };
            } else {
                transitioning = false;
            }
        });
    }

    return {
        get view() {
            return view;
        },
        get activeTab() {
            return activeTab;
        },
        get rawHeights() {
            return rawHeights;
        },
        get ready() {
            return ready;
        },
        get containerHeight() {
            return containerHeight;
        },
        get transitioning() {
            return transitioning;
        },
        get clipping() {
            return clipping;
        },
        switchView,
    };
}
