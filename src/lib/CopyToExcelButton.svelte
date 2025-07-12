<script lang="ts">
	import TextFadeTransition from './TextFadeTransition.svelte'

	let {
		groups,
		minSize = undefined,
		addendum = undefined,
		classList = 'btn w-35 preset-filled-primary-500',
	}: {
		groups: Student[][]
		minSize?: number
		addendum?: () => string
		classList?: string
	} = $props()

	let textFade: TextFadeTransition

	function copyTextForExcel() {
		const gs = minSize ?? Math.max(...groups.map((g) => g.length))
		const rows = []
		for (let j = 0; j < gs; j++) {
			const row = []
			for (let i = 0; i < groups.length; i++) {
				row.push(groups.at(i)?.at(j)?.name ?? ' ')
			}
			rows.push(row.join('\t'))
		}
		if (addendum) {
			rows.push(addendum())
		}
		const output = rows.join('\n')
		navigator.clipboard
			.writeText(output)
			.then(() => {
				console.log('succesfully copied text')
				textFade?.transition()
			})
			.catch(() => console.log('not allowed to copy text'))
	}
</script>

<!--========================================================================-->

<button class={classList} onclick={copyTextForExcel}>
	<TextFadeTransition bind:this={textFade} text="Kopiér til Excel" temporaryText="Kopieret ✔︎" />
</button>
