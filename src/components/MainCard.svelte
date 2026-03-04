<script lang="ts">
    import { onMount } from 'svelte';
    import { avatarData } from '../lib/sharedState.svelte';
    import CardContent from './CardContent.svelte';

    interface Props {
        avatarSrc: string;
    }

    let { avatarSrc = $bindable('') }: Props = $props();
    avatarData.src = avatarSrc;

    // Wait for DOM to mount
    let loaded = $state(false);
    onMount(() => {
        loaded = true;
    });
</script>

{#if loaded}
    <CardContent />
{/if}
