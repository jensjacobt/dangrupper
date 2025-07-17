<script lang="ts">
	import { goto } from '$app/navigation'
	import ClassForm from '$lib/ClassForm.svelte'
	import { addClass, setClassBeingAdded } from '$lib/persistence.svelte'
	import ReadMore from '$lib/ReadMore.svelte'
	import { toaster } from '$lib/toaster'
	import { classNameToUrlName, getNextStudentId, sortedByName } from '$lib/utils'
	import type { PageProps } from './$types'

	const { data }: PageProps = $props()

	// svelte-ignore non_reactive_update
	let id = getNextStudentId(data.classBeingAdded.students)
	let className = $state(data.classBeingAdded.name)
	let students = $state(data.classBeingAdded.students)

	$effect(() => {
		console.log('Storing class being added in DB')
		setClassBeingAdded($state.snapshot(className), $state.snapshot(students))
	})

	function resetClassBeingAdded() {
		className = ''
		students = []
		id = 1
	}

	function addClassAndGoToClass(e: Event) {
		e.preventDefault()
		const name = $state.snapshot(className)
		const studs = sortedByName($state.snapshot(students))
		addClass(name, studs)
			.then(() => {
				resetClassBeingAdded()
				goto(`/hold/${classNameToUrlName(name)}/`, { invalidateAll: true })
				return
			})
			.catch((error) => {
				console.error(error)
				toaster.error({
					title: 'Kunne ikke tilføje hold',
					description: error.message,
				})
			})
	}
</script>

<!--================================================================================================================-->

<svelte:head>
	<title>Tilføj hold • Dan grupper</title>
</svelte:head>

<div class="mx-auto max-w-180">
	<h2 class="h2">Tilføj hold</h2>

	<ReadMore>
		Udfyld holdnavn og elevnavne. Bemærk at en liste med elevnavne kan indsættes fra udklipsholderen.
		{#snippet expansion()}
			<ul class="unordered-list">
				<li>Holdnavnet må kun indeholde tegnene a-å, A-Å, 0-9 samt bindestreg (-) og mellemrum ( ).</li>
				<li>Det er smart at bruge korte navne frem for fulde navne, da det vises bedre på siden.</li>
				<li>Listen med elevnavne får automatisk flere inputfelter, mens navnene udfyldes.</li>
				<li>Tomme felter ignoreres og rækkefølgen af elevnavne er ligegyldig.</li>
				<li>Du kan navigere mellem felter med piletasterne, returtasten eller musen.</li>
				<li>
					<mark class="mark">Tip:</mark> Tilføj hurtigt flere elevnavne:
					<ol>
						<li>Kopiér tekst med et navn pr. linje (fra fx Excel eller Word).</li>
						<li>Sæt tekstmarkøren i et inputfelt under 'Elever'.</li>
						<li>
							Indsæt det kopierede med <kbd class="kbd">command</kbd>+<kdb class="kbd">v</kdb> (på mac) eller
							<kbd class="kbd">ctrl</kbd>+<kdb class="kbd">v</kdb> (på pc).
						</li>
					</ol>
				</li>
				<li>Klik på 'Gem hold' opretter holdet.</li>
				<li>Indtastningerne her på siden gemmes løbende i browseren, indtil der klikkes på 'Gem hold'.</li>
				<li>
					Knappen 'Nulstil formular' kan bruges, hvis du fortryder midt i indtastning af et hold, og vil slette alt der
					er indtastet.
				</li>
			</ul>
		{/snippet}
	</ReadMore>

	<ClassForm onsubmit={addClassAndGoToClass} bind:className bind:students bind:id>
		<button type="reset" class="ml-2 btn preset-outlined-primary-500" onclick={resetClassBeingAdded}>
			Nulstil formular
		</button>
	</ClassForm>
</div>

<div style="height: 30vh"></div>
