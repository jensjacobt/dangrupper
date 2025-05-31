<script lang="ts">
	import type { LayoutProps } from './$types';
	import { page } from '$app/state';
	import { Navigation, Toaster } from '@skeletonlabs/skeleton-svelte';
  	import { toaster } from '$lib/toaster-svelte'; 
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
	import { exportDatabaseToJson } from '$lib/persistence.svelte';

	let { children, data }: LayoutProps = $props();

	function pushSwitch() {
		document.documentElement.classList.toggle('dark');
	}

	function backupWholeDatabase() {
		exportDatabaseToJson()
			.then((json) => {
				console.log(json);
				let a = document.createElement("a");
				a.href = window.URL.createObjectURL(new Blob([json], {type: "text/plain"}));
				a.download = `dangrupper-export-${(new Date().toLocaleString())}.json`;
				a.click();
				a.remove();
			}, 
			(e) => { 
				console.error('export to json failed:', e);
				toaster.error({
					title: "Eksport fejlede",
					description: e.message
				});
			});
	}
</script>

<Toaster {toaster}></Toaster>

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
			<button class="btn hover:preset-tonal" title="Download backup" onclick={backupWholeDatabase}><Download size={28} /></button>
			<button class="btn hover:preset-tonal" title="Upload tidligere backup">
				<Upload size={28} />
			</button>
		</div>
	</header>
	<!-- Grid Columns -->
	<div class="grid grid-cols-1 grid-cols-[auto_1fr]">
		<!-- Left Sidebar -->
		<Navigation.Rail classes="h-full w-full preset-filled-surface-100-900">
			{#snippet header()}
				<Navigation.Tile selected={page.url.pathname == '/'} href="/" label="Vejledning">
					<CircleHelp size={32} />
				</Navigation.Tile>
				{#each data.classes.map((c) => c.name).toSorted() as className}
					{@const url = `/hold/${classNameUrlName(className)}/`}
					<Navigation.Tile selected={page.url.pathname.startsWith(url)} label={className} href={url}>
						<UsersRound size={32} />
					</Navigation.Tile>
				{/each}
				<Navigation.Tile selected={page.url.pathname == '/tilføj/'} href="/tilføj/" label="Tilføj hold">
					<CirclePlus size={32} />
				</Navigation.Tile>
			{/snippet}
		</Navigation.Rail>
		<!-- Main Content -->
		<main class="container space-y-4 p-4 ps-8 pt-6">
			{@render children()}
		</main>
	</div>
</div>
