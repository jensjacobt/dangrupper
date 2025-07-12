<script lang="ts">
	import CopyToExcelButton from '$lib/CopyToExcelButton.svelte'
	import TextFadeTransition from '$lib/TextFadeTransition.svelte'
	import { toaster } from '$lib/toaster'

	const { groups }: { groups: Student[][] } = $props()

	let canvas: HTMLCanvasElement
	let textFade: TextFadeTransition

	const colors = [
		['#AAC8EB', '#5E95D8'],
		['#B3E0F2', '#71C1E6'],
		['#F9DBCB', '#F2BA9C'],
		['#B4EFBC', '#74DF7C'],
		['#BFE9FA', '#84D4F6'],
		['#EEC1EB', '#DC87D5'],
		['#D3F1C5', '#A8E390'],
		['#FFFFB1', '#ECE231'],
	]

	$effect(() => {
		const w = 100
		const h = 28
		const p = 5
		const s = 2
		const fw = w * groups.length + s
		const fh = h * 5 + s

		const ctx = canvas.getContext('2d', { alpha: false })
		if (!ctx) return

		const width = fw
		const height = fh

		// Scale canvas according to DPR
		const dpr = window.devicePixelRatio

		canvas.width = width * dpr
		canvas.height = height * dpr

		ctx.scale(dpr, dpr)

		canvas.style.width = `${width}px`
		canvas.style.height = `${height}px`

		// Draw
		ctx.fillStyle = 'white'
		ctx.fillRect(0, 0, fw, fh)
		ctx.textBaseline = 'middle'
		for (let i = 0; i < groups.length; i++) {
			const group = groups[i]
			ctx.font = '16px Tahoma'
			ctx.textAlign = 'center'
			ctx.fillStyle = 'black'
			ctx.fillText(`Gruppe ${i + 1}`, w / 2 + w * i, h / 2 + 2)
			ctx.fillStyle = colors[i][0]
			ctx.fillRect(w * i, h, w, h * 2)
			ctx.fillStyle = colors[i][1]
			ctx.fillRect(w * i, h * 3, w, h * 2)
			ctx.font = '14px Tahoma'
			ctx.textAlign = 'left'
			ctx.fillStyle = 'black'
			ctx.fillRect(w * i, 0, 2, fh)
			for (let j = 0; j < group.length; j++) {
				const name = group[j].name
				ctx.fillText(name, p + w * i, h / 2 + 2 + h * (j + 1), w - p * 2)
			}
		}
		ctx.fillStyle = 'black'
		ctx.fillRect(fw - s, 0, s, fh)
		ctx.fillRect(0, 0, fw, s)
		ctx.fillRect(0, h, fw, s)
		ctx.fillRect(0, h * 3, fw, s)
		ctx.fillRect(0, fh - s, fw, s)
	})

	function copyCanvasToClipboard() {
		const getImagePromise = async () => {
			const url = canvas.toDataURL()
			const response = await fetch(url)
			return await response.blob()
		}

		navigator.clipboard
			.write([new ClipboardItem({ 'image/png': getImagePromise() })])
			.then(function () {
				console.log('copied image to clipboard')
				textFade?.transition()
			})
			.catch(function (error) {
				console.error(error)
				toaster.error({
					title: 'Billede ikke kopieret',
					description: 'Hvis fejlen fortsætter, så kontakt udvikleren.',
				})
			})
	}
</script>

<canvas bind:this={canvas} class="mb-4"> Din browser understøtter ikke canvas i HTML. Prøv en anden browser. </canvas>

<button id="copy-image-button" class="mr-2 btn w-35 preset-filled-primary-500" onclick={copyCanvasToClipboard}>
	<TextFadeTransition bind:this={textFade} text="Kopiér billede" temporaryText="Kopieret ✔︎" />
</button>
<CopyToExcelButton minSize={4} {groups} classList={'btn w-35 preset-outlined-primary-500'} />
