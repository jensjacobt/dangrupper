<script lang="ts">
	let {
		text,
		temporaryText,
	}: {
		text: string
		temporaryText: string
	} = $props()

	let textSpan: HTMLSpanElement

	const checkMark =
		'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon lucide lucide-check"><path d="M20 6 9 17l-5-5"></path></svg>'

	function transitionTextWithTimeout(newText: string) {
		textSpan.classList.remove('visible')
		setTimeout(() => {
			requestAnimationFrame(() => {
				textSpan.innerHTML = newText
				textSpan.classList.add('visible')
			})
		}, 225)
	}

	export const transition = () => {
		transitionTextWithTimeout(temporaryText + checkMark)
		setTimeout(() => transitionTextWithTimeout(text), 1200)
	}
</script>

<!--================================================================================================================-->

<span bind:this={textSpan} class="text visible flex items-center gap-2"> {text} </span>

<!--================================================================================================================-->

<style>
	.text {
		opacity: 0;
		transition: opacity 225ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.visible {
		opacity: 1;
		transition: opacity 300ms cubic-bezier(0.55, 0.085, 0.68, 0.53);
	}
</style>
