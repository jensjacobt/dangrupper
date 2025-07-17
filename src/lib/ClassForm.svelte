<script lang="ts">
	import { tick, type Snippet } from 'svelte'
	import { validateClassName, validateStudents, validity } from './validation.svelte'

	let {
		className = $bindable(),
		students = $bindable(),
		id = $bindable(),
		onsubmit,
		children,
	}: {
		className: string
		students: Student[]
		id: idNumber
		onsubmit: (e: Event) => void
		children?: Snippet<[]>
	} = $props()

	$effect.pre(() => {
		const finalName = students[students.length - 1]?.name
		if (finalName !== '') {
			students.push(newStudent(''))
		}
	})

	function newStudent(name: string) {
		return { id: id++, name: name }
	}

	function onpaste(e: ClipboardEvent) {
		e.preventDefault()
		const pastedText = e.clipboardData?.getData('text')
		if (pastedText) {
			const names = pastedText.split(/\r?\n/).map((n) => n.trim())
			const newStudents = students.concat(names.map(newStudent))
			students = newStudents.filter((s) => s.name != '')
			tick().then(() => {
				window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
			})
		}
	}

	function onkeyup(e: KeyboardEvent) {
		if (e.key == 'Enter' || e.key == 'ArrowDown') {
			e.preventDefault()
			focusNextElement()
		}
		if (e.key == 'ArrowUp') {
			e.preventDefault()
			focusPreviousElement()
		}
	}

	function focusNextElement() {
		focusRelativeElement(1)
	}

	function focusPreviousElement() {
		focusRelativeElement(-1)
	}

	function focusRelativeElement(offset: number) {
		const focussableElements = 'input[type=text]:not([disabled])'
		// @ts-expect-error
		if (document.activeElement && document.activeElement.tagName == 'INPUT' && document.activeElement.form) {
			const focussable = Array.prototype.filter.call(
				// @ts-expect-error
				document.activeElement.form.querySelectorAll(focussableElements),
				function (element) {
					return (
						//check for visibility while always include the current activeElement
						element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement
					)
				},
			)
			const index = focussable.indexOf(document.activeElement)
			if (index > -1) {
				focussable[index + offset]?.focus()
			}
		}
	}

	const common = { class: 'input', type: 'text', onkeyup: onkeyup, spellcheck: false }
</script>

<!--================================================================================================================-->

<form id="form" class="space-y-4" {onsubmit}>
	<h4 class="h4">Holdnavn</h4>
	<input
		id="holdnavn"
		placeholder="Holdnavn"
		bind:value={className}
		use:validity={validateClassName}
		autocomplete="off"
		{...common}
	/>

	<h4 class="h4">Elever</h4>
	{#each students as s, i (s.id)}
		<div class="flex items-center gap-2">
			<span class="btn w-12 preset-tonal hover:preset-tonal">{i + 1}.</span>
			<input
				id={`name-${s.id}`}
				placeholder="Navn"
				bind:value={s.name}
				{onpaste}
				use:validity={() => validateStudents(students)}
				autocomplete="off"
				{...common}
			/>
		</div>
	{/each}
	<!-- Disable enter to submit -->
	<button type="submit" disabled style="display: none" aria-hidden="true"></button>
	<button type="submit" class="btn preset-filled-primary-500">Gem hold</button>
	{@render children?.()}
</form>
