<script lang="ts">
	import { page } from '$app/state'
	import DisplayGroups from '$lib/DisplayGroups.svelte'
	import { createRandomGroups } from '$lib/groupGenerator'
	import { setRandomGroups } from '$lib/persistence.svelte'
	import { groupsFromIds } from '$lib/utils'
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

	function copyTextForExcel() {
		const gs = Math.max(...displayGroups.map((g) => g.length))
		const rows = []
		for (let j = 0; j < gs; j++) {
			const row = []
			for (let i = 0; i < displayGroups.length; i++) {
				row.push(displayGroups.at(i)?.at(j)?.name ?? ' ')
			}
			rows.push(row.join('\t'))
		}
		rows.push(`\nFraværende: ${absentString()}`)
		const output = rows.join('\n')
		navigator.clipboard
			.writeText(output)
			.then(() => console.log('succesfully copied text'))
			.catch(() => console.log('not allowed to copy text'))
	}

	const types: { text: string; value: string }[] = [
		{ text: 'Gruppestørrelse:', value: 'groupSize' },
		{ text: 'Gruppeantal:', value: 'groupNumber' },
	]
</script>

<svelte:head>
	<title>Tilfældige grupper • {data.currentClass.name} • Dan grupper</title>
</svelte:head>

<h3 class="h3">Tilfældige grupper</h3>

Her kan du oprette tilfældige grupper. Indstil gruppestørrelse og angiv eventuelt fraværende elever, som ikke skal indgå
i de dannede grupper. De fraværende elever skrives alle ind i det samme inputfelt.

<h4 class="mt-4 h4">Indstillinger</h4>

<form class="space-y-2">
	<div class="flex">
		<div>
			{#each types as { text, value }}
				<label class="flex items-center space-x-2">
					<input class="radio" type="radio" checked name="radio-direct" {value} bind:group={randomGroups.type} />
					<p>{text}</p>
				</label>
			{/each}
		</div>
		<input class="mx-2 input inline-block w-16" type="number" min="0" max="20" value={size} {onchange} />
	</div>
</form>

<p><strong>Fraværende:</strong></p>

{#key page.url.pathname}
	<div class="flex">
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

	<button class="mr-2 btn preset-filled-primary-500" onclick={copyTextForExcel}>Kopiér til Excel</button>
{/if}

<div style="height: 60vh"></div>
