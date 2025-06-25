<script lang="ts">
	import type { LayoutProps } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { Navigation, Toaster, Modal } from '@skeletonlabs/skeleton-svelte';
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
	import { toaster } from '$lib/toaster-svelte'; 
	import { classNameUrlName } from '$lib/utils';
	import { exportDatabaseToJson, getConflictingClasses, importClasses } from '$lib/persistence.svelte';

	let { children, data }: LayoutProps = $props();

	let openState = $state(false);
	let importObjectWithConflicts: ImportObject | undefined = $state();
	let idsToImport: string[] = $state([]);

	let fileInput: HTMLInputElement;

	function openModal() {
		idsToImport = [];
		openState = true;
	}

	function closeModal() {
		openState = false;
	}

	function pushSwitch() {
		document.documentElement.classList.toggle('dark');
	}

	// TODO: Overvej at tilføje mulighed for kun at tage backup af nogle hold – evt. blot at eksportere et enkelt hold
	function backupWholeDatabase() {
		exportDatabaseToJson()
			.then((json) => {
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

	function onImportButtonClick(): void {
		if (fileInput) fileInput.click();
	}

	async function showImportDialog() {
		if (fileInput.files?.length === 1) {
			try {
				const file = fileInput.files[0];
				const text = await file.text();
				const importObject = JSON.parse(text);
				importObjectWithConflicts = await getConflictingClasses(importObject);
				openModal();
				fileInput.value = '';
			} catch(err) {
				console.error('failure in showImportDialog', err);
				toaster.error({
					title: "Import af fil fejlede",
					description: "Den valgte fil kunne ikke importeres. (Det er kun filer, der er eksporteret fra denne app, der kan importeres.)",
				});
			}
		}
	}

	function importSelectedClasses() {
		if (!importObjectWithConflicts || idsToImport.length == 0) return;

		const io = $state.snapshot(importObjectWithConflicts) as ImportObject; // TODO: Fix this
		const ids = $state.snapshot(idsToImport);
		
		importClasses(io, ids)
			.then(() => {
				invalidateAll();
			}).catch((err) => {
				console.error("Import to DB failed", err);
				toaster.error({
					title: "Import til databasen fejlede",
					description: "Denne fejl er ikke forventet. Kontakt udvikleren.",
				});
			});
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
			<button class="btn hover:preset-tonal" title="Download backup" onclick={backupWholeDatabase}><Download size={28} /></button>
			<button class="btn hover:preset-tonal" title="Upload tidligere backup" onclick={onImportButtonClick}>
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

<Toaster {toaster}></Toaster>

<Modal
	open={openState}
	onOpenChange={(e) => (openState = e.open)}
	triggerBase="btn preset-filled-primary-500"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
	backdropClasses="backdrop-blur-sm"
>
	{#snippet content()}
		<header class="flex justify-between">
			<h2 class="h4">Import af hold</h2>
		</header>
		<article>
			<span class="opacity-60 space-y-2">
				{#if Array.isArray(importObjectWithConflicts?.classes)}
					<p>Vælg de hold, som du vil importere:</p>
					<form class="space-y-2">
						{#each importObjectWithConflicts.classes as c}	
							<label class="flex items-center space-x-2">
								<input class="checkbox" type="checkbox" value={c.id} bind:group={idsToImport} disabled={c.conflictingClass != null} />
								<p>{c.name}{#if c.conflictingClass} &nbsp;(kolliderer med {c.conflictingClass.name}) {/if}</p>
							</label>
						{/each}
					</form>
					{#if importObjectWithConflicts?.classes?.some(c => c.conflictingClass)}
						<p>
							Kollision betyder, at et hold er præcist de samme, som et af de hold, der kan importeres (de har samme ID). 
							Hvis du ønsker at importere et hold, der allerede er oprettet, så slet først den gamle kopi af holdet.
							Tip: Tag først en backup, hvis du sletter et hold.
						</p>
					{/if}
				{/if}
			</span>
		</article>
		<footer class="flex justify-end gap-4">
			<button type="button" class="btn preset-tonal" onclick={closeModal}>Annullér</button>
			<button type="button" class="btn preset-filled" onclick={() => {closeModal(); importSelectedClasses()}}>Importér hold</button>
		</footer>
	{/snippet}
</Modal>

<!-- NOTE: Don't use `hidden` as it prevents `required` from operating -->
<div class="w-0 h-0 overflow-hidden">
	<input name="fileinput" type="file" bind:this={fileInput} onchange={showImportDialog} />
</div>