<script lang="ts">
	import { page } from '$app/state'
	import { setIsMenuExpanded } from '$lib/persistence.svelte'
	import { configureSvelecteGlobalOptions } from '$lib/svelecte-options.svelte'
	import { toaster } from '$lib/toaster'
	import { classNameToUrlName } from '$lib/utils'
	import { Menu, School, Sun, UsersRound } from '@lucide/svelte'
	import { Navigation, Toaster } from '@skeletonlabs/skeleton-svelte'
	import '../app.css'
	import type { LayoutProps } from './$types'
	import ExportAndImportButton from './ExportAndImportButton.svelte'

	let { children, data }: LayoutProps = $props()

	let expanded = $state(data.isMenuExpanded)
	$effect(() => {
		setIsMenuExpanded(expanded)
	})
	function toggleExpanded() {
		expanded = !expanded
	}

	function pushSwitch() {
		document.documentElement.classList.toggle('dark')
	}

	if (data.classes.length > 0 && navigator.storage && navigator.storage.persist) {
		navigator.storage.persist().then((persistent) => {
			if (persistent) {
				console.log('Storage will not be cleared except by explicit user action.')
			} else {
				console.log('Storage may be cleared by the browser under storage pressure.')
			}
		})
	}

	configureSvelecteGlobalOptions()
</script>

<!--================================================================================================================-->

<div class="grid h-screen grid-rows-[auto_1fr]">
	<!-- Header -->
	<header
		class="grid w-full grid-cols-[1fr_auto] grid-rows-1 items-center border-b-[1px] border-surface-500/20 bg-surface-50 py-3 ps-6.25 pe-4 dark:bg-surface-900"
	>
		<span class="inline-flex items-center">
			<a
				href="/"
				title="Dan grupper"
				class="mr-10 flex h-11 w-11 items-center justify-center rounded-full bg-surface-950-50 text-surface-50-950"
			>
				<School size={28} class="mb-1" />
			</a>
			<a href="/vejledning/" class="btn text-lg hover:preset-tonal">Vejledning</a>
			<a href="/tilføj-hold/" class="btn text-lg hover:preset-tonal">Tilføj hold</a>
		</span>
		<div class="flex flex-row gap-4">
			<button
				id="lightswitch"
				onclick={pushSwitch}
				class="btn aspect-square hover:preset-tonal"
				title="Skift mellem lyst og mørkt udseende"
			>
				<Sun size={28} />
			</button>
			<ExportAndImportButton />
		</div>
	</header>
	<!-- Grid Columns -->
	<div class="grid grid-cols-[auto_1fr]">
		<!-- Left Sidebar -->
		<Navigation.Rail {expanded} base="border-r-[1px] border-surface-500/20 bg-surface-50 dark:bg-surface-900">
			{#snippet header()}
				{@const common = { active: 'preset-filled', hover: 'hover:bg-white dark:hover:bg-surface-950' }}
				<Navigation.Tile labelExpanded="Holdmenu" onclick={toggleExpanded} title="Slå bred menu til/fra" {...common}>
					<Menu size={28} />
				</Navigation.Tile>
				{#each data.classes.map((c) => c.name).toSorted((a, b) => a.localeCompare(b)) as className}
					{@const url = `/hold/${classNameToUrlName(className)}/`}
					<Navigation.Tile
						selected={page.url.pathname.startsWith(url)}
						href={url}
						label={className}
						labelExpanded={className}
						{...common}
					>
						<UsersRound size={28} />
					</Navigation.Tile>
				{/each}
			{/snippet}
		</Navigation.Rail>
		<!-- Main Content -->
		<main class="space-y-4 p-6">
			{@render children()}
		</main>
	</div>
</div>

<Toaster {toaster}></Toaster>
