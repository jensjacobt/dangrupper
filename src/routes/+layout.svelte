<script lang="ts">
	import { Nav } from '@skeletonlabs/skeleton-svelte';
	import {
		CircleHelp,
		CirclePlus,
		Download,
		School,
		SunMoon,
		Upload,
		UsersRound
	} from 'lucide-svelte';
	import { page } from '$app/stores';
	import '../app.css';

	let { children } = $props();

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
			<button class="btn hover:preset-tonal" title="Upload tidligere backup"
				><Upload size={28} /></button
			>
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
					<Nav.Tile
						selected={$page.url.pathname.startsWith('/hold/1x_Fy/')}
						label="1x Fy"
						href={'/hold/1x_Fy/'}
					>
						<UsersRound size={32} />
					</Nav.Tile>
					<Nav.Tile
						selected={$page.url.pathname.startsWith('/hold/1z_Ma/')}
						label="1z Ma"
						href={'/hold/1z_Ma/'}
					>
						<UsersRound size={32} />
					</Nav.Tile>
					<Nav.Tile
						selected={$page.url.pathname == '/add/'}
						labelExpanded="Tilføj hold"
						href="/add/"
						label="Tilføj hold"
					>
						<CirclePlus size={32} />
					</Nav.Tile>
				{/snippet}
				<!--
					{#snippet tiles()}
					{/snippet}
					{#snippet footer()}
					{/snippet}
				-->
			</Nav.Rail>
		</aside>
		<div class="grid grid-rows-[1fr_auto]">
			<!-- Main Content -->
			<main class="container space-y-4 p-4 ps-8 pt-6">
				{@render children()}
				<p class="h-[512px] p-4">Paragraph 1</p>
				<p class="h-[512px] p-4">Paragraph 2</p>
				<p class="h-[512px] p-4">Paragraph 3</p>
			</main>
			<!-- Footer -->
			<footer class="bg-blue-500 p-4">(footer)</footer>
		</div>
	</div>
</div>
