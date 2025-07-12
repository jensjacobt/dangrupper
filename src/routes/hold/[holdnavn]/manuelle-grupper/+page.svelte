<script lang="ts">
	import { page } from '$app/state'
	import CopyToExcelButton from '$lib/CopyToExcelButton.svelte'
	import DisplayGroups from '$lib/DisplayGroups.svelte'
	import { setManualGroups } from '$lib/persistence.svelte'
	import { groupsFromIds, idsFromGroups, sortedByName } from '$lib/utils'
	import Svelecte from 'svelecte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	let groups = $state<Student[][]>() as Student[][]
	let options = $state<Student[]>(data.currentClass.students) as Student[]
	let triggerUpdateKey = $state(0)
	$effect.pre(() => {
		// needed for navigation between classes
		console.log('Reading in loaded data')
		groups = groupsFromIds(data.initialManualGroups.currentGroups, data.currentClass)
		options = data.currentClass.students
	})
	$effect(() => {
		console.log('Storing manual groups in DB')
		setManualGroups(data.currentClass.id, { currentGroups: idsFromGroups($state.snapshot(groups)) })
		options = data.currentClass.students.filter((s) => !groups.some((g) => g.some((st) => st.id === s.id)))
	})

	const displayGroups = $derived(groups.filter((g) => g.length > 0))

	function onchange(value: Student[], i: number) {
		if (value.length == 0) {
			reset(groups.filter((g) => g.length > 0))
		}
	}

	function sortGroups() {
		reset(groups.map((g) => sortedByName(g)))
	}

	function clearGroups() {
		reset([])
	}

	function reset(newGroups: Student[][]) {
		groups = newGroups
		options = data.currentClass.students
		triggerUpdateKey++
	}
</script>

<!--========================================================================-->

<svelte:head>
	<title>Manuelle grupper • {data.currentClass.name} • Dan grupper</title>
</svelte:head>

<h3 class="h3">Manuelle grupper</h3>

<p>Her kan du oprette grupper, hvor du manuelt vælger medlemmer.</p>

<h4 class="h4">Vælg medlemmer</h4>
{#key page.url.pathname}
	{#key triggerUpdateKey}
		{#each { length: 1 + groups.length }, i}
			<Svelecte
				multiple
				clearable
				placeholder={''}
				labelField={'name'}
				valueField={'id'}
				{options}
				valueAsObject={true}
				bind:value={groups[i]}
				onChange={(a: Student[]) => onchange(a, i)}
			/>
		{/each}
	{/key}
{/key}

<p>
	{#if options.length > 0}
		{options.length} elever er ikke i en gruppe.
	{:else}
		Alle elever er placeret 👍
	{/if}
</p>

<button
	class="mr-3 btn preset-filled-primary-500"
	onclick={sortGroups}
	title="Sortér navnene i de enkelte grupper alfabetisk"
>
	Sortér grupper
</button>
<!-- TODO: Evt. "Er du sikker?" -->
<button class="btn preset-outlined-primary-500" onclick={clearGroups}> Ryd alle grupper </button>

<h4 class="h4">Grupper</h4>

<DisplayGroups groups={displayGroups} />

<CopyToExcelButton groups={displayGroups} />

<div style="height: 60vh"></div>
