<script lang="ts">
	import DisplayGroups from '$lib/DisplayGroups.svelte'
	import { removeFromTableGroupsHistory } from '$lib/persistence.svelte'
	import { toaster } from '$lib/toaster'
	import { groupsFromIds } from '$lib/utils'
	import { Modal } from '@skeletonlabs/skeleton-svelte'
	import { Trash } from 'lucide-svelte'
	import { fade } from 'svelte/transition'
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()

	let history = $state(data.history)
	let openState = $state(false)
	let entryToDelete = $state<HistoryEntry | null>(null)

	function deleteEntry(historyEntry: HistoryEntry | null) {
		modalClose()
		if (!historyEntry) return console.error('Unexpected error attempting to delete entry')

		removeFromTableGroupsHistory(data.currentClass.id, historyEntry)
			.then((his) => {
				history = his
			})
			.catch(() => {
				toaster.error({
					title: 'Kunne ikke slette fra historikken',
					description: 'Kontakt udvikleren hvis det fortsætter.',
				})
			})
	}

	const days = {
		0: 'søndag',
		1: 'mandag',
		2: 'tirsdag',
		3: 'onsdag',
		4: 'torsdag',
		5: 'fredag',
		6: 'lørdag',
	}

	function getDate(isodate: string) {
		try {
			const d = new Date(Date.parse(isodate))
			const onejan = new Date(d.getFullYear(), 0, 1)
			const weekNumber = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7)
			// @ts-ignore
			const day = days[d.getDay()]
			if (day == null) throw Error('dag ikke fundet')
			const date = isodate.substring(0, 10)
			const time = isodate.substring(11, 16)
			return `${day} i uge ${weekNumber} kl. ${time} (${date})`
		} catch (err) {
			console.error(err)
			return isodate
		}
	}

	function modalClose() {
		openState = false
		entryToDelete = null
	}

	function modalOpen(h: HistoryEntry) {
		entryToDelete = h
		openState = true
	}
</script>

<!------------------------------------------------------------------------------------------------>

<svelte:head>
	<title>Historik • Bordgrupper • {data.currentClass.name} • Dan grupper</title>
</svelte:head>

<h3 class="mt-6 h3">Historik for bordgrupper</h3>
{#if history.length === 0}
	<p>Der er ingen grupper i historikken endnu.</p>
{:else}
	{#each history as h (h.createdAt)}
		{@const dateString = getDate(h.createdAt)}
		<div out:fade={{ duration: 500 }}>
			<div class="flex items-center gap-2 pt-6">
				<h4 class="h4">Grupper oprettet {dateString}</h4>
				<button class="button" onclick={() => modalOpen(h)}><Trash size={22} /></button>
			</div>
			<DisplayGroups groups={groupsFromIds(h.groups, data.currentClass)} />
		</div>
	{/each}
{/if}

<div style="height: 15vh"></div>

<Modal
	open={openState}
	onOpenChange={(e) => (openState = e.open)}
	contentBase="max-w-screen-sm space-y-4 card bg-surface-100-900 p-4 shadow-xl"
	backdropClasses="backdrop-blur-sm"
>
	{#snippet content()}
		<header class="flex justify-between">
			<h4 class="h4">
				Vil du slette grupperne oprettet
				{entryToDelete ? getDate(entryToDelete.createdAt) : ''} fra historikken?
			</h4>
		</header>
		<article>
			<p class="opacity-60">Tip: Tag evt. en backup, inden du sletter fra historikken 😊</p>
		</article>
		<footer class="flex justify-end gap-4">
			<button type="button" class="btn preset-tonal" onclick={modalClose}>Annullér</button>
			<button type="button" class="btn preset-filled" onclick={() => deleteEntry(entryToDelete)}>Slet hold</button>
		</footer>
	{/snippet}
</Modal>
