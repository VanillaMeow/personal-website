<script lang="ts">
    import { cubicOut } from 'svelte/easing';
    import { fly } from 'svelte/transition';
    import { BIO, SOCIALS } from '../lib/data';
</script>

<div>
    <!-- Profile -->
    <div class="flex items-start gap-5 mb-8">
        <img
            src="/avatar.png"
            alt="leah"
            class="w-20 h-20 rounded-full shrink-0 ring-2 ring-white/10 object-cover"
        />
        <div>
            <h1 class="text-xl font-semibold">leah</h1>
            <p class="text-white/50 text-sm flex items-center gap-1.5">
                she/her
                <span class="text-base">🏳️‍⚧️</span>
            </p>
            <p class="text-white/60 text-sm mt-2">{BIO}</p>
        </div>
    </div>

    <hr class="border-white/10 mb-6" />

    <!-- Socials -->
    <h2 class="text-sm font-medium text-white/80 mb-3">socials</h2>
    <div class="grid grid-cols-2 gap-3">
        {#each SOCIALS as s, i}
            <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                class="glass-link"
                in:fly={{
                    y: 15,
                    duration: 400,
                    delay: 150 + i * 75,
                    easing: cubicOut,
                }}
            >
                <span class="{s.icon} text-lg text-white/60"></span>
                <div>
                    <span class="text-sm font-medium text-white/90"
                        >{s.name}</span
                    >
                    <p class="text-xs text-white/40">{s.handle}</p>
                </div>
            </a>
        {/each}
    </div>
</div>
