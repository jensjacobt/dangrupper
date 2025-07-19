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
		<div class="flex items-center gap-2">
			<LightSwitch />
			<span class="h-10 border-r border-surface-200-800"></span>
			<!-- prettier-ignore -->
			<a href="https://github.com/jensjacobt/dangrupper" class="btn" title="Se sidens kode" aria-label="Github repo"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="28" height="28" viewBox="0 0 30 30">
    <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"></path>
</svg></a>
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
