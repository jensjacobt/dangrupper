<script lang="ts">
	import { invalidateAll } from '$app/navigation'
	import { downloadJson, exportDatabaseToJson, getConflictingClasses, importClasses } from '$lib/persistence.svelte'
	import { toaster } from '$lib/toaster'
	import { Modal } from '@skeletonlabs/skeleton-svelte'
	import { Download, Upload } from 'lucide-svelte'

	let fileInput: HTMLInputElement

	let importObjectWithConflicts: ImportObject | undefined = $state()
	let idsToImport: string[] = $state([])

	let openState = $state(false)
	function openModal() {
		idsToImport = []
		openState = true
	}
	function closeModal() {
		openState = false
	}

	function exportWholeDatabase() {
		const filename = `dangrupper-export-${new Date().toLocaleString()}.json`
		const json = exportDatabaseToJson()
		downloadJson(filename, json)
	}

	function onImportButtonClick(): void {
		if (fileInput) fileInput.click()
	}

	async function showImportDialog() {
		if (fileInput.files?.length === 1) {
			try {
				const file = fileInput.files[0]
				const text = await file.text()
				const importObject = JSON.parse(text)
				importObjectWithConflicts = await getConflictingClasses(importObject)
				openModal()
				fileInput.value = ''
			} catch (err) {
				console.error('failure in showImportDialog', err)
				toaster.error({
					title: 'Import af fil fejlede',
					description: `Den valgte fil kunne ikke importeres. 
						(Det er kun filer, der er eksporteret fra denne app, der kan importeres.)`,
				})
			}
		}
	}

	function importSelectedClasses() {
		closeModal()
		if (!importObjectWithConflicts || idsToImport.length == 0) return

		const io = $state.snapshot(importObjectWithConflicts) as ImportObject
		const ids = $state.snapshot(idsToImport)

		importClasses(io, ids)
			.then(() => {
				invalidateAll()
			})
			.catch((err) => {
				console.error('Import to DB failed', err)
				toaster.error({
					title: 'Import til databasen fejlede',
					description: 'Denne fejl er ikke forventet. Kontakt udvikleren.',
				})
			})
	}
</script>

<!--================================================================================================================-->

<button class="btn hover:preset-tonal" title="Download fuld backup" onclick={exportWholeDatabase}>
	<Download size={28} />
</button>

<button class="btn gap-0 hover:preset-tonal" title="Importér fra tidligere backup" onclick={onImportButtonClick}>
	<Upload size={28} />

	<!-- NOTE: Don't use `hidden` as it prevents `required` from operating -->
	<div class="h-0 w-0 overflow-hidden">
		<input name="fileinput" type="file" bind:this={fileInput} onchange={showImportDialog} />
	</div>

	<Modal
		open={openState}
		onOpenChange={(e) => (openState = e.open)}
		triggerBase="h-0 w-0 overflow-hidden"
		contentBase="max-w-screen-sm space-y-4 card bg-surface-100-900 p-4 shadow-xl"
		backdropClasses="backdrop-blur-sm"
	>
		{#snippet content()}
			<header class="flex justify-between">
				<h2 class="h4">Import af hold</h2>
			</header>
			<article>
				<span class="space-y-2 opacity-60">
					{#if Array.isArray(importObjectWithConflicts?.classes)}
						<p>Vælg de hold, som du vil importere:</p>
						<form class="space-y-2">
							{#each importObjectWithConflicts.classes as c}
								<label class="flex items-center space-x-2">
									<input
										class="checkbox"
										type="checkbox"
										value={c.id}
										bind:group={idsToImport}
										disabled={c.conflictingClass != null}
									/>
									<p>
										{#if !c.conflictingClass}
											{c.name}
										{:else}
											<del>{c.name}</del>&nbsp;(kolliderer med {c.conflictingClass.name})
										{/if}
									</p>
								</label>
							{/each}
						</form>
						{#if importObjectWithConflicts?.classes?.some((c) => c.conflictingClass)}
							<p>
								Kollision betyder, at et hold er det samme, som et af de hold, der kan importeres (de har samme ID).
								Hvis du ønsker at importere et hold, der allerede er oprettet, så slet først den gamle kopi af holdet.
								Tip: Tag først en backup, hvis du sletter et hold 😊
							</p>
						{/if}
					{/if}
				</span>
			</article>
			<footer class="flex justify-end gap-4">
				<button type="button" class="btn preset-tonal" onclick={closeModal}>Annullér</button>
				<button type="button" class="btn preset-filled" onclick={importSelectedClasses}>Importér hold</button>
			</footer>
		{/snippet}
	</Modal>
</button>
