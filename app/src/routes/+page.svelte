<script lang="ts">
  import fetchData from '$lib/fetch-data';
  import { createQuery } from '@tanstack/svelte-query';

  // todo: migrate to runes once supported in tanstack query: https://github.com/TanStack/query/discussions/7413
  // let selectionWindow = $state(0);

  let selectionWindow = 0;

  $: nationPopulationQuery = createQuery({
    queryKey: ['nation-population', selectionWindow],
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
    queryFn: async () => {
      const year = 2022 - selectionWindow;

      const results = await fetchData(
        `https://datausa.io/api/data?drilldowns=Nation&measures=Population&year=${year}`,
      );
      return results;
    },
  });
</script>

<article>
  <h2>nationPopulationQuery</h2>

  <button onclick={() => selectionWindow++}>Fetch previous year</button>

  <hr />

  {#if $nationPopulationQuery.isLoading}
    <p>Querying data for {selectionWindow}</p>
  {/if}
  {#if $nationPopulationQuery.isError}
    <p>Error: {$nationPopulationQuery.error.message}</p>
  {/if}
  {#if $nationPopulationQuery.isSuccess}
    <pre class="pre-wrapped">{JSON.stringify($nationPopulationQuery.data, null, 4)}</pre>
  {/if}
</article>
