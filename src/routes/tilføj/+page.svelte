<script lang="ts">
	import { getContext } from 'svelte';
	import { type ToastContext } from '@skeletonlabs/skeleton-svelte';
	import { addClass } from '$lib/persistence.svelte';
	import { goto } from '$app/navigation';
	import { classNameUrlName } from '$lib/utils';
	import ClassForm from '$lib/ClassForm.svelte';

	export const toast: ToastContext = getContext('toast');

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
				toast.create({
					title: 'Fejl',
					description: error.message,
					type: 'error'
				});
			});
	}
</script>

<h3 class="h3">Tilføj hold</h3>
<ClassForm onsubmit={addClassAndGoToClass} bind:className bind:students {id} />
