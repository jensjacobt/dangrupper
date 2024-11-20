<script lang="ts">
	import type { PageData } from './$types';
	import Svelecte from 'svelecte';
	import { removeClass, setStored } from '$lib/persistence.svelte';
	import { type ToastContext } from '@skeletonlabs/skeleton-svelte';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';

	export const toast: ToastContext = getContext('toast');

	let { data }: { data: PageData } = $props();

	let tableGroups = $state() as TableGroups;
	let options = $state() as Student[];

	$effect.pre(() => {
		console.log('Reading in loaded data');
		tableGroups = data.initialTableGroups;
		options = data.currentClass.students;
	});

	$effect(() => {
		console.log('Updating options');
		const predefinedIds = tableGroups.predefinedGroups.flat();
		options = data.currentClass.students.filter((s) => !predefinedIds.includes(s.id));
	});

	$effect(() => {
		console.log('Storing table groups in DB');
		setStored<TableGroups>(data.key, $state.snapshot(tableGroups));
	});

	function clearPredefinedGroups() {
		// avoids changing group sizes
		for (let i = 0; i < tableGroups.predefinedGroups.length; i++) {
			for (let j = 0; j < tableGroups.predefinedGroups[i].length; j++)
				tableGroups.predefinedGroups[i][j] = null;
		}
	}

	function createGroups() {}

	function deleteClass(klass: Class) {
		console.log('Deleting class', klass.name);
		// TODO: Er du sikker?
		removeClass(klass)
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

<!------------------------------------------------------------------------------------------------>

<!-- TODO: Flyt header til layout.svelte (ny fil) -->
<div class="grid grid-cols-[1fr_auto_auto] items-center gap-4">
	<h2 class="h2">{data.currentClass.name}</h2>
	<button type="button" class="btn preset-filled-primary-500"> Redigér klasse </button>
	<button
		type="button"
		class="btn preset-filled-primary-500"
		onclick={() => deleteClass(data.currentClass)}
	>
		Slet klasse
	</button>
</div>

<h4 class="h4">Indstillinger</h4>
Den enkelte elev skal opleve højst
<input
	class="input mx-2 inline-block w-16"
	type="number"
	min="0"
	max="3"
	bind:value={tableGroups.maxRecurring}
/>
gengangere fra sine
<input
	class="input mx-2 inline-block w-16"
	type="number"
	min="0"
	max="20"
	bind:value={tableGroups.nLastGroups}
/>
sidste grupper.

<h4 class="h4">Forudbestemte medlemmer</h4>
<div class="flex flex-wrap gap-4">
	{#each tableGroups.predefinedGroups as _, i}
		<div class="card w-52">
			<header class="card-header py-4"><h6 class="h6">Gruppe {i + 1}</h6></header>
			<section class="flex flex-col gap-4">
				{#each tableGroups.predefinedGroups[i] as _, j}
					<Svelecte
						{options}
						clearable={true}
						placeholder={''}
						labelField={'name'}
						valueField={'id'}
						bind:value={tableGroups.predefinedGroups[i][j]}
					/>
				{/each}
			</section>
		</div>
	{/each}
</div>
<button class="btn preset-filled-primary-500" onclick={clearPredefinedGroups}>
	Ryd forudbestemte medlemmer
</button>

<h4 class="h4">Nye grupper</h4>
<button class="btn preset-filled-primary-500" onclick={createGroups}> Dan grupper </button>

<p>Dan grupper-knap</p>
<p>Gruppevisning</p>
<p>Gem grupper-knap</p>
<h4 class="h4">Eksporter gruppe</h4>

data.initialTableGroups:
<pre class="pre">{JSON.stringify(data.initialTableGroups, null, 2)}</pre>
