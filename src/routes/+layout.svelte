<script lang="ts">
	import { page } from '$app/state'
	import { setIsMenuExpanded } from '$lib/persistence.svelte'
	import { configureSvelecteGlobalOptions } from '$lib/svelecte-options.svelte'
	import { toaster } from '$lib/toaster'
	import { classNameToUrlName } from '$lib/utils'
	import { Menu, School, UsersRound } from '@lucide/svelte'
	import { Navigation, Toaster } from '@skeletonlabs/skeleton-svelte'
	import '../app.css'
	import type { LayoutProps } from './$types'
	import ExportAndImportButton from './ExportAndImportButton.svelte'
	import LightSwitch from './LightSwitch.svelte'

	let { children, data }: LayoutProps = $props()

	let expanded = $state(data.isMenuExpanded)
	$effect(() => {
		setIsMenuExpanded(expanded)
	})
	function toggleExpanded() {
		expanded = !expanded
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
		<div class="flex items-center gap-4">
			<LightSwitch />
			<span class="h-10 border-r border-surface-200-800"></span>
			<!-- prettier-ignore -->
			<a href="https://github.com/jensjacobt/dangrupper" class="btn" title="Se sidens kode" aria-label="Github"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/> </svg></a>
			<span class="h-10 border-r border-surface-200-800"></span>
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
