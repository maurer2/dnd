<script lang="ts">
  import fetchData from '$lib/fetch-data';
  import offlineData from '$lib/offline-data.json';
  import { createQuery } from '@tanstack/svelte-query';
  import { LoaderCircle } from 'lucide-svelte';
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
    // queryFn: async () =>
    // await fetchData('https://datausa.io/api/data?drilldowns=Nation&measures=Population'), // offline
    // https://datausa.io/about/api/
    // https://community.postman.com/t/how-to-filter-or-retrieve-from-a-response/71346
    queryFn: async () => Promise.resolve(offlineData),
    staleTime: 1000 * 60 * 5, // 5
    retry: 1,
    refetchOnWindowFocus: false,
  });

  let granularity = $state(3);
</script>

<article>
  <div class="bg-blue-50 p-4 border-b border-blue-100">
    <div class="container mx-auto">
      <h2 id="filter-section-title" class="text-lg">Filters</h2>
      <ul aria-describedby="filter-section-title" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <li class="flex gap-4">
          <GranularitySlider bind:granularity />
        </li>
      </ul>
    </div>
  </div>

  <section class="p-4">
    <div class="container mx-auto">
      {#if $populationQuery.isLoading}
        <div aria-live="polite" role="status" aria-label="Loading graph data">
          <LoaderCircle aria-hidden class="motion-safe:animate-spin" />
        </div>
      {/if}
      {#if $populationQuery.isError}
        <p>Data can't be loaded: {$populationQuery.error.message}</p>
      {/if}
      {#if $populationQuery.isSuccess}
        <Graph entries={$populationQuery.data} {granularity} />
      {/if}
    </div>
  </section>
</article>
