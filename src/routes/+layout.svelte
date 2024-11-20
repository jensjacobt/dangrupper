<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import { page } from '$app/stores';
	import { Nav, ToastProvider } from '@skeletonlabs/skeleton-svelte';
	import {
		CircleHelp,
		CirclePlus,
		Download,
		School,
		SunMoon,
		Upload,
		UsersRound
	} from 'lucide-svelte';
	import '../app.css';
	import { classNameUrlName } from '$lib/utils';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	function pushSwitch() {
		document.documentElement.classList.toggle('dark');
	}
</script>

<div class="grid h-screen grid-rows-[auto_1fr]">
	<!-- Header -->
	<header
		class="grid w-full grid-cols-[auto_1fr_auto] grid-rows-1 items-center border-b-[1px] border-surface-500/20 p-4 p-4 py-3 bg-surface-50-950 xl:px-10"
	>
		<School size={28} />
		<a href="/" class="font-heading-token ps-2 text-3xl"> Dan grupper </a>
		<div class="flex flex-row gap-4">
			<button
				id="lightswitch"
				onclick={pushSwitch}
				class="btn hover:preset-tonal"
				title="Skift mellem lyst og mørkt udseende"><SunMoon size={28} /></button
			>
			<button class="btn hover:preset-tonal" title="Download backup"><Download size={28} /></button>
			<button class="btn hover:preset-tonal" title="Upload tidligere backup">
				<Upload size={28} />
			</button>
		</div>
	</header>
	<!-- Grid Columns -->
	<div class="grid grid-cols-1 grid-cols-[auto_1fr]">
		<!-- Left Sidebar -->
		<aside class="card grid h-full w-full grid-cols-[auto_1fr] border-[1px] border-surface-100-900">
			<Nav.Rail>
				{#snippet header()}
					<Nav.Tile selected={$page.url.pathname == '/'} href="/" label="Vejledning">
						<CircleHelp size={32} />
					</Nav.Tile>
					{#each data.classes.map((c) => c.name).toSorted() as className}
						{@const url = `/hold/${classNameUrlName(className)}/`}
						<Nav.Tile selected={$page.url.pathname.startsWith(url)} label={className} href={url}>
							<UsersRound size={32} />
						</Nav.Tile>
					{/each}
					<Nav.Tile selected={$page.url.pathname == '/add/'} href="/add/" label="Tilføj hold">
						<CirclePlus size={32} />
					</Nav.Tile>
				{/snippet}
			</Nav.Rail>
		</aside>
		<!-- Main Content -->
		<main class="container space-y-4 p-4 ps-8 pt-6">
			<ToastProvider>
				<!-- fix to re-render component on page change: https://github.com/sveltejs/kit/issues/4941 -->
				<!-- {#key $page.url.pathname} -->
				{@render children()}
				<!-- {/key} -->
			</ToastProvider>
		</main>
	</div>
</div>
