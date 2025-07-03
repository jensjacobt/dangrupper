<script lang="ts">
	import { validateClassName, validity } from './validation.svelte';

	type Props = {
		className: string;
		students: Student[];
		id: idNumber;
		onsubmit: (e: Event) => void;
	};

	let { className = $bindable(), students = $bindable(), id, onsubmit }: Props = $props();

	$effect.pre(() => {
		const finalName = students[students.length - 1]?.name;
		if (finalName !== '') {
			students.push(newStudent(''));
		}
	});

	function newStudent(name: string) {
		return { id: id++, name: name };
	}

	function onpaste(e: ClipboardEvent) {
		e.preventDefault();
		const pastedText = e.clipboardData?.getData('text');
		if (pastedText) {
			const names = pastedText.split(/\r?\n/).map((n) => n.trim());
			const newStudents = students.concat(names.map(newStudent));
			students = newStudents.filter((s) => s.name != '');
		}
	}

	function onkeyup(e: KeyboardEvent) {
		if (e.key == 'Enter' || e.key == 'ArrowDown') {
			e.preventDefault();
			focusNextElement();
		}
		if (e.key == 'ArrowUp') {
			e.preventDefault();
			focusPreviousElement();
		}
	}

	function focusNextElement() {
		focusRelativeElement(1);
	}

	function focusPreviousElement() {
		focusRelativeElement(-1);
	}

	function focusRelativeElement(offset: number) {
		const focussableElements = 'input[type=text]:not([disabled])';
		// @ts-expect-error
		if (document.activeElement && document.activeElement.tagName == 'INPUT' && document.activeElement.form) { 
			const focussable = Array.prototype.filter.call(
				// @ts-expect-error
				document.activeElement.form.querySelectorAll(focussableElements),
				function (element) {
					return ( //check for visibility while always include the current activeElement
						element.offsetWidth > 0 ||
						element.offsetHeight > 0 ||
						element === document.activeElement
					);
				}
			);
			const index = focussable.indexOf(document.activeElement);
			if (index > -1) {
				focussable[index + offset]?.focus();
			}
		}
	}
</script>

<form id="form" class="space-y-4" {onsubmit}>
	<h4 class="h4">Holdnavn</h4>
	<input
		class="input"
		type="text"
		placeholder="Holdnavn"
		bind:value={className}
		use:validity={validateClassName}
		onkeyup={onkeyup}
		autocomplete="off"
		spellcheck="false"
	/>

	<h4 class="h4">Elever</h4>
	Tomme felter ignoreres og rækkefølgen er ligegyldig. Tilføj hurtigt flere elevnavne ved at indsætte
	kopieret tekst med et navn pr. linje. Indsæt med ctrl+v eller command+v.
	{#each students as student, i (student.id)}
		<div class="flex items-center gap-2">
			<span class="badge-icon">{(i+1) + '.'}</span>
			<input
				class="input"
				type="text"
				placeholder="Navn"
				bind:value={student.name}
				onpaste={onpaste}
				onkeyup={onkeyup}
				autocomplete="off"
				spellcheck="false"
			/>
		</div>
	{/each}
	<!-- Disable enter to submit -->
	<button type="submit" disabled style="display: none" aria-hidden="true"></button>
	<button type="submit" class="btn preset-filled-primary-500">Gem hold</button>
</form>
