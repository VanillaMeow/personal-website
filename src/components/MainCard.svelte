<script lang="ts">
    import { onMount } from 'svelte';
    import { GITHUB_OWNER, REPO_BASE, REPO_SLUGS } from '../lib/data';
    import { fetchRepos } from '../lib/github.svelte';
    import { avatarData, introState } from '../lib/sharedState.svelte';
    import CardContent from './CardContent.svelte';

    interface Props {
        avatarSrc: string;
    }

    let { avatarSrc = $bindable('') }: Props = $props();
    avatarData.src = avatarSrc;

    let loaded = $state(false);
    onMount(() => {
        introState.complete = true;
        let cancelled = false;
        let frame: number | undefined;
        const avatar = new Image();
        avatar.src = avatarSrc;

        // Read the repository cache before mounting the animated card
        fetchRepos(REPO_SLUGS, GITHUB_OWNER, REPO_BASE);

        // Finish image decoding and font loading before the intro starts
        // A failed asset must not prevent the card from appearing
        void Promise.allSettled([
            avatar.decode(),
            document.fonts.load('400 14px Inter'),
            document.fonts.load('500 14px Inter'),
            document.fonts.load('600 20px Inter'),
        ]).then(() => {
            if (!cancelled) {
                frame = requestAnimationFrame(() => {
                    loaded = true;
                });
            }
        });

        return () => {
            cancelled = true;
            if (frame !== undefined) {
                cancelAnimationFrame(frame);
            }
        };
    });
</script>

<div style:display={loaded ? 'inline-block' : 'none'} class="w-full">
    <CardContent />
</div>
