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
  let populationDataFiltered = $derived.by(() => {
    if (!$populationQuery.data?.length) {
      return [];
    }

    const filteredList = $populationQuery.data.reduce(
      (total, current) => {
        const lastSavedYear = total.at(-1)?.idYear ?? current.idYear;
        const nextYear = lastSavedYear - granularity;

        if (current.idYear === nextYear) {
          total.push(current);
        }

        return total;
      },
      [$populationQuery.data[0]],
    );

    const filteredListWithOldestEntriesLast = [...filteredList];
    const oldestEntry = $populationQuery.data.at(-1);

    if (typeof oldestEntry !== 'undefined') {
      filteredListWithOldestEntriesLast.push(oldestEntry);
    }

    return [...new Set(filteredListWithOldestEntriesLast)];
  });
  let minAbsolutePopulation = $derived.by(() => {
    if (!$populationQuery.data?.length) {
      return 0;
    }

    return Math.min(...$populationQuery.data.map(({ population }) => population));
  });

  let maxAbsolutePopulation = $derived.by(() => {
    if (!$populationQuery.data?.length) {
      return 0;
    }

    return Math.max(...$populationQuery.data.map(({ population }) => population));
  });

  let firstYearAbsolute = $derived.by(() => {
    if (!$populationQuery.data?.length) {
      return 0;
    }

    return $populationQuery.data[0].idYear;
  });

  let lastYearAbsolute = $derived.by(() => {
    if (!$populationQuery.data?.length) {
      return 0;
    }

    return $populationQuery.data.at(-1)?.idYear ?? 0;
  });
</script>

<article>
  <h2>PopulationQuery</h2>

  <div>
    <GranularitySlider bind:granularity />
  </div>

  <hr />

  <div>
    {#if $populationQuery.isLoading}
      <p>Querying data</p>
    {/if}
    {#if $populationQuery.isError}
      <p>Data can't be loaded: {$populationQuery.error.message}</p>
    {/if}
    {#if $populationQuery.isSuccess}
      <Graph
        values={populationDataFiltered}
        {minAbsolutePopulation}
        {maxAbsolutePopulation}
        {firstYearAbsolute}
        {lastYearAbsolute}
      />

      <pre class="pre-wrapped">{JSON.stringify(populationDataFiltered, null, 4)}</pre>
    {/if}
  </div>
</article>
