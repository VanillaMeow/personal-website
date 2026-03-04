import { defineConfig, presetIcons, presetWind4 } from 'unocss';

export default defineConfig({
    safelist: [],
    content: {
        filesystem: ['src/**/*.svelte'],
    },

    theme: {
        fontFamily: {
            sans: "'Inter', sans-serif",
        },
    },
    presets: [
        presetWind4({
            preflights: {
                theme: true,
            },
        }),
        presetIcons({
            scale: 1.2,
            extraProperties: {
                display: 'inline-block',
                'vertical-align': 'middle',
            },
        }),
    ],
    shortcuts: {
        'glass-card':
            'bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl',
        'glass-link':
            'px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50',
    },
});
