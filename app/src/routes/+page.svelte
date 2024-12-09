<script lang="ts">
  import fetchData from '$lib/fetch-data';
  import { createQuery } from '@tanstack/svelte-query';
  import type { ComponentProps } from 'svelte';

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
  type GraphProps = ComponentProps<typeof Graph>;
  type PopulationDataEntry = GraphProps['entries'][number];

  // todo: migrate to runes once supported in tanstack query: https://github.com/TanStack/query/discussions/7413
  const populationQuery = createQuery({
    queryKey: ['nation-population'],
    select: (response) => {
      // todo: use zod instead
      if (
        response !== null &&
        typeof response == 'object' &&
        !Array.isArray(response) &&
        'data' in response &&
        Array.isArray(response.data)
      ) {
        const dataRaw = response.data as PopulationDataEntryRaw[];
        const dataPretty = dataRaw.map((entry) => ({
          idYear: entry['ID Year'],
          year: entry.Year,
          population: entry.Population,
        })) satisfies PopulationDataEntry[];

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
