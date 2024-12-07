<script lang="ts">
  import fetchData from '$lib/fetch-data';
  import { createQuery } from '@tanstack/svelte-query';

  const granularityScale = [3, 5, 10];

  // todo: migrate to runes once supported in tanstack query: https://github.com/TanStack/query/discussions/7413
  const populationQuery = createQuery({
    queryKey: ['nation-population'],
    select: (response) => {
      // workaround until zod schemas and validation is set up
      if (
        response !== null &&
        typeof response == 'object' &&
        !Array.isArray(response) &&
        'data' in response &&
        Array.isArray(response.data)
      ) {
        return response.data as Record<string, string | number>[];
      }
      return [];
    },
    queryFn: async () =>
      await fetchData('https://datausa.io/api/data?drilldowns=Nation&measures=Population'),
  });
  let granularity = $state(3);
  let populationEntries = $derived.by(() => {
    if ($populationQuery.data) {
      // todo filter stuff
      return $populationQuery.data;
    }
    return [];
  });
</script>

<article>
  <h2>PopulationQuery</h2>

  <div>
    <label for="granularity">Granularity</label>
    <input
      type="range"
      name="granularity"
      id="granularity"
      list="granularity-scale"
      min="3"
      max="10"
      aria-valuenow={granularity}
      bind:value={granularity}
      oninput={(event) => {
        const newValue = parseInt(event.currentTarget.value, 10);

        switch (true) {
          case newValue < 5 || Number.isNaN(newValue):
            granularity = 3;
            return;
          case newValue < 10:
            granularity = 5;
            return;
          default:
            granularity = 10;
        }
      }}
    />
    <datalist id="granularity-scale">
      {#each granularityScale as currentGranularity}
        <option value={currentGranularity}></option>
      {/each}
    </datalist>
    <output>{granularity}</output>
  </div>

  <hr />

  {#if $populationQuery.isLoading}
    <p>Querying data</p>
  {/if}
  {#if $populationQuery.isError}
    <p>Error: {$populationQuery.error.message}</p>
  {/if}
  {#if $populationQuery.isSuccess}
    <pre class="pre-wrapped">{JSON.stringify(populationEntries, null, 4)}</pre>
  {/if}
</article>
