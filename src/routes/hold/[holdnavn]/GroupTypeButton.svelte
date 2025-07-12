<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { setActiveGroupType } from '$lib/persistence.svelte'
	import { toaster } from '$lib/toaster'
	import { classNameToUrlName } from '$lib/utils'
	import type { LayoutData } from './$types'

	const { data, name, activeGroupType }: { data: LayoutData; name: string; activeGroupType: ActiveGroupType } = $props()

	function onclick() {
		setActiveGroupType(data.currentClass.id, activeGroupType)
			.then(() => {
				const classUrlName = classNameToUrlName(data.currentClass.name)
				goto(`/hold/${classUrlName}/${activeGroupType}/`)
			})
			.catch((error) => {
				console.error(error)
				toaster.error({
					title: 'Kunne ikke opdatere den aktive gruppetype',
					description: 'Kontakt udvikleren, hvis det fortsætter.',
				})
			})
	}
</script>

{#if page.route.id?.startsWith(`/hold/[holdnavn]/${activeGroupType}`)}
	<button type="button" class="rounded-base preset-filled px-4 py-1" {onclick}> {name} </button>
{:else}
	<button type="button" class="rounded-base px-4 py-1 hover:bg-white dark:hover:bg-surface-950" {onclick}>
		{name}
	</button>
{/if}
