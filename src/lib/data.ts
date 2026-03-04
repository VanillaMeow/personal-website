// @unocss-include

export interface SocialLink {
    name: string;
    handle: string;
    url: string;
    icon: string;
}

export interface Tab {
    key: string;
    label: string;
    maxWidth: string;
    panelMaxWidth?: string;

    // Svelte transitions
    transition: {
        x?: number;
        y?: number;
        duration: number;
        delay: number;
        easing: 'cubicOut';
    };

    // Custom WAAPI transitions
    viewTransition: {
        transitionDuration: number;
        transitionEasing: string;
        clipDuration: number;
    };
}

//
// Home View
//

export const NAME = 'leah';
export const BIO = 'eepy catgirl';

export const SOCIALS: SocialLink[] = [
    {
        name: 'github',
        handle: '@VanillaMeow',
        url: 'https://github.com/VanillaMeow',
        icon: 'i-simple-icons-github',
    },
    {
        name: 'discord',
        handle: '@yeha.',
        url: 'https://discord.com',
        icon: 'i-simple-icons-discord',
    },
] as const;

//
// Portfolio View
//

export const GITHUB_OWNER = 'VanillaMeow';
export const REPO_BASE = `https://github.com/${GITHUB_OWNER}/`;

export const REPO_SLUGS: string[] = [
    'personal-website',
    'wf-market-checker',
    'PinkCatBoo-Personal-Edit',
    'Stylis-Fed',
    'moist-bot',
    'roblox-solidmodel-converter-opus-vibe',
    'PF-Animation-EQs',
] as const;

//
// Tabs
//

export const INTRO_TRANSITION_DURATION = 750;
export const REPO_CARD_TRANSITION_DELAY = 400;
export const PER_CARD_DELAY = 75;

export const TABS: Tab[] = [
    {
        key: 'home',
        label: 'home',
        maxWidth: 'max-w-md',
        transition: {
            x: -75,
            duration: 400,
            delay: 375,
            easing: 'cubicOut',
        },
        viewTransition: {
            transitionDuration: 500,
            transitionEasing: 'cubic-bezier(0.33, 1, 0.68, 1)',
            // svelte duration + svelte delay
            clipDuration: 400 + 375,
        },
    },
    {
        key: 'portfolio',
        label: 'repos',
        maxWidth: 'max-w-4xl',
        transition: {
            y: 150,
            duration: 400,
            delay: 375,
            easing: 'cubicOut',
        },
        viewTransition: {
            transitionDuration: 500,
            transitionEasing: 'cubic-bezier(0.33, 1, 0.68, 1)',
            clipDuration:
                // card total + svelte duration + svelte delay
                REPO_SLUGS.length * PER_CARD_DELAY + 400 + 375,
        },
    },
] as const;
