<script lang="ts">
	import DisplayGroups from '$lib/DisplayGroups.svelte'
	import { createTableGroups } from '$lib/groupGenerator'
	import { addToTableGroupsHistory, setTableGroups } from '$lib/persistence.svelte'
	import { toaster } from '$lib/toaster'
	import { groupsFromIds } from '$lib/utils'
	import { Check } from 'lucide-svelte'
	import Svelecte from 'svelecte'
	import type { PageProps } from './$types'
	import OutputTableHorizontal from './OutputTableHorizontal.svelte'

	let { data }: PageProps = $props()

	let tableGroups = $state() as TableGroups
	let options = $state() as Student[]
	const displayGroups = $derived(
		tableGroups.currentGroups ? groupsFromIds(tableGroups.currentGroups, data.currentClass) : [],
	)

	$effect.pre(() => {
		// needed for navigation between classes
		console.log('Reading in loaded data')
		tableGroups = data.initialTableGroups
		options = data.currentClass.students // needed trick for Svelecte
	})

	$effect(() => {
		console.log('Updating options')
		const predefinedIds = tableGroups.predefinedGroups.flat()
		options = data.currentClass.students.filter((s) => !predefinedIds.includes(s.id))
	})

	$effect(() => {
		console.log('Storing table groups in DB')
		setTableGroups(data.currentClass.id, $state.snapshot(tableGroups))
	})

	function clearPredefinedGroups() {
		// avoids changing group sizes
		for (let i = 0; i < tableGroups.predefinedGroups.length; i++) {
			for (let j = 0; j < tableGroups.predefinedGroups[i].length; j++) {
				tableGroups.predefinedGroups[i][j] = null
			}
		}
	}

	function createGroups() {
		try {
			tableGroups.saved = false
			const [groups, overMaxPredefined] = createTableGroups(
				data.currentClass.students,
				data.history,
				$state.snapshot(tableGroups),
			)
			tableGroups.currentGroups = groups
			tableGroups.errorText =
				groups.length ? '' : 'Grupper kunne ikke dannes. Justér evt. indstillingerne (så der er lavere krav).'
			if (overMaxPredefined.length == 0) {
				tableGroups.warningText = ''
			} else {
				let groupStrs = []
				for (const g of groupsFromIds(overMaxPredefined, data.currentClass)) {
					groupStrs.push(`[${g.map((s) => s.name).join(', ')}]`)
				}
				const warningStart = 'Grupper med forudbestemte medlemmer, der har for mange gengangere: '
				tableGroups.warningText = warningStart + groupStrs.join(', ')
			}
		} catch (error) {
			console.error(error)
			tableGroups.errorText = 'Uforventet fejl under gruppedannelse. Kontakt udvikleren hvis det fortsætter.'
		}
	}

	function saveGroups() {
		const newHistoryEntry = {
			createdAt: new Date().toISOString(),
			groups: $state.snapshot(tableGroups.currentGroups),
		}
		if (JSON.stringify(newHistoryEntry.groups) !== JSON.stringify(data.history.at(-1)?.groups)) {
			addToTableGroupsHistory(data.currentClass.id, newHistoryEntry).then(() => {
				data.history.push(newHistoryEntry)
				tableGroups.saved = true
			})
		} else {
			tableGroups.saved = true
			toaster.warning({
				description: 'Grupperne er allerede tilføjet til historikken.',
			})
		}
	}
</script>

<!--========================================================================-->

<svelte:head>
	<title>Bordgrupper • {data.currentClass.name} • Dan grupper</title>
</svelte:head>

<h3 class="h3">Bordgrupper</h3>
<p>
	Her kan du oprette bordgrupper (på højst 4 personer). Du kan indstille, at der ikke skal være for mange gengangere fra
	<a class="anchor" href="historik/">historikken</a>
	af tidligere grupper.
</p>
<h4 class="mb-2 h4">Indstillinger</h4>
<p>
	Den enkelte elev skal opleve højst
	<input class="mx-2 input inline-block w-16" type="number" min="0" max="3" bind:value={tableGroups.maxRecurring} />
	gengangere fra sine
	<input class="mx-2 input inline-block w-16" type="number" min="0" max="10" bind:value={tableGroups.nLastGroups} />
	sidste grupper.
</p>

<h5 class="h5">Forudbestemte medlemmer</h5>
<div class="flex flex-wrap gap-3">
	{#each tableGroups.predefinedGroups as _, i}
		<div class="w-40 card">
			<header class="card-header pb-2"><h6 class="h6">Gruppe {i + 1}</h6></header>
			<section class="single-selection flex flex-col gap-2">
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
<button class="mr-3 mb-4 btn preset-filled-primary-500" onclick={createGroups}> Dan grupper </button>
<!-- TODO: Evt. "Er du sikker?" -->
<button class="btn preset-outlined-primary-500" onclick={clearPredefinedGroups}> Ryd forudbestemte medlemmer </button>

{#if tableGroups.errorText}
	<div class="mt-4 card preset-tonal-error p-4">{tableGroups.errorText}</div>
{/if}
{#if displayGroups.length && !tableGroups.errorText.length}
	<h4 class="h4">Nye grupper</h4>
	{#if tableGroups.warningText}
		<div class="mt-4 card preset-tonal-warning p-4">{tableGroups.warningText}</div>
	{/if}

	<DisplayGroups groups={displayGroups} />

	{#if !tableGroups.saved}
		<button class="btn preset-filled-primary-500" onclick={saveGroups}>Gem grupper</button>
	{:else}
		<button class="inline-flex min-h-9 items-center gap-2 rounded-base preset-tonal-success px-4 py-1 base-line-height">
			Grupper gemt <Check size={16} />
		</button>
		<h4 class="h4">Eksportér grupper</h4>
		<OutputTableHorizontal groups={displayGroups} />
	{/if}
{/if}

<div style="height: 80vh"></div>
