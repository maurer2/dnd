<script lang="ts">
  type GraphProps = {
    granularity: number;
    entries: Array<{
      idYear: number;
      year: string;
      population: number;
    }>;
  };

  // 1_000 -> 1K, 1_000_000 -> 1M etc.
  let numberFormatterCompactNumbers = Intl.NumberFormat('en-GB', { notation: 'compact' });

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

    const oldestEntry = entries.at(-1);

    // make sure the oldest entry/start entry is present to always have at least two entries for the graph
    if (oldestEntry !== undefined && filteredList.at(-1)?.idYear !== oldestEntry?.idYear) {
      return [...filteredList, oldestEntry];
    }

    return filteredList;
  });

  let minPopulationAbsolute = $derived.by(() => {
    return Math.min(...entries.map(({ population }) => population));
  });
  let maxPopulationAbsolute = $derived.by(() => {
    return Math.max(...entries.map(({ population }) => population));
  });
  let firstYearAbsolute = $derived(entries[0]?.idYear ?? 0);
  let lastYearAbsolute = $derived(entries.at(-1)?.idYear ?? 0);

  let xAxisYearsAbsolute = $derived.by(() => {
    const steps = Math.abs(firstYearAbsolute - lastYearAbsolute);
    const stepSize = 100 / steps;
    const yearWithStepSizeList = Array.from({ length: steps + 1 }, (_, index) => {
      const year = lastYearAbsolute + index;
      const step = stepSize * index;

      return { [year]: step };
    });

    return Object.assign({}, ...yearWithStepSizeList);
  });

  const coordinatesRelative = $derived.by(() => {
    const valuesRelative = populationDataFiltered.map(({ year, population }) => {
      const x =
        year in xAxisYearsAbsolute
          ? xAxisYearsAbsolute[year as keyof typeof xAxisYearsAbsolute]
          : 0;
      // taken from https://www.mrexcel.com/board/threads/calculate-percentage-when-base-isnt-zero.630157/
      // prettier-ignore
      const y = ((population - minPopulationAbsolute) / (maxPopulationAbsolute - minPopulationAbsolute)) * -100;
      const populationFormatted = numberFormatterCompactNumbers.format(population);

      return { x, y, populationFormatted };
    });

    return valuesRelative;
  });
  const coordinatesRelativeAsString = $derived(
    coordinatesRelative.map(({ x, y }) => `${x},${y}`).join(' '),
  );
</script>

<!-- adapted from https://svelte.dev/playground/e4c7b25da03b40b7a1cbe2b75840a185?version=5.8.1 -->
<div>
  <h2>Diagram</h2>
  <figure>
    <figcaption>
      Graph of US population between {firstYearAbsolute} and {lastYearAbsolute}
    </figcaption>
    <div class="max-w-sm my-8">
      <svg viewBox="0 0 300 300" class="overflow-visible ml-12">
        <line x1="0" x2="100%" y1="100%" y2="100%" fill="none" stroke="black" />
        <g transform="translate(0,320)">
          <text x="0" font-size="0.85rem" text-anchor="start">{lastYearAbsolute}</text>
          <text x="100%" font-size="0.85rem" text-anchor="end">{firstYearAbsolute}</text>
        </g>

        <line
          x1="0"
          x2="0"
          y1="0"
          y2="100%"
          fill="none"
          stroke="black"
          dominant-baseline="middle"
        />
        <g transform="translate(-10,0)">
          <text y="0" font-size="0.85rem" text-anchor="end" dominant-baseline="text-before-edge"
            >{numberFormatterCompactNumbers.format(maxPopulationAbsolute)}</text
          >
          <text y="100%" font-size="0.85rem" text-anchor="end" dominant-baseline="middle"
            >{numberFormatterCompactNumbers.format(minPopulationAbsolute)}</text
          >
        </g>

        <g transform="translate(0,300)">
          <svg width="100%" height="100%" viewBox="0 0 100 100" class="overflow-visible">
            <polyline points={coordinatesRelativeAsString} fill="none" stroke="blue" />
            {#each coordinatesRelative as coordinateRelative}
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
  </figure>
</div>
