<script lang="ts">
  import fetchData from '$lib/fetch-data';
  import { createQuery } from '@tanstack/svelte-query';

  import GranularitySlider from '../components/GranularitySlider/GranularitySlider.svelte';

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
    <GranularitySlider bind:granularity />
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
