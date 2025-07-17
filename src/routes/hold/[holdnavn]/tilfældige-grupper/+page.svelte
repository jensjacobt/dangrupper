<script lang="ts">
	import { page } from '$app/state'
	import CopyToExcelButton from '$lib/CopyToExcelButton.svelte'
	import DisplayGroups from '$lib/DisplayGroups.svelte'
	import { createRandomGroups } from '$lib/groupGenerator'
	import { setRandomGroups } from '$lib/persistence.svelte'
	import ReadMore from '$lib/ReadMore.svelte'
	import { groupsFromIds } from '$lib/utils'
	import { Segment } from '@skeletonlabs/skeleton-svelte'
	import Svelecte from 'svelecte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	let randomGroups = $state(data.initialRandomGroups)
	let options = $state(data.currentClass.students)
	$effect.pre(() => {
		console.log('Reading in loaded data')
		randomGroups = data.initialRandomGroups
		options = data.currentClass.students
	})
	$effect(() => {
		console.log('Storing random groups in DB')
		setRandomGroups(data.currentClass.id, $state.snapshot(randomGroups))
	})

	const displayGroups = $derived(groupsFromIds(randomGroups.currentGroups, data.currentClass))

	const size = $derived.by(() => {
		if (randomGroups.type === 'groupSize') {
			return randomGroups.groupSize
		}
		return randomGroups.groupNumber
	})

	function onchange(e: Event) {
		const num = Number.parseInt((e.target as HTMLInputElement).value)
		if (isNaN(num)) return
		if (randomGroups.type === 'groupSize') {
			randomGroups.groupSize = num
		} else {
			randomGroups.groupNumber = num
		}
	}

	function createGroups() {
		const studentIds = $state
			.snapshot(data.currentClass.students)
			.map((s) => s.id)
			.filter((id) => !randomGroups.absentStudentIds.includes(id))
		const type = $state.snapshot(randomGroups.type)
		const numberOfGroups =
			randomGroups.type === 'groupSize' ?
				Math.ceil(studentIds.length / randomGroups.groupSize)
			:	randomGroups.groupNumber
		const groups = createRandomGroups(studentIds, numberOfGroups)
		randomGroups.currentGroups = groups
	}

	function absentString() {
		return data.currentClass.students
			.filter((s) => !randomGroups.currentGroups.some((g) => g.includes(s.id)))
			.map((s) => s.name)
			.toSorted()
			.join(', ')
	}

	function addendum() {
		return `\nFraværende: ${absentString()}`
	}

	const types: { text: string; value: string }[] = [
		{ text: 'Gruppestørrelse:', value: 'groupSize' },
		{ text: 'Gruppeantal:', value: 'groupNumber' },
	]
</script>

<!--================================================================================================================-->

<svelte:head>
	<title>Tilfældige grupper • {data.currentClass.name} • Dan grupper</title>
</svelte:head>

<h3 class="h3">Tilfældige grupper</h3>

<ReadMore>
	Her kan du oprette tilfældige grupper. Indstil gruppestørrelse/gruppeantal og angiv eventuelt fraværende elever, som
	ikke skal indgå i de dannede grupper.
	{#snippet expansion()}
		<ul class="unordered-list">
			<li>Klik på 'Gruppestørrelse' eller 'Gruppeantal' og vælg tallets størrelse.</li>
			<li>
				De fraværende elever skrives alle ind i det samme inputfelt.
				<ul>
					<li>
						Du kan skrive for at søge dig frem til eleven og trykke returtast (enter) eller tabulatortast for at vælge
						den markerede elev. Piletasterne kan bruges til at flytte markeringen op og ned på listen.
					</li>
					<li>Du kan også scrolle og klikke på en elev for at tilføje eleven til gruppen.</li>
				</ul>
			</li>
			<li>Knappen 'Dan grupper' danner tilfældige grupper. Klik igen for nye grupper.</li>
			<li>
				De aktuelle grupper gemmes automatisk i browseren. (Tag backup, hvis du vil sikre at have dem, da browseren kan
				slette dem ved pladsmangel.)
			</li>
		</ul>
		Der er ingen historik over tidligere grupper.
	{/snippet}
</ReadMore>

<h4 class="mt-4 h4">Indstillinger</h4>

<form class="space-y-2">
	<div class="flex">
		<Segment
			name="size"
			value={randomGroups.type}
			onValueChange={(e) => (randomGroups.type = (e.value ?? 'groupSize') as SizeType)}
			padding="p-1.5"
		>
			<Segment.Item labelBase="text-sm" classes="px-4 py-1" value="groupSize">Gruppestørrelse</Segment.Item>
			<Segment.Item labelBase="text-sm" classes="px-4 py-1" value="groupNumber">Gruppeantal</Segment.Item>
		</Segment>
		<input class="mx-2 input inline-block w-16" type="number" min="1" max="20" value={size} {onchange} />
	</div>
</form>

<h5 class="h5">Fraværende</h5>

{#key page.url.pathname}
	<div class="mb-4">
		<Svelecte
			multiple
			{options}
			clearable={true}
			placeholder={''}
			labelField={'name'}
			valueField={'id'}
			bind:value={randomGroups.absentStudentIds}
		/>
	</div>
{/key}

<button class="mr-3 btn preset-filled-primary-500" onclick={createGroups}> Dan grupper </button>

{#if displayGroups.length}
	<h4 class="h4">Grupper</h4>

	<DisplayGroups groups={displayGroups} />

	<p><strong>Fraværende:</strong> {absentString()}</p>

	<CopyToExcelButton groups={displayGroups} {addendum} />
{/if}

<div style="height: 60vh"></div>
