<script lang="ts">
	import DisplayGroups from "$lib/DisplayGroups.svelte";
	import { groupsFromIds } from "$lib/utils";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();

	const days = {
		0: "søndag",
		1: "mandag",
		2: "tirsdag",
		3: "onsdag",
		4: "torsdag",
		5: "fredag",
		6: "lørdag",
	}

	function getDate(isodate: string) {
		try {
			const d = new Date(Date.parse(isodate));
			const onejan = new Date(d.getFullYear(), 0, 1);
			const weekNumber = Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
			// @ts-ignore
			const day = days[d.getDay()];
			if (day == null) throw Error("dag ikke fundet");
			const date = isodate.substring(0, 10);
			const time = isodate.substring(11, 16);
    		return `${day} i uge ${weekNumber} kl. ${time} (${date})`;
		} catch (err) {
			console.error(err);
			return isodate;
		}
	}
</script>

<!------------------------------------------------------------------------------------------------>

<svelte:head>
	<title>Historik for bordgrupper • {data.currentClass.name} • Dan grupper</title>
</svelte:head>

<h3 class="h3 mt-6">Historik for bordgrupper</h3>
{#if data.history.length === 0}
	<p>Der er ingen grupper i historikken endnu.</p>
{:else}
	{#each data.history as h}
		<h4 class="h4 pt-6">Grupper oprettet {getDate(h.createdAt)}</h4>
		<DisplayGroups groups={groupsFromIds(h.groups, data.currentClass)} />
	{/each}
{/if}

<div style="height: 15vh"></div>
