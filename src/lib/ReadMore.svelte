<script lang="ts">
	import { page } from '$app/state'
	import type { Snippet } from 'svelte'

	let expanded = $state(false)
	$effect.pre(() => {
		page.url.pathname
		expanded = false
	})

	const {
		children,
		expansion,
	}: {
		children: Snippet
		expansion: Snippet
	} = $props()
</script>

{#if !expanded}
	<p class="max-w-180">
		{@render children()}
		<button class="anchor" onclick={() => (expanded = true)}>Udfold vejledning</button>
	</p>
{:else}
	<p class="max-w-180">{@render children()}</p>
	<p class="max-w-180">
		{@render expansion()} <button class="anchor" onclick={() => (expanded = false)}>Sammenfold vejledning</button>
	</p>
{/if}
