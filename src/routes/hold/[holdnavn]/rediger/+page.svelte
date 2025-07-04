<script lang="ts">
	import { goto } from '$app/navigation';
	import ClassForm from '$lib/ClassForm.svelte';
	import { editClass } from '$lib/persistence.svelte';
	import { toaster } from '$lib/toaster-svelte';
	import { classNameUrlName, getNextStudentId } from '$lib/utils';
	import type { PageProps } from '../$types';

	let { data }: PageProps = $props();

	let id = getNextStudentId(data.currentClass.students);
	let className = $state(data.currentClass.name);
	let students: Student[] = $state(data.currentClass.students);

	function editClassAndGoToClass(e: Event) {
		e.preventDefault();
		const name = $state.snapshot(className);
		const studs = $state.snapshot(students).toSorted((a, b) => a.name.localeCompare(b.name));
		const id = data.currentClass.id;
		editClass(id, name, studs)
			.then(() => {
				goto(`/hold/${classNameUrlName(name)}`, { invalidateAll: true });
				return;
			})
			.catch((error) => {
				console.error(error);
				toaster.error({
					title: 'Kunne ikke redigere hold',
					description: error.message,
				});
			});
	}
</script>

<h3 class="h3">Redigér hold</h3>
<ClassForm onsubmit={editClassAndGoToClass} bind:className bind:students {id} />
<div style="height: 30vh"></div>
