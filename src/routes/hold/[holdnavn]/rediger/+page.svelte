<script lang="ts">
	import { goto } from '$app/navigation'
	import ClassForm from '$lib/ClassForm.svelte'
	import { editClass } from '$lib/persistence.svelte'
	import ReadMore from '$lib/ReadMore.svelte'
	import { toaster } from '$lib/toaster'
	import { classNameToUrlName, getNextStudentId, sortedByName } from '$lib/utils'
	import type { PageProps } from '../$types'

	let { data }: PageProps = $props()

	let id = getNextStudentId(data.currentClass.students)
	let className = $state(data.currentClass.name)
	let students: Student[] = $state(data.currentClass.students)

	function editClassAndGoToClass(e: Event) {
		e.preventDefault()
		const name = $state.snapshot(className)
		const studs = sortedByName($state.snapshot(students))
		const id = data.currentClass.id
		editClass(id, name, studs)
			.then(() => {
				goto(`/hold/${classNameToUrlName(name)}/`, { invalidateAll: true })
				return
			})
			.catch((error) => {
				console.error(error)
				toaster.error({
					title: 'Kunne ikke redigere hold',
					description: error.message,
				})
			})
	}
</script>

<!--================================================================================================================-->

<svelte:head>
	<title>Redigér hold • {data.currentClass.name} • Dan grupper</title>
</svelte:head>

<div class="mx-auto max-w-180 space-y-4">
	<h3 class="h3">Redigér hold</h3>

	<ReadMore>
		Redigér holdnavn og elevnavne. Tilføj først evt. elever ved at skrive ind i et blankt felt nederst (<mark
			class="mark">OBS:</mark
		>
		det er vigtigt at nye elever tilføjes nederst). Fjern derefter en elev ved at rydde inputfeltet med elevens navn.
		{#snippet expansion()}
			<ul class="unordered-list">
				<li>Holdnavnet må kun indeholde tegnene a-å, A-Å, 0-9 samt bindestreg (-) og mellemrum ( ).</li>
				<li>Det er smart at bruge korte navne frem for fulde navne, da det vises bedre på siden.</li>
				<li>Listen med elevnavne får automatisk flere inputfelter, når alle felter er udfyldt.</li>
				<li>Tomme felter ignoreres og rækkefølgen af elevnavne er ligegyldig.</li>
				<li>Du kan navigere mellem felter med piletasterne, returtasten eller musen.</li>
				<li>Klik på 'Gem hold' gemmer ændringerne.</li>
			</ul>
		{/snippet}
	</ReadMore>

	<ClassForm onsubmit={editClassAndGoToClass} bind:className bind:students {id} />
</div>

<div style="height: 30vh"></div>
