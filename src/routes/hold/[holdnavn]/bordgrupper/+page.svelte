<script lang="ts">
	import DisplayGroups from '$lib/DisplayGroups.svelte';
	import { createTableGroups } from '$lib/groupGenerator';
	import { addToTableGroupsHistory, setTableGroups } from '$lib/persistence.svelte';
	import { toaster } from '$lib/toaster-svelte';
	import { groupsFromIds } from '$lib/utils';
	import Svelecte from 'svelecte';
	import type { PageProps } from './$types';
	import OutputTableHorizontal from './OutputTableHorizontal.svelte';

	let { data }: PageProps = $props();

	let tableGroups = $state() as TableGroups;
	let displayGroups = $state() as Student[][];
	let options = $state() as Student[];

	$effect.pre(() => { // needed for navigation between classes
		console.log('Reading in loaded data');
		tableGroups = data.initialTableGroups;
		displayGroups = groupsFromIds(data.initialTableGroups.currentGroups, data.currentClass);
		options = data.currentClass.students;
	});

	$effect(() => {
		console.log('Updating options');
		const predefinedIds = tableGroups.predefinedGroups.flat();
		options = data.currentClass.students.filter((s) => !predefinedIds.includes(s.id));
	});

	$effect(() => {
		console.log('Storing table groups in DB');
		setTableGroups(data.currentClass.id, $state.snapshot(tableGroups));
	});

	function clearPredefinedGroups() {
		// avoids changing group sizes
		for (let i = 0; i < tableGroups.predefinedGroups.length; i++) {
			for (let j = 0; j < tableGroups.predefinedGroups[i].length; j++)
				tableGroups.predefinedGroups[i][j] = null;
		}
	}

	function createGroups() {
		try {
			tableGroups.saved = false;
			const [groups, overMaxPredefined] = createTableGroups(
				data.currentClass.students,
				data.history,
				$state.snapshot(tableGroups)
			);
			tableGroups.currentGroups = groups;
			displayGroups = groupsFromIds(groups, data.currentClass);
			tableGroups.errorText = groups.length ? '' : 'Grupper kunne ikke dannes. Justér evt. indstillingerne (så der er lavere krav).';
			if (overMaxPredefined.length == 0) {
				tableGroups.warningText = '';
			} else {
				let groupStrs = [];
				for (const g of groupsFromIds(overMaxPredefined, data.currentClass)) {
					groupStrs.push(`[${g.map((s) => s.name).join(', ')}]`);
				}
				const warningStart = 'Grupper med forudbestemte medlemmer, der har for mange gengangere: ';
				tableGroups.warningText = warningStart + groupStrs.join(', ');
			}
		} catch (error) {
			displayGroups = [];
			console.error(error);
			toaster.error({
				title: "Ukendt fejl under gruppedannelse",
				description: "Kontakt udvikleren hvis det fortsætter."
			})
		}
	}

    function saveGroups() {
		const newHistoryEntry = {
			createdAt: (new Date()).toISOString(),
			groups: $state.snapshot(tableGroups.currentGroups)
		}
        if (JSON.stringify(newHistoryEntry.groups) !== JSON.stringify(data.history.at(-1)?.groups)) {
            addToTableGroupsHistory(data.currentClass.id, newHistoryEntry).then(() => {
                data.history.push(newHistoryEntry);
                tableGroups.saved = true;
            });
        } else {
            tableGroups.saved = true;
            toaster.warning({
                description: 'Grupperne er allerede tilføjet til historikken.'
            });
        }
    }
</script>

<!------------------------------------------------------------------------------------------------>

<svelte:head>
	<title>Bordgrupper • {data.currentClass.name} • Dan grupper</title>
</svelte:head>

<h3 class="h3">Bordgrupper</h3>
<p>
	Her kan du oprette bordgrupper (på højst 4 personer). Du kan indstille, at der ikke skal være for mange 
	gengangere fra <a class="underline" href="historik/">historikken</a> af tidligere grupper.
</p>
<h4 class="h4">Indstillinger</h4>
<p>
	Den enkelte elev skal opleve højst
	<input class="input mx-2 inline-block w-16"	type="number" min="0" max="3" bind:value={tableGroups.maxRecurring}/>
	gengangere fra sine
	<input class="input mx-2 inline-block w-16" type="number" min="0" max="10" bind:value={tableGroups.nLastGroups}/>
	sidste grupper.
</p>

<h4 class="h4 mb-0 mt-6">Forudbestemte medlemmer</h4>
<div class="flex flex-wrap gap-4">
	{#each tableGroups.predefinedGroups as _, i}
		<div class="card w-40">
			<header class="card-header pt-4 pb-2"><h6 class="h6">Gruppe {i + 1}</h6></header>
			<section class="flex flex-col gap-3">
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
<button class="btn mr-3 preset-filled-primary-500" onclick={createGroups}> 
	Dan grupper 
</button>
<button class="btn preset-outlined-primary-500" onclick={clearPredefinedGroups}>
	Ryd forudbestemte medlemmer
</button>

{#if displayGroups.length || tableGroups.errorText.length}
	<h4 class="h4 mb-0 mt-6">Nye grupper</h4>
	{#if tableGroups.errorText}
		<div class="card p-4 preset-filled-error-500">{tableGroups.errorText}</div>
	{/if}
	{#if tableGroups.warningText}
		<div class="card p-4 preset-filled-warning-500">{tableGroups.warningText}</div>
	{/if}
	<DisplayGroups groups={displayGroups} />
{/if}

{#if !tableGroups.saved && displayGroups.length}
	<button class="btn preset-filled-primary-500" onclick={saveGroups}> Gem grupper </button>
{/if}
{#if tableGroups.saved && displayGroups.length}
	<div class="card p-4 w-80 preset-tonal-success">Grupper gemt!</div>
	<h4 class="h4 mt-6">Eksporter grupper</h4>
	<OutputTableHorizontal groups={displayGroups} />
{/if}

<div style="height: 80vh"></div>
