<script lang="ts">
    import { onMount } from 'svelte';
    import CardContent from './CardContent.svelte';

    let loaded = $state(false);
    onMount(() => {
        loaded = true;
    });
</script>

{#if loaded}
    <CardContent />
{/if}
