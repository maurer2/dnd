<script lang="ts">
  import fetchData from '$lib/fetch-data';
  import { createQuery } from '@tanstack/svelte-query';

  import GranularitySlider from '../components/GranularitySlider/GranularitySlider.svelte';
  import Graph from '../components/Graph/Graph.svelte';

  type PopulationDataEntryRaw = {
    'ID Nation': string;
    Nation: string;
    'ID Year': number;
    Year: string;
    Population: number;
    'Slug Nation': string;
  };

  type PopulationDataEntry = {
    idYear: PopulationDataEntryRaw['ID Year'];
    year: PopulationDataEntryRaw['Year'];
    population: PopulationDataEntryRaw['Population'];
  };

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
        const dataRaw = response.data as PopulationDataEntryRaw[];
        const dataPretty: PopulationDataEntry[] = dataRaw.map((entry) => ({
          idYear: entry['ID Year'],
          year: entry.Year,
          population: entry.Population,
        }));

        return dataPretty;
      }
      return [];
    },
    queryFn: async () =>
      await fetchData('https://datausa.io/api/data?drilldowns=Nation&measures=Population'),
  });

  let granularity = $state(3);
</script>

<article>
  <h2>PopulationQuery</h2>

  <GranularitySlider bind:granularity />

  <hr />

  <div>
    {#if $populationQuery.isLoading}
      <p>Querying data</p>
    {/if}
    {#if $populationQuery.isError}
      <p>Data can't be loaded: {$populationQuery.error.message}</p>
    {/if}
    {#if $populationQuery.isSuccess}
      <Graph entries={$populationQuery.data} {granularity} />
    {/if}
  </div>
</article>
