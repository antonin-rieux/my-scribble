<script lang="ts">
	import { onMount } from "svelte";
	import Canvas from "./components/Canvas.svelte";
	import { ws, connected } from "./lib/websocket";

	let canDraw: boolean = true;

	onMount(() => {
		ws.connect();
	});
</script>

<main>
	<h1>My Scribble</h1>

	<div class="status">
		{#if $connected}
			<span class="connected">● Connected</span>
		{:else}
			<span class="disconnected">● Disconnected</span>
		{/if}
	</div>

	<Canvas {canDraw} />
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
			Roboto, sans-serif;
	}

	h1 {
		margin-bottom: 1rem;
	}

	.status {
		margin-bottom: 1rem;
	}

	.connected {
		color: #4caf50;
		font-weight: bold;
	}

	.disconnected {
		color: #f44336;
		font-weight: bold;
	}
</style>
