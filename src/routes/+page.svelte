<script>
	import { resetDemoClass } from '$lib/persistence.svelte'
	import { ChevronRight, Download, Grid2x2, Hand, Save, School, Shuffle } from '@lucide/svelte'
</script>

<!--================================================================================================================-->

<svelte:head>
	<title>Dan grupper</title>
</svelte:head>

<div class="mx-auto w-200 space-y-4">
	<div class="flex pt-10 pb-15">
		<div class="w-50">
			<span
				class="mt-4 mr-10 flex h-40 w-40 items-center justify-center rounded-full bg-surface-950-50 text-surface-50-950"
			>
				<School size={110} class="mb-3" />
			</span>
		</div>
		<div class="w-auto space-y-4">
			<h2 class="h2">Dan grupper – hurtigt, nemt og med kontrol</h2>
			<p>
				Du opretter et hold og kan så danne bordgrupper, tilfældige grupper og manuelle grupper. Se mere nedenfor. Skal
				du lige prøve det? Så opret et demohold og leg løs – klik på knappen og demoholdet vises i menuen til venstre.
				Tilføj dit eget hold, når du er klar.
			</p>
			<div class="flex gap-4">
				<button class="btn preset-filled-primary-500" onclick={resetDemoClass}>Opret demohold <ChevronRight /></button>
				<a href="/tilføj-hold/" class="btn preset-filled-primary-500">Tilføj dit eget hold</a>
				<a href="/vejledning/" class="btn preset-outlined-primary-500">Læs vejledning</a>
			</div>
		</div>
	</div>

	<div class="flex max-w-200 basis-90 flex-wrap gap-4">
		<div class="w-98 grow card preset-outlined-tertiary-200-800 bg-tertiary-50-950 p-8">
			<header><Save size={24} /></header>
			<article>
				<h4 class="h4">Gem dine hold</h4>
				<p class="opacity-70">
					Du gemmer dine hold i din browser, så de er klar næste gang, du danner grupper. Alt gemmes lokalt i din
					browser – ikke på sidens server.
				</p>
			</article>
		</div>
		<div class="w-98 grow card preset-outlined-tertiary-200-800 bg-tertiary-50-950 p-8">
			<header><Grid2x2 size={24} /></header>
			<article>
				<h4 class="h4">Dan bordgrupper</h4>
				<p class="opacity-70">
					Dan automatisk bordgrupper uden for mange gengangere. Vælg eventuelt (få) forudbestemte medlemmer for større
					kontrol.
				</p>
			</article>
		</div>
		<div class="w-98 grow card preset-outlined-tertiary-200-800 bg-tertiary-50-950 p-8">
			<header><Shuffle size={24} /></header>
			<article>
				<h4 class="h4">Dan tilfældige grupper</h4>
				<p class="opacity-70">
					Dan automatisk tilfældige grupper. Angiv eventuelt fraværende elever, som ikke skal med i grupperne.
				</p>
			</article>
		</div>
		<div class="w-98 grow card preset-outlined-tertiary-200-800 bg-tertiary-50-950 p-8">
			<header><Hand size={24} /></header>
			<article>
				<h4 class="h4">Dan manuelle grupper</h4>
				<p class="opacity-70">
					Dan hurtigt manuelle grupper – uden at bekymre dig om navne går igen, eller om der mangler et navn.
				</p>
			</article>
		</div>
		<div class="w-98 grow card preset-outlined-warning-200-800 bg-warning-50-950 p-8">
			<header><Download size={24} /></header>
			<article>
				<h4 class="h4">Tag backup</h4>
				<p class="opacity-70">
					Din browser kan desværre vælge at slette det gemte fra sit lager. Tag derfor backup efter du har oprettet et
					hold eller gemt bordgrupper. Backup'en downloades som en fil med dato og tidspunkt i filnavnet.
				</p>
			</article>
		</div>
	</div>
</div>

<div style="height: 60vh;"></div>
