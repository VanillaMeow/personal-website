<script lang="ts">
    import { flip } from 'svelte/animate';
    import { cubicOut } from 'svelte/easing';
    import { fly } from 'svelte/transition';
    import { BIO, NAME, SOCIALS } from '../../lib/data';
</script>

<div>
    <!-- Profile -->
    <div class="flex items-start gap-5 mb-8">
        <img
            src="/avatar.png"
            alt={NAME}
            draggable="false"
            class="w-14 h-14 sm:w-20 sm:h-20 rounded-full shrink-0 ring-3 ring-white/10 object-cover select-none"
        />
        <div>
            <h1 class="text-xl font-semibold">{NAME}</h1>
            <p class="text-white/50 text-sm flex items-center gap-1.5">
                she/her
                <span class="text-base">🏳️‍⚧️</span>
            </p>
            <div class="max-h-10em overflow-y-auto">
                <p class="text-white/60 text-sm mt-2">{BIO}</p>
            </div>
        </div>
    </div>

    <hr class="border-white/10 mb-6" />

    <!-- Socials -->
    <h2 class="text-sm font-medium text-white/80 mb-3 select-none">socials</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {#each SOCIALS as s, i (i)}
            <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                class="glass-link"
                in:fly|global={{
                    y: 15,
                    duration: 400,
                    delay: 400 + i * 100,
                    easing: cubicOut,
                }}
                animate:flip={{ duration: 200, easing: cubicOut }}
            >
                <span class="{s.icon} text-lg text-white/60"></span>
                <div>
                    <span class="text-sm font-medium text-white/90">
                        {s.name}
                    </span>
                    <p class="text-xs text-white/40">{s.handle}</p>
                </div>
            </a>
        {/each}
    </div>
</div>
