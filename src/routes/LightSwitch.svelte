<script lang="ts">
	import { Monitor, Moon, Sun } from '@lucide/svelte'
	import { Segment } from '@skeletonlabs/skeleton-svelte'

	let mode = $state(localStorage.colorScheme ?? 'system')

	const mq = window.matchMedia('(prefers-color-scheme: dark)')
	mq.addEventListener('change', () => {
		if (mode !== 'system') return

		document.documentElement.classList.toggle('dark', mode === 'dark' || (mode === 'system' && mq.matches))
	})

	$effect(() => {
		document.documentElement.classList.toggle('dark', mode === 'dark' || (mode === 'system' && mq.matches))
	})

	function onValueChange(e: { value: any }) {
		switch (e.value) {
			case 'system':
				localStorage.removeItem('colorScheme')
				mode = 'system'
				break
			case 'light':
				localStorage.colorScheme = 'light'
				mode = 'light'
				break
			case 'dark':
				localStorage.colorScheme = 'dark'
				mode = 'dark'
				break
		}
	}
</script>

<svelte:head>
	<script>
		document.documentElement.classList.toggle(
			'dark',
			localStorage.colorScheme === 'dark'
				|| (!('mode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches),
		)
	</script>
</svelte:head>

<span title="Skift mellem lyst og mørkt udseende">
	<Segment name="align" value={mode} {onValueChange} padding="p-1">
		<Segment.Item value="system" base="btn cursor-pointer z-[1] px-1.75">
			<Monitor size={18} />
		</Segment.Item>
		<Segment.Item value="light" base="btn cursor-pointer z-[1] px-1.75">
			<Sun size={18} />
		</Segment.Item>
		<Segment.Item value="dark" base="btn cursor-pointer z-[1] px-1.75">
			<Moon size={18} />
		</Segment.Item>
	</Segment>
</span>
