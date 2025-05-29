<script lang="ts">
	import { toaster } from "../../../lib/toaster-svelte";

    const { groups }: { groups: Student[][] } = $props();

	let canvas: HTMLCanvasElement;

    const colors = [
        ['#AAC8EB', '#5E95D8'],
        ['#B3E0F2', '#71C1E6'],
        ['#F9DBCB', '#F2BA9C'],
        ['#B4EFBC', '#74DF7C'],
        ['#BFE9FA', '#84D4F6'],
        ['#EEC1EB', '#DC87D5'],
        ['#D3F1C5', '#A8E390'],
        ['#FFFFB1', '#ECE231']
    ];
    
	$effect(() => {
        const w = 100;
        const h = 28;
        const p = 5;
        const s = 2;
        const fw = w * groups.length + s;
        const fh = h * 5 + s;

		const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const width = fw;
        const height = fh;

        // Scale canvas according to DPR
        const dpr = window.devicePixelRatio;

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        ctx.scale(dpr, dpr);

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // Draw
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, fw, fh);
        ctx.textBaseline = "middle";
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            ctx.font = "16px Tahoma"; ctx.textAlign = 'center'; ctx.fillStyle = 'black';
            ctx.fillText(`Gruppe ${i+1}`, w/2 + w*i, h/2 + 2);
            ctx.fillStyle = colors[i][0];
            ctx.fillRect(w*i, h, w, h*2);
            ctx.fillStyle = colors[i][1];
            ctx.fillRect(w*i, h*3, w, h*2);
            ctx.font = "14px Tahoma"; ctx.textAlign = 'left'; ctx.fillStyle = 'black';
            ctx.fillRect(w*i, 0, 2, fh);
            for (let j = 0; j < group.length; j++) {
                const name = group[j].name;
                ctx.fillText(name, p + w*i, h/2 + 2 + h*(j + 1), w - p*2);
            }
        }
        ctx.fillStyle = 'black';
        ctx.fillRect(fw - s, 0, s, fh);
        ctx.fillRect(0, 0, fw, s);
        ctx.fillRect(0, h, fw, s);
        ctx.fillRect(0, h*3, fw, s);
        ctx.fillRect(0, fh - s, fw, s);
	});

    function copyCanvasToClipboard() {
        canvas.toBlob(function(blob) { 
            if (blob) {
                const item = new ClipboardItem({ "image/png": blob });
                navigator.clipboard.write([item]); 
            } else {
                toaster.error({
                    title: 'Billede ikke kopieret', 
                    description: 'Hvis fejlen fortsætter, så kontakt udvikleren.'
                });
            }
        });
    }

    function copyTextForExcel() {
        const gs = 4;
        const rows = [];
        for (let j = 0; j < gs; j++) {
            const row = [];
            for (let i = 0; i < groups.length; i++) {
                row.push(groups.at(i)?.at(j)?.name ?? " ");
            }
            rows.push(row.join('\t'));
        }
        const output = rows.join('\n');
        console.log(output);
        navigator.clipboard.writeText(output)
            .then(()=>console.log('succesfully copied text'))
            .catch(()=>console.log('not allowed to copy text'));
    }
</script>

<canvas bind:this={canvas}>
Din browser understøtter ikke canvas i HTML. Prøv en anden browser.
</canvas>

<button class="btn mr-2 preset-filled-primary-500" onclick={copyCanvasToClipboard}> Kopier billede </button>
<button class="btn preset-outlined-primary-500" onclick={copyTextForExcel}> Kopier til Excel </button>
