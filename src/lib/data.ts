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
    transition: { x?: number; y?: number };
}

export const NAME = 'leah';
export const BIO = 'eepy catgirl';

export const TABS: Tab[] = [
    {
        key: 'home',
        label: 'home',
        maxWidth: 'max-w-md',
        transition: { x: -75 },
    },
    {
        key: 'portfolio',
        label: 'repos',
        maxWidth: 'max-w-4xl',
        transition: { y: 150 },
    },
] as const;

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
];
