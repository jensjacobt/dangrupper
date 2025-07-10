<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { downloadJson, exportClassToJson, removeClass, setActiveGroupType } from '$lib/persistence.svelte'
	import { toaster } from '$lib/toaster'
	import { classNameToUrlName } from '$lib/utils'
	import { Modal } from '@skeletonlabs/skeleton-svelte'
	import type { LayoutProps } from './$types'

	let { children, data }: LayoutProps = $props()

	let openState = $state(false)

	function modalClose() {
		openState = false
	}

	function editClass() {
		const classUrlName = classNameToUrlName(data.currentClass.name)
		goto(`/hold/${classUrlName}/rediger/`)
	}

	function exportClass() {
		const filename = `dangrupper-export-${data.currentClass.name}-${new Date().toLocaleString()}.json`
		const json = exportClassToJson(data.currentClass.id)
		downloadJson(filename, json)
	}

	function deleteClass() {
		modalClose()
		console.log('Deleting class', data.currentClass.name)
		removeClass(data.currentClass)
			.then(() => {
				goto('/', { invalidateAll: true })
				toaster.success({
					description: `Slettede holdet ${data.currentClass.name}.`,
				})
			})
			.catch((error) => {
				console.error(error)
				toaster.error({
					title: 'Kunne ikke slette hold',
					description: `(Fejlbesked: ${error.message})`,
				})
			})
	}

	function go(activeGroupType: ActiveGroupType) {
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

	function getTabClass(agt: ActiveGroupType) {
		if (page.route.id?.startsWith(`/hold/[holdnavn]/${agt}`)) {
			return 'btn preset-filled'
		}
		return 'btn hover:preset-filled-surface-50-950'
	}
</script>

<!-- Class bar -->
<nav class="mb-6 btn-group flex w-full flex-col items-start bg-surface-50-950 p-2">
	<div class="grid w-full grid-cols-[1fr_auto] gap-16 whitespace-nowrap">
		<h2 class="h2">{data.currentClass.name}</h2>
		<span class="flex items-start gap-4">
			<button type="button" class="btn preset-filled-primary-500" onclick={editClass}> Redigér hold </button>
			<button type="button" class="btn preset-filled-primary-500" onclick={exportClass}> Eksportér hold </button>
			<Modal
				open={openState}
				onOpenChange={(e) => (openState = e.open)}
				triggerBase="btn preset-filled-primary-500"
				contentBase="max-w-screen-sm space-y-4 card bg-surface-100-900 p-4 shadow-xl"
				backdropClasses="backdrop-blur-sm"
			>
				{#snippet trigger()}Slet hold{/snippet}
				{#snippet content()}
					<header class="flex justify-between">
						<h4 class="h4">Vil du slette holdet "{data.currentClass.name}"?</h4>
					</header>
					<article>
						<p class="opacity-60">Tip: Tag en backup, inden du sletter holdet 😊</p>
					</article>
					<footer class="flex justify-end gap-4">
						<button type="button" class="btn preset-tonal" onclick={modalClose}>Annullér</button>
						<button type="button" class="btn preset-filled" onclick={deleteClass}>Slet hold</button>
					</footer>
				{/snippet}
			</Modal>
		</span>
	</div>
	<div class="mt-4 flex flex-wrap gap-2">
		<button type="button" class={getTabClass('bordgrupper')} onclick={() => go('bordgrupper')}>Bordgrupper</button>
		<button type="button" class={getTabClass('tilfældige-grupper')} onclick={() => go('tilfældige-grupper')}
			>Tilfældige grupper</button
		>

		<!-- <button type="button" class="btn hover:preset-filled-surface-50-950">Homogene grupper</button>
		<button type="button" class="btn hover:preset-filled-surface-50-950">Heterogene grupper</button>
		<button type="button" class="btn hover:preset-filled-surface-50-950">Matrixgrupper</button> -->
	</div>
</nav>

{@render children()}
