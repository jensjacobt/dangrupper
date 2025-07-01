<script lang="ts">
	import type { PageProps } from './$types';
	import Svelecte from 'svelecte';
	import { addToHistory, setStored } from '$lib/persistence.svelte';
	import { createTableGroups } from '$lib/groupGenerator';
	import OutputTableHorizontal from './OutputTableHorizontal.svelte';
	import { toaster } from '$lib/toaster-svelte';

	let { data }: PageProps = $props();

	let tableGroups = $state() as TableGroups;
	let displayGroups = $state() as Student[][];
	let options = $state() as Student[];

	$inspect(tableGroups);

	$effect.pre(() => {
		console.log('Reading in loaded data');
		tableGroups = data.initialTableGroups;
		displayGroups = groupsFromIds(data.initialTableGroups.currentGroups);
		options = data.currentClass.students;
	});

	$effect(() => {
		console.log('Updating options');
		const predefinedIds = tableGroups.predefinedGroups.flat();
		options = data.currentClass.students.filter((s) => !predefinedIds.includes(s.id));
	});

	$effect(() => {
		console.log('Storing table groups in DB');
		setStored<TableGroups>(data.keyCurrent, $state.snapshot(tableGroups));
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
			displayGroups = groupsFromIds(groups);
			tableGroups.errorText = groups.length ? '' : 'Grupper kunne ikke dannes. Justér evt. indstillingerne.';
			if (overMaxPredefined.length == 0) {
				tableGroups.warningText = '';
			} else {
				let groupStrs = [];
				for (const g of groupsFromIds(overMaxPredefined)) {
					groupStrs.push(`[${g.map((s) => s.name).join(', ')}]`);
				}
				const warningStart = 'Grupper med forudbestemte medlemmer, der har for mange gengangere: ';
				tableGroups.warningText = warningStart + groupStrs.join(', ');
			}
		} catch (e) {
			// TODO: Toast error
			displayGroups = [];
		}
	}

    function saveGroups() {
        const snapshotCurrentGroups = $state.snapshot(tableGroups.currentGroups);
        if (JSON.stringify(snapshotCurrentGroups) !== JSON.stringify(data.history.at(-1))) {
            addToHistory(data.keyHistory, snapshotCurrentGroups).then(() => {
                data.history.push(snapshotCurrentGroups);
                tableGroups.saved = true;
            });
        } else {
            tableGroups.saved = true;
            toaster.warning({
                description: 'Grupperne er allerede tilføjet til historikken'
            });
        }
    }

	function groupsFromIds(ids: maybeIdNumber[][]): Student[][] {
		let groups = [];
		for (const groupIds of ids) {
			let group: Student[] = [];
			for (const id of groupIds) {
				const student = data.currentClass.students.find((s) => s.id == id);
				if (student) {
					group.push(student);
				}
			}
			groups.push(group);
		}
		return groups;
	}
</script>

<!------------------------------------------------------------------------------------------------>

<h4 class="h3 mt-6">Bordgrupper</h4>
<h4 class="h4">Indstillinger</h4>
Den enkelte elev skal opleve højst
<input class="input mx-2 inline-block w-16"	type="number" min="0" max="3" bind:value={tableGroups.maxRecurring}/>
gengangere fra sine
<input class="input mx-2 inline-block w-16" type="number" min="0" max="20" bind:value={tableGroups.nLastGroups}/>
sidste grupper.

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

{#if displayGroups.length || tableGroups.errorText}
	<h4 class="h4 mb-0 mt-6">Nye grupper</h4>
	{#if tableGroups.errorText}
		<div class="card p-4 preset-filled-error-500">{tableGroups.errorText}</div>
	{/if}
	{#if tableGroups.warningText}
		<div class="card p-4 preset-filled-warning-500">{tableGroups.warningText}</div>
	{/if}
	<div class="flex flex-wrap gap-4">
		{#each displayGroups as _, i}
			<div class="card w-40">
				<header class="card-header pt-4 pb-2"><h6 class="h6">Gruppe {i + 1}</h6></header>
				<section class="flex flex-col gap-3">
					{#each displayGroups[i] as _, j}
						<div class="overflow-hidden whitespace-nowrap" style="overflow: hidden; white-space: nowrap">{displayGroups[i][j].name}</div>
					{/each}
				</section>
			</div>
		{/each}
	</div>
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

<!-- 
data.initialTableGroups:
<pre class="pre">{JSON.stringify(data.initialTableGroups, null, 2)}</pre> -->
