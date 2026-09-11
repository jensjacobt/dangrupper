<script lang="ts">
	import { page } from '$app/state'
	import CopyToExcelButton from '$lib/CopyToExcelButton.svelte'
	import DisplayGroups from '$lib/DisplayGroups.svelte'
	import { setManualGroups } from '$lib/persistence.svelte'
	import ReadMore from '$lib/ReadMore.svelte'
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

	function onchange(value: Student[]) {
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

<!--================================================================================================================-->

<svelte:head>
	<title>Manuelle grupper • {data.currentClass.name} • Dan grupper</title>
</svelte:head>

<h3 class="h3">Manuelle grupper</h3>

<ReadMore>
	Her kan du oprette grupper, hvor du manuelt vælger medlemmer. Udfyld en gruppe pr. inputfelt.
	{#snippet expansion()}
		<ul class="unordered-list">
			<li>
				Det første inputfelt skal have alle navne til den første gruppe. Andet inputfelt skal have alle medlemmer af
				anden gruppe osv.
				<ul>
					<li>
						Du kan skrive for at søge dig frem til eleven og trykke returtast (enter) at vælge den markerede elev.
						Piletasterne kan bruges til at flytte markeringen op og ned på listen.
					</li>
					<li>Du kan også scrolle og klikke på en elev for at tilføje eleven til gruppen.</li>
					<li>Du kan trykke tabulatortast for hurtigt at gå til næste inputfelt.</li>
				</ul>
			</li>
			<li>Der kommer automatisk nye inputfelter, mens grupperne udfyldes.</li>
			<li>Oversigten over grupperne opdateres automatisk undervejs, mens der tilføjes elever.</li>
			<li>
				Midlertidige grupper gemmes automatisk i browseren. (Tag backup, hvis du vil sikre at have dem, da browseren kan
				slette dem ved pladsmangel.)
			</li>
			<li>Ryd en enkelt gruppe vha. krydset (×) helt ude til højre i gruppens inputfelt.</li>
			<li>Knappen 'Sortér grupper' sorterer medlemmernes navne alfabetisk i hver enkelt gruppe.</li>
			<li>
				Knappen 'Ryd alle grupper' tømmer alle grupper for medlemmer. Brug den, når der skal laves nye manuelle grupper.
			</li>
			<li>Se under inputfelterne om alle elever er blevet tilføjet til en gruppe.</li>
			<li>Knappen 'Kopiér til Excel' gør, hvad den plejer. Efter klik på denne kan du sætte ind i et regneark.</li>
		</ul>
		Der er ingen historik over tidligere grupper.
	{/snippet}
</ReadMore>

<h4 class="h4">Vælg medlemmer</h4>
{#key page.url.pathname}
	{#key triggerUpdateKey}
		{#each { length: 1 + groups.length }, i}
			<div class="flex items-center gap-2">
				<span class="btn w-12 preset-tonal hover:preset-tonal">{i + 1}.</span>
				<Svelecte
					multiple
					clearable
					placeholder=""
					labelField="name"
					valueField="id"
					{options}
					valueAsObject={true}
					bind:value={groups[i]}
					onChange={(a: Student[]) => onchange(a)}
				/>
			</div>
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
	Sortér medlemmer
</button>
<!-- TODO: "Er du sikker?"! -->
<button class="btn preset-outlined-primary-500" onclick={clearGroups}> Ryd alle grupper </button>

<h4 class="h4">Grupper</h4>

<DisplayGroups groups={displayGroups} />

<CopyToExcelButton groups={displayGroups} />

<div style="height: 60vh"></div>
