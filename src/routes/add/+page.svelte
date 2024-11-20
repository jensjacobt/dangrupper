<script lang="ts">
	import { getContext } from 'svelte';
	import { type ToastContext } from '@skeletonlabs/skeleton-svelte';
	import StudentRow from '$lib/StudentRow.svelte';
	import { validity } from '$lib/actions.svelte';
	import { validateClassName } from '$lib/validation.svelte';
	import { addClass } from '$lib/persistence.svelte';
	import { goto } from '$app/navigation';
	import { classNameUrlName } from '$lib/utils';

	export const toast: ToastContext = getContext('toast');

	let id = 0;
	let className = $state('');
	let students: Student[] = $state([]);

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

	function addClassAndGoToClass(e: Event) {
		e.preventDefault();
		const name = $state.snapshot(className);
		const studs = $state.snapshot(students).toSorted((a, b) => a.name.localeCompare(b.name));
		addClass(name, studs)
			.then(() => {
				goto(`/hold/${classNameUrlName(name)}`, { invalidateAll: true });
				return;
			})
			.catch((error) => {
				toast.create({
					title: 'Fejl',
					description: error.message,
					type: 'error'
				});
			});
	}
</script>

<h2 class="h2">Tilføj hold</h2>
<form id="form" class="space-y-4" onsubmit={addClassAndGoToClass}>
	<h4 class="h4">Holdnavn</h4>
	<input
		class="input"
		placeholder="Holdnavn"
		bind:value={className}
		use:validity={validateClassName}
		autocomplete="off"
		spellcheck="false"
	/>

	<h4 class="h4">Elever</h4>
	Tomme felter ignoreres og rækkefølgen er ligegyldig. Tilføj hurtigt flere elevnavne ved at indsætte
	kopieret tekst med et navn pr. linje. Indsæt med ctrl+v eller command+v.
	{#each students as student, i (student.id)}
		<StudentRow itemNumber={i + 1} bind:student={students[i]} {onpaste} />
	{/each}
	<!-- Disable enter to submit -->
	<button type="submit" disabled style="display: none" aria-hidden="true"></button>
	<button type="submit" class="btn preset-filled-primary-500">Gem hold</button>
</form>
