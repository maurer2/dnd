<script lang="ts">
  type GraphProps = {
    granularity: number;
    // most recent year first
    entries: Array<{
      idYear: number;
      year: string;
      population: number;
    }>;
  };

  // 1_000 -> 1K, 1_000_000 -> 1M etc.
  let numberFormatterCompactNumbers = Intl.NumberFormat('en-GB', { notation: 'compact' });

  let { granularity, entries: entriesInDescendingOrder }: GraphProps = $props();
  let entries = $derived(
    entriesInDescendingOrder.toSorted((entryA, entryB) => entryA.idYear - entryB.idYear),
  );

  let firstYear = $derived(entries[0]?.idYear ?? 0);
  let lastYear = $derived(entries.at(-1)?.idYear ?? 0);

  let populationList = $derived.by(() => entries.map(({ population }) => population));
  let minPopulation = $derived(Math.min(...populationList));
  let maxPopulation = $derived(Math.max(...populationList));
  let populationDataFiltered = $derived.by(() => {
    const filteredList = entries.reduce(
      (total, current) => {
        const lastIncludedYear = total.at(-1)?.idYear ?? current.idYear;
        const nextNonSkippedYear = lastIncludedYear + granularity; // skip next n entries depending on inverse granularity

        if (current.idYear === nextNonSkippedYear) {
          total.push(current);
        }

        return total;
      },
      [entries[0]],
    );
    const lastEntry = entries.at(-1);

    // always include last year even if it would be skipped to guarantee that there are always at least two entries to draw the graph
    if (lastEntry !== undefined && filteredList.at(-1)?.idYear !== lastEntry?.idYear) {
      return [...filteredList, lastEntry];
    }

    return filteredList;
  });

  // length n + 1 to include last entry at 100% but calculate the other values as if there are only n steps
  let xAxisYearsWithCorrespondingPercentages = $derived.by(() => {
    const steps = lastYear - firstYear;
    const stepSize = 100 / steps;

    const yearWithStepSizeList = Array.from({ length: steps + 1 }, (_, index) => {
      const year = firstYear + index;
      const step = stepSize * index;

      return { [year]: step };
    });

    return Object.assign({}, ...yearWithStepSizeList) as Record<string, typeof steps>;
  });

  let coordinatesOfDotsWithPopulationData = $derived.by(() =>
    populationDataFiltered.map(({ year, population }) => {
      const x =
        year in xAxisYearsWithCorrespondingPercentages
          ? xAxisYearsWithCorrespondingPercentages[year]
          : 0;
      // taken from https://www.mrexcel.com/board/threads/calculate-percentage-when-base-isnt-zero.630157/
      // prettier-ignore
      const y = ((population - minPopulation) / (maxPopulation - minPopulation)) * -100;
      const populationFormatted = numberFormatterCompactNumbers.format(population);

      return { x, y, populationFormatted };
    }),
  );
  let coordinatesOfDotsAsString = $derived(
    coordinatesOfDotsWithPopulationData.map(({ x, y }) => `${x},${y}`).join(' '),
  );
</script>

<!-- adapted from https://svelte.dev/playground/e4c7b25da03b40b7a1cbe2b75840a185?version=5.8.1 -->
<h2 class="text-lg mb-4">Diagram</h2>
<figure class="max-w-sm" aria-live="polite">
  <div class="sr-only">
    <table>
      <caption>US population between between {firstYear} and {lastYear}</caption>
      <thead>
        <tr>
          <th scope="col">Year</th>
          <th scope="col">Population</th>
        </tr>
      </thead>
      <tbody>
        {#each populationDataFiltered as populationDataFilteredEntry}
          <tr>
            <td>{populationDataFilteredEntry.year}</td>
            <td>{numberFormatterCompactNumbers.format(populationDataFilteredEntry.population)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <div class="mb-8">
    <svg viewBox="0 0 300 300" class="overflow-visible ml-12" aria-hidden="true">
      <line x1="0" x2="100%" y1="100%" y2="100%" fill="none" stroke="black" />
      <g transform="translate(0,320)">
        <text x="0" font-size="0.85rem" text-anchor="start">{firstYear}</text>
        <text x="100%" font-size="0.85rem" text-anchor="end">{lastYear}</text>
      </g>

      <line x1="0" x2="0" y1="0" y2="100%" fill="none" stroke="black" dominant-baseline="middle" />
      <g transform="translate(-10,0)">
        <text y="0" font-size="0.85rem" text-anchor="end" dominant-baseline="text-before-edge"
          >{numberFormatterCompactNumbers.format(maxPopulation)}</text
        >
        <text y="100%" font-size="0.85rem" text-anchor="end" dominant-baseline="middle"
          >{numberFormatterCompactNumbers.format(minPopulation)}</text
        >
      </g>

      <g transform="translate(0,300)">
        <svg width="100%" height="100%" viewBox="0 0 100 100" class="overflow-visible">
          <polyline points={coordinatesOfDotsAsString} fill="none" stroke="blue" />
          {#each coordinatesOfDotsWithPopulationData as coordinateRelative}
            <circle cx={coordinateRelative.x} cy={coordinateRelative.y} r="1" fill="black" />
            <!-- Don't show text label, when text label would be rendered on top of the x-axis -->
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
  <figcaption class="text-center">
    Graph of US population between {firstYear} and {lastYear}
  </figcaption>
</figure>
