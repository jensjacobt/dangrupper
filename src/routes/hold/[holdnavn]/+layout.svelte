<script lang="ts">
	import type { LayoutData } from './$types';
	import { removeClass } from '$lib/persistence.svelte';
	import { goto } from '$app/navigation';
	import { getContext, type Snippet } from 'svelte';
	import { type ToastContext } from '@skeletonlabs/skeleton-svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { classNameUrlName } from '$lib/utils';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	export const toast: ToastContext = getContext('toast');

	let openState = $state(false);
	function modalClose() {
		openState = false;
	}

	function editClass() {
		const classUrlName = classNameUrlName(data.currentClass.name);
		goto(`/hold/${classUrlName}/rediger`);
	}

	function deleteClass() {
		modalClose();
		console.log('Deleting class', data.currentClass.name);
		removeClass(data.currentClass)
			.then(() => {
				goto('/', { invalidateAll: true });
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

<!-- Class bar -->
<div class="grid grid-cols-[1fr_auto_auto] items-center gap-4">
	<h2 class="h2">{data.currentClass.name}</h2>
	<button type="button" class="btn preset-filled-primary-500" onclick={editClass}>
		Redigér hold
	</button>
	<Modal
		bind:open={openState}
		triggerBase="btn preset-filled-primary-500"
		contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
		backdropClasses="backdrop-blur-sm"
	>
		{#snippet trigger()}Slet hold{/snippet}
		{#snippet content()}
			<header class="flex justify-between">
				<h2 class="h4">Vil du virkelig slette holdet "{data.currentClass.name}"?</h2>
			</header>
			<article>
				<p class="opacity-60">
					Holdet kan <i>ikke</i> efterfølgende genoprettes. (En backupfil kan ikke bruges til at genoprette
					et enkelt hold uden at overskrive alle hold.)
				</p>
			</article>
			<footer class="flex justify-end gap-4">
				<button type="button" class="btn preset-tonal" onclick={modalClose}>Annullér</button>
				<button type="button" class="btn preset-filled" onclick={deleteClass}>Slet hold</button>
			</footer>
		{/snippet}
	</Modal>
</div>

<!-- TODO: Add tabs for subpages (each with their own URL) -->
<!-- Maybe something like one of these: https://flowbite.com/docs/components/tabs/ -->
<!-- Or these: https://pagedone.io/docs/tabs -->

{@render children()}
