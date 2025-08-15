<script lang="ts">
	import CopyToExcelButton from '$lib/CopyToExcelButton.svelte'
	import DisplayGroups from '$lib/DisplayGroups.svelte'
	import { createTableGroups, getEmptyPredefinedGroups, getTableGroupSizes } from '$lib/groupGenerator'
	import { addToTableGroupsHistory, setTableGroups } from '$lib/persistence.svelte'
	import ReadMore from '$lib/ReadMore.svelte'
	import { toaster } from '$lib/toaster'
	import { groupsFromIds } from '$lib/utils'
	import { Check, Download } from '@lucide/svelte'
	import { Switch } from '@skeletonlabs/skeleton-svelte'
	import Svelecte from 'svelecte'
	import type { PageProps } from './$types'
	import OutputTableHorizontal from './OutputTableHorizontal.svelte'

	let { data }: PageProps = $props()

	let tableGroups = $state() as TableGroups
	let options = $state() as Student[]

	let initialManualGroupSizesString = $state() as string

	const displayGroups = $derived(
		tableGroups.currentGroups ? groupsFromIds(tableGroups.currentGroups, data.currentClass) : [],
	)
	const manualGroupsDifference = $derived.by(() => {
		if (!tableGroups) return 0

		return tableGroups.manualGroupSizes.reduce((acc, val) => acc + val, 0) - data.currentClass.students.length
	})
	const groupsConform = $derived(displayGroups.length <= 8 && displayGroups.every((g) => g.length <= 4))

	$effect.pre(() => {
		// needed for navigation between classes
		console.log('Reading in loaded data')
		tableGroups = data.initialTableGroups
		options = data.currentClass.students // needed trick for Svelecte

		initialManualGroupSizesString = data.initialTableGroups.manualGroupSizes.join(', ')
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

	function reset() {
		tableGroups.saved = false
		tableGroups.currentGroups = []
	}

	function setPredefinedGroupsFromManualGroupSizes() {
		tableGroups.predefinedGroups = tableGroups.manualGroupSizes.map((gs) => Array(gs).fill(null))
	}

	function advancedToggled(checked: boolean) {
		tableGroups.advanced = checked
		if (checked) {
			initialManualGroupSizesString = tableGroups.manualGroupSizes.join(', ')
			if (
				manualGroupsDifference == 0
				&& !arraysEqual(
					tableGroups.manualGroupSizes,
					tableGroups.predefinedGroups.map((g) => g.length),
				)
			) {
				setPredefinedGroupsFromManualGroupSizes()
			}
		}

		const numStudents = data.currentClass.students.length
		if (!checked && !arraysEqual(tableGroups.manualGroupSizes, getTableGroupSizes(numStudents))) {
			tableGroups.predefinedGroups = getEmptyPredefinedGroups(numStudents)
		}
		reset()
	}

	function arraysEqual(a1: number[], a2: number[]) {
		return (
			a1.length === a2.length
			&& a1.every(function (value, index) {
				return value === a2[index]
			})
		)
	}

	function updateManualGroupSizes(input: string) {
		const parts = input.split(',')
		const groupSizes = []
		for (const p of parts) {
			const num = parseInt(p, 10)
			if (!isNaN(num)) {
				groupSizes.push(num)
			}
		}
		if (!arraysEqual(tableGroups.manualGroupSizes, groupSizes)) {
			tableGroups.manualGroupSizes = groupSizes
			reset()
			if (manualGroupsDifference == 0) {
				setPredefinedGroupsFromManualGroupSizes()
			} else {
				tableGroups.predefinedGroups = []
			}
		}
	}

	// TODO: Bug når de skiftes mellem hold. Se Noter-app'en.

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

<!--================================================================================================================-->

<svelte:head>
	<title>Bordgrupper • {data.currentClass.name} • Dan grupper</title>
</svelte:head>

<h3 class="h3">Bordgrupper</h3>
<ReadMore>
	Her kan du oprette bordgrupper (normalt på højst 4 personer). Du kan indstille, at der ikke skal være for mange
	gengangere fra
	<a class="anchor" href="historik/">historikken</a> af tidligere grupper – og evt. vælge nogle forudbestemte medlemmer
	til nogle af grupperne.
	{#snippet expansion()}
		<ol class="ordered-list space-y-2">
			<li>
				Vælg det maksimale antal gengangere, og hvor mange grupper, der skal kigges tilbage i historikken, når der
				kigges på gengangere.
				<br /> Bemærk: hvis du sætter antal gengangere lavt (fx til 0), men sætter hvor langt der kigges tilbage højt (fx
				4 eller 5), så bliver kravene så restriktive, at der måske ikke kan dannes grupper (og der vises en fejlbjælke).
				Erfaringen viser, at 0 gengangere fra de sidste 3 grupper fungerer fint. Eksperimentér selv.
			</li>
			<li>
				Vælg eventuelt forudbestemte medlemmer.
				<br /> Under indstillinger ses antal grupper og antal medlemmer i hver gruppe – vist med inputfelter. Hvis der er
				nogle elever, som du gerne vil have i en bestemt gruppe (som makkerpar eller blot i samme 4-mandsgruppe).
			</li>
			<li>
				Klik på 'Dan grupper'. Klik igen for nye grupper.
				<br /> De forudbestemte medlemmer placeres præcist, som du placerede dem under indstillinger. Hvis forudbestemte
				medlemmer har været i gruppe sammen for nyligt, så kommer der en advarselsbjælke, men grupperne dannes alligevel.
			</li>
			<li>
				Klik på 'Gem grupper', når du er tilfreds med grupperne. Så gemmes de i historikken.
				<br /> Du kan se <a class="anchor" href="historik/">historikken</a> vha. linket ovenfor. Der kan du også slette et
				sæt af grupper fra historikken, hvis du skulle fortryde gruppeoprettelser.
			</li>
			<li>
				Under 'Eksportér grupper' har du nu to muligheder. Kopiér det viste billede, eller kopiér tekst som er klar til
				at blive indsat i celler i Excel (eller et andet regneark).
			</li>
			<li>
				Tag endelig en backup, da din browser kan vælge at slette app'ens database. Download en backup-fil vha. knappen
				<Download class="inline" size={20} /> øverst til højre på enhver side.
			</li>
			<li>Hvis du slår avancerede indstillinger til, så kan du manuelt vælge gruppestørrelserne.</li>
		</ol>
		Næste gang du laver bordgrupper, vil du nok rydde de forudbestemte medlemmer vha. knappen til det.
		<mark class="mark">Tip:</mark> Du kan bruge funktionen med forudbestemte medlemmer, hvis du vil oprette manuelle bordgrupper,
		som kommer i historikken, og hvor du undgår fejl med at skrive samme navn flere gange eller slet ikke.
	{/snippet}
</ReadMore>

<h4 class="mb-2 h4">Indstillinger</h4>
<p>
	Den enkelte elev skal opleve højst
	<input class="mx-2 input inline-block w-16" type="number" min="0" max="3" bind:value={tableGroups.maxRecurring} />
	gengangere fra sine
	<input class="mx-2 input inline-block w-16" type="number" min="0" max="10" bind:value={tableGroups.nLastGroups} />
	sidste grupper.
</p>

<div class="flex gap-2 align-middle">
	<Switch name="advanced" checked={tableGroups.advanced} onCheckedChange={(e) => advancedToggled(e.checked)} />
	<span>Avancerede indstillinger</span>
</div>
{#if tableGroups.advanced}
	<h6 class="h6">Gruppestørrelser</h6>
	<p>
		OBS: Ændring af gruppestørrelser nulstiller forudbestemte medlemmer.<br />
		Skriv de ønskede gruppestørrelser adskilt af kommaer:
	</p>
	<input
		class="input w-80"
		type="text"
		value={initialManualGroupSizesString}
		oninput={(e) => updateManualGroupSizes(e.currentTarget.value)}
	/>
	{#if manualGroupsDifference != 0}
		{@const numStudents = data.currentClass.students.length}
		Grupperne tæller tilsammen {numStudents + manualGroupsDifference} af klassens {numStudents} elever.
		{manualGroupsDifference < 0 ? `Tilføj ${-manualGroupsDifference}` : `Fjern ${manualGroupsDifference}`}
		elever for at kunne danne grupper.
	{/if}
{/if}

{#if !tableGroups.advanced || manualGroupsDifference == 0}
	<h5 class="h5">Forudbestemte medlemmer</h5>
	<div class="flex flex-wrap gap-3">
		{#each tableGroups.predefinedGroups as _, i}
			<div class="w-36 card">
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
{/if}

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
		<button
			class="inline-flex min-h-9 cursor-default items-center gap-2 rounded-base preset-tonal-success px-4 py-1 base-line-height"
		>
			Grupper gemt <Check size={16} />
		</button>
		<h4 class="h4">Eksportér grupper</h4>
		{#if groupsConform}
			<OutputTableHorizontal groups={displayGroups} />
		{:else}
			<CopyToExcelButton groups={displayGroups} />
		{/if}
	{/if}
{/if}

<div style="height: 80vh"></div>
