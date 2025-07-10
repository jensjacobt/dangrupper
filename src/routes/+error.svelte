<script lang="ts">
	import { page } from '$app/state'
</script>

<h3 class="h3">{page.status}: {page.error?.message}</h3>
