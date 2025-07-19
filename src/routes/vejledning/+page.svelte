<script>
	import { resetDemoClass } from '$lib/persistence.svelte'
	import { Download, Upload } from '@lucide/svelte'
</script>

<!--================================================================================================================-->

<svelte:head>
	<title>Vejledning • Dan grupper</title>
</svelte:head>

<div class="mx-auto max-w-180 space-y-4">
	<h2 class="h2">Vejledning</h2>
	<p>
		Du finder vejledninger til forskellige sider øverst på den enkelte side – hvor der fås mere udførlig vejledning ved
		at klikke på 'Udfold vejledning'. Nedenfor er samlet det, som handler om hold og backup.
	</p>
	<p>
		Er denne app ny for dig? Så opret et demohold, og brug det til at lege med at danne de forskellige gruppetyper.
		Demoholdet oprettes vha. knappen nedenfor (og det overskrives hvis det allerede findes).
		<br />
		<mark class="mark">OBS:</mark> Undgå at bruge demoholdet med dine egne elever. Tilføj et nyt hold i stedet.
	</p>
	<button class="btn preset-filled-primary-500" onclick={resetDemoClass}>Opret demohold</button>
	<p>
		Det er værd at læse om data og backup, inden du opretter hold – og særligt inden du danner bordgrupper, da der
		gemmes en historik, som bruges når de næste bordgrupper dannes. Resten kan læses, hvis du får spørgsmål.
	</p>

	<h3 class="h3">Hvor gemmes data?</h3>
	<p>
		Hold, grupper og sideindstillinger gemmes automatisk i din browser. Derfor skal du åbne siden på den samme computer
		og i den samme browser for at se det automatisk gemte. Du kan vha. backup selv gemme data og eventuelt overføre det
		til andre computere eller browsere.
	</p>

	<h3 class="h3">Backup</h3>
	<p>
		De nuværende hold og grupper gemmes generelt i browseren. Det gælder særligt bordgrupper og deres historik.
		Browseren kan dog slette dem fra sit lager, hvis der fx er pladsmangel på computeren. Derfor anbefales det, at du
		gemmer en backup-fil, hver gang du netop har oprettet et hold eller netop har gemt bordgrupper.
	</p>
	<h4 class="h4">Opret backup</h4>
	<p>
		Du opretter en backup af alt fra denne app ved at klikke på ikonet <Download class="inline" size={20} />, der findes
		øverst til højre på enhver side. Det downloader en backup-fil med dato og tidspunkt i filnavnet.
	</p>
	<p>
		Hvis du deler et hold med en anden lærer og fx gerne vil overføre hold og historik til dem, så kan du tage en backup
		af kun et enkelt hold. Det gør du vha. knappen 'Eksportér hold' øverst til højre på holdets side. Send så filen til
		din kollega, der kan importere fra din backup.
	</p>
	<h4 class="h4">Importér hold og grupper fra backup</h4>
	<p>
		Du importerer fra en backup-fil (med alt eller et enkelt hold) vha. ikonet <Upload class="inline" size={20} />, der
		findes øverst til højre på enhver side. Vælg backup-filen og følg den vejledning, der kommer frem. For de hold, der
		importeres, bliver både holdet, dets grupper og dets bordgruppe-historik importeret.
	</p>

	<h3 class="h3">Hold</h3>
	<p>For at komme i gang med at danne grupper skal du først oprette et hold.</p>
	<h4 class="h4">Tilføj hold</h4>
	<p>
		Klik på 'Tilføj hold' i menuen øverst på siden og følg vejledningen. Når holdet er oprettet, finder du det i menuen
		til venstre på enhver side. Vælg derefter den gruppetype du vil danne lige under holdets navn inde på siden.
	</p>
	<h4 class="h4">Redigér hold</h4>
	<p>Du kan redigere holdet ved at gå ind på holdet og klikke på knappen 'Redigér hold' øverst til højre på siden.</p>
	<h4 class="h4">Slet hold</h4>
	<p>
		Du kan slette et hold ved at gå ind på holdet og klikke på knappen 'Slet hold' øverst til højre på siden. App'en har
		generelt ingen fortryd-knapper, og derfor er der nogle 'Er du sikker?'-vinduer rundt omkring.
	</p>
</div>

<div style="height: 60vh;"></div>
