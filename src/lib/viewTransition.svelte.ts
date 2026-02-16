import { tick } from 'svelte';

import { TABS } from './data';

export const INTRO_TRANSITION_DURATION = 750;

export const VIEW_TRANSITION_DURATION = 500;
export const VIEW_TRANSITION_EASING = 'cubic-bezier(0.33, 1, 0.68, 1)';

export const REPO_CARD_TRANSITION_DELAY = 400;

export function createViewTransition() {
    let view = $state('');
    let activeTab = $derived(TABS.find((t) => t.key === view) ?? TABS[0]);

    // Set initial view after mount so {#if} insertion triggers in: transitions
    $effect(() => {
        if (!view) {
            view = TABS[0].key;
        }
    });

    // Cached height of the active view
    let maxHeight = $state(600);
    let rawHeights: Record<string, number> = $state({});
    let cachedHeight = $state(0);
    let ready = $state(false);
    let heightLocked = $state(false);

    // Derived values
    let containerHeight = $derived(Math.min(cachedHeight, maxHeight));
    let overflowing = $derived(cachedHeight > maxHeight);

    // Global lock to prevent height change during transition
    let unlockTimer: ReturnType<typeof setTimeout>;

    function switchView(newView: string, cardEl: HTMLElement) {
        if (newView === view || !ready || heightLocked) {
            return;
        }

        clearTimeout(unlockTimer);

        // Capture old rendered width before anything changes
        const oldWidth = cardEl.offsetWidth;

        // Switch view — max-width class snaps to new value, new panel renders
        view = newView;

        // After DOM updates (but before browser paints):
        tick().then(() => {
            const newWidth = cardEl.offsetWidth;
            const h = rawHeights[view];

            // Lock height to value measured at the correct final width
            if (h && h > 0) {
                heightLocked = true;
                cachedHeight = h;
            }

            // Animate width via Web Animations API — purely visual,
            // doesn't re-target the height transition since height is locked
            if (oldWidth !== newWidth) {
                cardEl.animate(
                    { maxWidth: [`${oldWidth}px`, `${newWidth}px`] },
                    {
                        duration: VIEW_TRANSITION_DURATION,
                        easing: VIEW_TRANSITION_EASING,
                    },
                );
            }

            // Unlock after both animations settle
            unlockTimer = setTimeout(() => {
                heightLocked = false;
            }, VIEW_TRANSITION_DURATION + 50);
        });
    }

    // Cache the active view's height, ignoring 0 from unmount
    $effect(() => {
        const h = rawHeights[view];
        if (h && h > 0 && !heightLocked) {
            cachedHeight = h;
            ready = true;
        }
    });

    $effect(() => {
        function getVh() {
            return window.visualViewport?.height ?? window.innerHeight;
        }

        function onResize() {
            maxHeight = Math.round(getVh() * 0.7);
        }

        onResize(); // Initial value

        // Add listeners
        window.addEventListener('resize', onResize);
        window.visualViewport?.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
            window.visualViewport?.removeEventListener('resize', onResize);
        };
    });

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
        get overflowing() {
            return overflowing;
        },
        switchView,
    };
}
