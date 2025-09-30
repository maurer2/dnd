<script lang="ts">
  // import fetchData from '$lib/fetch-data';
  import offlineData from '$lib/offline-data.json';
  import { createQuery } from '@tanstack/svelte-query';
  import { LoaderCircle } from 'lucide-svelte';
  import type { ComponentProps } from 'svelte';
  import z from 'zod';

  import GranularitySlider from '../components/GranularitySlider/GranularitySlider.svelte';
  import Graph from '../components/Graph/Graph.svelte';

  type GraphProps = ComponentProps<typeof Graph>;
  type PopulationDataEntries = GraphProps['entries'];

  const populationDataEntrySchema = z
    .looseObject({
      'ID Nation': z.string(),
      'ID Year': z.number(),
      Nation: z.string(),
      Population: z.number(),
      'Slug Nation': z.string(),
      Year: z.string(),
    })
    .transform((entry) => ({
      idYear: entry['ID Year'],
      year: entry.Year,
      population: entry.Population,
    }));

  const populationDataSchema = z
    .looseObject({
      data: z.array(populationDataEntrySchema),
    })
    .transform(({ data }) => {
      return data.toSorted((entryA, entryB) => entryA.idYear - entryB.idYear);
    });

  type PopulationDataEntrySchemaInput = z.input<typeof populationDataEntrySchema>;
  type PopulationDataEntrySchema = z.output<typeof populationDataEntrySchema>;
  type PopulationDataSchemaInput = z.input<typeof populationDataSchema>;
  type PopulationDataSchema = z.output<typeof populationDataSchema>;

  const populationQuery = createQuery(() => ({
    queryKey: ['nation-population'],
    select: (response): PopulationDataEntries => {
      const populationDataSchemaParsed = populationDataSchema.safeParse(response);

      if (populationDataSchemaParsed.success) {
        return populationDataSchemaParsed.data;
      }

      return [];
    },
    // queryFn: async () =>
    // await fetchData('https://datausa.io/api/data?drilldowns=Nation&measures=Population'), // offline
    // https://datausa.io/about/api/
    // https://community.postman.com/t/how-to-filter-or-retrieve-from-a-response/71346
    queryFn: async () => Promise.resolve(offlineData),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  }));

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
      {#if populationQuery.isLoading}
        <div aria-live="polite" role="status" aria-label="Loading graph data">
          <LoaderCircle aria-hidden class="motion-safe:animate-spin" />
        </div>
      {/if}
      {#if populationQuery.isError}
        <p>Data can't be loaded: {populationQuery.error.message}</p>
      {/if}
      {#if populationQuery.isSuccess}
        <Graph entries={populationQuery.data} {granularity} />
      {/if}
    </div>
  </section>
</article>
