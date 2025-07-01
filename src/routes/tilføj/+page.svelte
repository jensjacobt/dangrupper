<script lang="ts">
	import { goto } from '$app/navigation';
	import ClassForm from '$lib/ClassForm.svelte';
	import { addClass } from '$lib/persistence.svelte';
	import { toaster } from '$lib/toaster-svelte';
	import { classNameUrlName } from '$lib/utils';

	let id = 0;
	let className = $state('');
	let students: Student[] = $state([]);

	function addClassAndGoToClass(e: Event) {
		e.preventDefault();
		const name = $state.snapshot(className);
		const studs = $state.snapshot(students).toSorted((a, b) => a.name.localeCompare(b.name));
		addClass(name, studs)
			.then(() => {
				goto(`/hold/${classNameUrlName(name)}`, { invalidateAll: true });
				return;
			})
			.catch((error) => {
				console.error(error);
				toaster.error({
					title: 'Kunne ikke tilføje hold',
					description: error.message,
				});
			});
	}
</script>

<h3 class="h3">Tilføj hold</h3>
<ClassForm onsubmit={addClassAndGoToClass} bind:className bind:students {id} />
<div style="height: 30vh"></div>
