<!-- <script module lang="ts">
	import { get, set } from 'idb-keyval';

	set('hello', 'world')
		.then(() => console.log('It worked!'))
		.catch((err) => console.log('It failed!', err));

	let str = await get('hello');
	console.log(str);
</script> -->

<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { urlNameToClassName } from '$lib/utils';
	import Svelecte from 'svelecte';

	let { data }: { data: PageData } = $props();
</script>

<h1 class="h1">{urlNameToClassName($page.params.holdnavn)} + Hello</h1>
data:
<pre class="pre">{JSON.stringify(data, null, 2)}</pre>

<h2 class="h2">Indstillinger</h2>
<label class="label">
	<span>Input</span>
	<input class="input" type="text" placeholder="Input" />
</label>
<h2 class="h2">Forudbestemte medlemmer</h2>

<div class="card w-64">
	<header class="card-header"><h3 class="h3">Gruppe 1</h3></header>
	<section class="flex flex-col gap-4 p-4">
		<Svelecte
			options={['One', 'Two', 'Three', 'Very, very long name indeed']}
			clearable={true}
			placeholder={''}
		/>
		<Svelecte
			options={['One', 'Two', 'Three', 'Very, very long name indeed']}
			clearable={true}
			placeholder={''}
		/>
		<Svelecte
			options={['One', 'Two', 'Three', 'Very, very long name indeed']}
			clearable={true}
			placeholder={''}
		/>
		<Svelecte
			options={['One', 'Two', 'Three', 'Very, very long name indeed']}
			clearable={true}
			placeholder={''}
		/>
	</section>
</div>
<h2 class="h2">Nye grupper</h2>
<p>Dan grupper-knap</p>
<p>Gruppevisning</p>
<p>Gem grupper-knap</p>
<h2 class="h2">Eksporter gruppe</h2>
