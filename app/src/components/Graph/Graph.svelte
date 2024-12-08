<script lang="ts">
  type PopulationDataEntry = {
    idYear: number;
    year: string;
    population: number;
  };

  type GraphProps = {
    granularity: number;
    entries: PopulationDataEntry[];
  };

  let formatterWithShortUnits = Intl.NumberFormat('en-GB', { notation: 'compact' });

  let { granularity, entries }: GraphProps = $props();

  let populationDataFiltered = $derived.by(() => {
    const filteredList = entries.reduce(
      (total, current) => {
        const lastSavedYear = total.at(-1)?.idYear ?? current.idYear;
        const nextYear = lastSavedYear - granularity;

        if (current.idYear === nextYear) {
          total.push(current);
        }

        return total;
      },
      [entries[0]],
    );

    const filteredListWithOldestEntriesLast = [...filteredList];
    const oldestEntry = entries.at(-1);

    if (typeof oldestEntry !== 'undefined') {
      filteredListWithOldestEntriesLast.push(oldestEntry);
    }

    return [...new Set(filteredListWithOldestEntriesLast)];
  });

  let minAbsolutePopulation = $derived.by(() => {
    return Math.min(...entries.map(({ population }) => population));
  });

  let maxAbsolutePopulation = $derived.by(() => {
    return Math.max(...entries.map(({ population }) => population));
  });

  let firstYearAbsolute = $derived(entries[0]?.idYear ?? 0);
  let lastYearAbsolute = $derived(entries.at(-1)?.idYear ?? 0);

  const xAxisMapping = {
    '2013': 0,
    '2014': 11,
    '2015': 22,
    '2016': 33,
    '2017': 44,
    '2018': 55,
    '2019': 66,
    '2020': 77,
    '2021': 88,
    '2022': 100,
  };

  const coordinatesRelative = $derived.by(() => {
    const valuesRelative = populationDataFiltered.map(({ year, population }) => {
      const x = year in xAxisMapping ? xAxisMapping[year as keyof typeof xAxisMapping] : 0;
      // taken from https://www.mrexcel.com/board/threads/calculate-percentage-when-base-isnt-zero.630157/
      // prettier-ignore
      const y = ((population - minAbsolutePopulation) / (maxAbsolutePopulation - minAbsolutePopulation)) * -100;
      const populationFormatted = formatterWithShortUnits.format(population);

      return { x, y, populationFormatted };
    });

    return valuesRelative;
  });
  const coordinatesRelativeAsString = $derived(
    coordinatesRelative.map(({ x, y }) => `${x},${y}`).join(' '),
  );
</script>

<!-- adapted from https://svelte.dev/playground/e4c7b25da03b40b7a1cbe2b75840a185?version=5.8.1 -->
<figure>
  <div class="max-w-sm my-8">
    <svg viewBox="0 0 300 300" class="overflow-visible ml-12">
      <line x1="0" x2="100%" y1="100%" y2="100%" fill="none" stroke="black" />
      <g transform="translate(0,320)">
        <text x="0" font-size="0.85rem" text-anchor="start">{lastYearAbsolute}</text>
        <text x="100%" font-size="0.85rem" text-anchor="end">{firstYearAbsolute}</text>
      </g>

      <line x1="0" x2="0" y1="0" y2="100%" fill="none" stroke="black" dominant-baseline="middle" />
      <g transform="translate(-10,0)">
        <text y="0" font-size="0.85rem" text-anchor="end" dominant-baseline="text-before-edge"
          >{formatterWithShortUnits.format(maxAbsolutePopulation)}</text
        >
        <text y="100%" font-size="0.85rem" text-anchor="end" dominant-baseline="middle"
          >{formatterWithShortUnits.format(minAbsolutePopulation)}</text
        >
      </g>

      <g transform="translate(0,300)">
        <svg width="100%" height="100%" viewBox="0 0 100 100" class="overflow-visible">
          <polyline points={coordinatesRelativeAsString} fill="none" stroke="blue" />
          {#each coordinatesRelative as coordinateRelative}
            <circle cx={coordinateRelative.x} cy={coordinateRelative.y} r="1" fill="black" />
            {#if coordinateRelative.y < 0}
              <text
                x={coordinateRelative.x + 5}
                y={coordinateRelative.y}
                stroke="none"
                font-size="0.25rem"
                dominant-baseline="middle"
                text-anchor="start">{coordinateRelative.populationFormatted}</text
              >
            {/if}
          {/each}
        </svg>
      </g>
    </svg>
  </div>
  <figcaption>Graph</figcaption>
</figure>
