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

export interface Repo {
    name: string;
    description: string;
    url: string;
    language?: string;
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

export const REPOS: Repo[] = [
    {
        name: 'personal-website',
        description: 'my personal website',
        url: 'https://github.com/leah/personal-website',
        language: 'TypeScript',
    },
    {
        name: 'dotfiles',
        description: 'system configuration files',
        url: 'https://github.com/leah/dotfiles',
        language: 'Shell',
    },
    {
        name: 'project-three',
        description: 'placeholder project',
        url: 'https://github.com/leah/project-three',
        language: 'Rust',
    },
    {
        name: 'project-three',
        description: 'placeholder project',
        url: 'https://github.com/leah/project-three',
        language: 'Rust',
    },
    {
        name: 'project-three',
        description: 'placeholder project',
        url: 'https://github.com/leah/project-three',
        language: 'Rust',
    },
    {
        name: 'project-three',
        description: 'placeholder project',
        url: 'https://github.com/leah/project-three',
        language: 'Rust',
    },
    {
        name: 'project-three',
        description: 'placeholder project',
        url: 'https://github.com/leah/project-three',
        language: 'Rust',
    },
    {
        name: 'project-three',
        description: 'placeholder project',
        url: 'https://github.com/leah/project-three',
        language: 'Rust',
    },
    {
        name: 'project-three',
        description: 'placeholder project',
        url: 'https://github.com/leah/project-three',
        language: 'Rust',
    },
    {
        name: 'project-three',
        description: 'placeholder project',
        url: 'https://github.com/leah/project-three',
        language: 'Rust',
    },
    {
        name: 'project-three',
        description: 'placeholder project',
        url: 'https://github.com/leah/project-three',
        language: 'Rust',
    },
    {
        name: 'project-three',
        description: 'placeholder project',
        url: 'https://github.com/leah/project-three',
        language: 'Rust',
    },
] as const;
