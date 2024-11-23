<script lang="ts">
	import { getContext } from 'svelte';
	import { type ToastContext } from '@skeletonlabs/skeleton-svelte';
	import { goto } from '$app/navigation';
	import { classNameUrlName } from '$lib/utils';
	import ClassForm from '$lib/ClassForm.svelte';
	import type { PageData } from '../$types';
	import { editClass } from '$lib/persistence.svelte';

	export const toast: ToastContext = getContext('toast');

	let { data }: { data: PageData } = $props();

	let id = 1 + data.currentClass.students.reduce((prevMax, s) => Math.max(prevMax, s.id), 0);
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
				toast.create({
					title: 'Fejl',
					description: error.message,
					type: 'error'
				});
			});
	}
</script>

<h3 class="h3">Redigér hold</h3>
<ClassForm onsubmit={editClassAndGoToClass} bind:className bind:students {id} />
