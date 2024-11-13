<script lang="ts">
	let {
		student = $bindable(),
		onpaste
	}: {
		student: Student;
		onpaste: (e: ClipboardEvent, id: number) => void;
	} = $props();
</script>

<input
	class="input"
	type="text"
	placeholder="Navn"
	bind:value={student.name}
	onpaste={(e) => onpaste?.(e, student.id)}
/>
