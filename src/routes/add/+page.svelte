<script lang="ts">
	import StudentRow from '$lib/StudentRow.svelte';

	let id = 0;
	let holdnavn = $state('');
	const students: Student[] = $state([{ id: id++, name: '' }]);

	function addStudent(name: string) {
		students.push({ id: id++, name: name });
	}

	// TODO: Få paste til at virke i Firefox og Safari
	function onpaste(e: ClipboardEvent, id: number) {
		e.preventDefault();
		const data = e.clipboardData?.items[0];
		if (data?.kind == 'string' && data.type == 'text/plain') {
			data.getAsString((pastedText) => {
				for (const student of students) {
					if (student.id == id) {
						student.name = '';
					}
				}
				const names = pastedText.split(/\r?\n/);
				for (const name of names) {
					addStudent(name);
				}
			});
		}
	}

	$effect(() => {
		const finalName = students[students.length - 1].name;
		if (finalName !== '') {
			addStudent('');
		}
	});
	$inspect(students);
</script>

<h1 class="h1">Tilføj hold</h1>

<h2 class="h2">Holdnavn</h2>
<input class="input" type="text" placeholder="Holdnavn" bind:value={holdnavn} />

<h2 class="h2">Elever</h2>
Tomme felter ignoreres. Tilføj hurtigt flere elever ved at indsætte fra udklipsholderen (ctrl+v) – den
kopierede tekst skal have et navn pr. linje.
{#each students as student, index (student.id)}
	<StudentRow bind:student={students[index]} {onpaste} />
{/each}

<!-- TODO: Tilføj knap til at tilføje hold -->
