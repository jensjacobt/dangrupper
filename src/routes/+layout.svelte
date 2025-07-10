<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { downloadJson, exportDatabaseToJson, getConflictingClasses, importClasses } from '$lib/persistence.svelte';
	import { toaster } from '$lib/toaster-svelte';
	import { classNameToUrlName } from '$lib/utils';
	import { Modal, Navigation, Toaster } from '@skeletonlabs/skeleton-svelte';
	import {
		CircleHelp,
		CirclePlus,
		Download,
		Menu,
		School,
		SunMoon,
		Upload,
		UsersRound
	} from 'lucide-svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	let openState = $state(false);
	let expanded = $state(true);
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

	function toggleExpanded() {
		expanded = !expanded;
	}

	function pushSwitch() {
		document.documentElement.classList.toggle('dark');
	}

	if (data.classes.length > 0 && navigator.storage && navigator.storage.persist) {
		navigator.storage.persist().then(persistent => {
			if (persistent) {
				console.log("Storage will not be cleared except by explicit user action.");
			} else {
				console.log("Storage may be cleared by the browser under storage pressure.");
			}
		});
	}

	function exportWholeDatabase() {
		const filename = `dangrupper-export-${(new Date().toLocaleString())}.json`;
		const json = exportDatabaseToJson();
		downloadJson(filename, json);
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

		const io = $state.snapshot(importObjectWithConflicts) as ImportObject;
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

	function getMenuName(className: string, maxLength: number) {
		if (className.length <= maxLength) return className;
		return `${className.substring(0, maxLength-2)}...`
	}

	const common = {active: "preset-filled", hover: "hover:bg-white"}
</script>

<div class="grid h-screen grid-rows-[auto_1fr]">
	<!-- Header -->
	<header
		class="grid w-full grid-cols-[auto_1fr_auto] grid-rows-1 items-center p-4 py-3 preset-tonal-surface border-b-[1px] border-surface-500/20 xl:px-10"
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
			<button class="btn hover:preset-tonal" title="Download fuld backup" onclick={exportWholeDatabase}><Download size={28} /></button>
			<button class="btn hover:preset-tonal" title="Importér fra tidligere backup" onclick={onImportButtonClick}><Upload size={28} /></button>
		</div>
	</header>
	<!-- Grid Columns -->
	<div class="grid grid-cols-[auto_1fr]">
		<!-- Left Sidebar -->
		<Navigation.Rail {expanded} background="preset-tonal-surface">
			{#snippet header()}
				<Navigation.Tile labelExpanded="Menu" onclick={toggleExpanded} title="Slå bred menu til/fra" {...common}>
					<Menu size={32} />
				</Navigation.Tile>
				<Navigation.Tile selected={page.route.id == '/'} href="/" label="Vejledning" labelExpanded="Vejledning" {...common}>
					<CircleHelp size={32} />
				</Navigation.Tile>
				{#each data.classes.map((c) => c.name).toSorted() as className}
					{@const url = `/hold/${classNameToUrlName(className)}/`}
					<Navigation.Tile selected={page.url.pathname.startsWith(url)} href={url} label={getMenuName(className, 7)} labelExpanded={getMenuName(className, 16)} {...common}>
						<UsersRound size={32} />
					</Navigation.Tile>
				{/each}
				<Navigation.Tile selected={page.route.id === '/tilføj'} href="/tilføj/" label="Tilføj hold" labelExpanded="Tilføj hold" {...common}>
					<CirclePlus size={32} />
				</Navigation.Tile>
			{/snippet}
		</Navigation.Rail>
		<!-- Main Content -->
		<main class="space-y-4 p-6">
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