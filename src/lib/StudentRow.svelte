<script lang="ts">
	let {
		itemNumber,
		student = $bindable(),
		onpaste
	}: {
		itemNumber: number;
		student: Student;
		onpaste: (e: ClipboardEvent) => void;
	} = $props();
</script>

<div class="flex items-center gap-4">
	<span class="badge-icon">{itemNumber + '.'}</span>
	<input
		class="input"
		type="text"
		placeholder="Navn"
		bind:value={student.name}
		onpaste={(e) => onpaste?.(e)}
		autocomplete="off"
		spellcheck="false"
	/>
</div>
