<script lang="ts">
    const { groups }: { groups: Student[][]} = $props();
</script>

<div class="flex flex-wrap gap-4">
    {#each groups as _, i}
        <div class="card w-40">
            <header class="card-header pb-2"><h6 class="h6">Gruppe {i + 1}</h6></header>
            <section class="flex flex-col gap-3">
                {#each groups[i] as _, j}
                    <div class="overflow-hidden whitespace-nowrap" style="overflow: hidden; white-space: nowrap">{groups[i][j].name}</div>
                {/each}
            </section>
        </div>
    {/each}
</div>