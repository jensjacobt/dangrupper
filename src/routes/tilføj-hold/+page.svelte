<script lang="ts">
	import { goto } from '$app/navigation'
	import ClassForm from '$lib/ClassForm.svelte'
	import { addClass, setClassBeingAdded } from '$lib/persistence.svelte'
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

<!--========================================================================-->

<svelte:head>
	<title>Tilføj hold • Dan grupper</title>
</svelte:head>

<h2 class="h2">Tilføj hold</h2>
<ClassForm onsubmit={addClassAndGoToClass} bind:className bind:students bind:id>
	<button type="reset" class="ml-2 btn preset-outlined-primary-500" onclick={resetClassBeingAdded}>
		Nulstil formular
	</button>
</ClassForm>
<div style="height: 30vh"></div>
