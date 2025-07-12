<script lang="ts">
	import { goto } from '$app/navigation'
	import { downloadJson, exportClassToJson, removeClass } from '$lib/persistence.svelte'
	import { toaster } from '$lib/toaster'
	import { classNameToUrlName } from '$lib/utils'
	import { Modal } from '@skeletonlabs/skeleton-svelte'
	import type { LayoutProps } from './$types'
	import GroupTypeButton from './GroupTypeButton.svelte'

	let { children, data }: LayoutProps = $props()

	let openState = $state(false)
	function closeModal() {
		openState = false
	}
	function openModal() {
		openState = true
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
		closeModal()
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
</script>

<!--========================================================================-->

<!-- Class bar -->
<nav
	class="mb-6 btn-group flex w-full flex-col items-start border-[1px] border-surface-500/20 bg-surface-50 p-2 dark:bg-surface-900"
>
	<div class="grid w-full grid-cols-[1fr_auto] gap-16 whitespace-nowrap">
		<h2 class="ml-4 h2">{data.currentClass.name}</h2>
		<span class="flex items-start gap-4">
			<button type="button" class="btn preset-filled-primary-500" onclick={editClass}> Redigér hold </button>
			<button type="button" class="btn preset-filled-primary-500" onclick={exportClass}> Eksportér hold </button>
			<button type="button" class="btn preset-filled-primary-500" onclick={openModal}> Slet hold </button>
		</span>
	</div>
	<div class="mt-4 flex flex-wrap gap-2">
		<GroupTypeButton {data} name="Bordgrupper" activeGroupType="bordgrupper" />
		<GroupTypeButton {data} name="Manuelle grupper" activeGroupType="manuelle-grupper" />
		<GroupTypeButton {data} name="Tilfældige grupper" activeGroupType="tilfældige-grupper" />
		<!-- <TypeButton {data} name="Homogene grupper" activeGroupType="ikke-oprettet" />
		<TypeButton {data} name="Heterogene grupper" activeGroupType="ikke-oprettet" />
		<TypeButton {data} name="Matrixgrupper" activeGroupType="ikke-oprettet" /> -->
	</div>
</nav>

<Modal
	open={openState}
	onOpenChange={(e) => (openState = e.open)}
	triggerBase="btn preset-filled-primary-500"
	contentBase="max-w-screen-sm space-y-4 card bg-surface-100-900 p-4 shadow-xl"
	backdropClasses="backdrop-blur-sm"
>
	{#snippet content()}
		<header class="flex justify-between">
			<h4 class="h4">Vil du slette holdet "{data.currentClass.name}"?</h4>
		</header>
		<article>
			<p class="opacity-60">Tip: Tag en backup, inden du sletter holdet 😊</p>
		</article>
		<footer class="flex justify-end gap-4">
			<button type="button" class="btn preset-tonal" onclick={closeModal}>Annullér</button>
			<button type="button" class="btn preset-filled" onclick={deleteClass}>Slet hold</button>
		</footer>
	{/snippet}
</Modal>

{@render children()}
