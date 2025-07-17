<script lang="ts">
	let {
		text,
		temporaryText,
	}: {
		text: string
		temporaryText: string
	} = $props()

	let textSpan: HTMLSpanElement

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
		transitionTextWithTimeout(temporaryText)
		setTimeout(() => transitionTextWithTimeout(text), 1200)
	}
</script>

<!--================================================================================================================-->

<span bind:this={textSpan} class="text visible"> {text} </span>

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
