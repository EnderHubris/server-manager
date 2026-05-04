<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
    <link rel="stylesheet" href="/css/dashboard.css">
</svelte:head>

{@render children()}
