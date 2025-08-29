<script lang="ts">
  type GranularitySliderProps = {
    granularity: number;
  };

  const granularityScale = [3, 5, 10];

  let { granularity = $bindable() }: GranularitySliderProps = $props();
  $inspect(granularity);
</script>

<label for="granularity">Granularity:</label>
<input
  type="range"
  name="granularity"
  id="granularity"
  list="granularity-scale"
  class="grow"
  min={granularityScale[0]}
  max={granularityScale.at(-1)}
  aria-valuenow={granularity}
  bind:value={() => granularity,
  (newGranularity) => {
    switch (true) {
      case Number.isNaN(newGranularity) || newGranularity < 5:
        granularity = 3;
        return;
      case newGranularity < 10:
        granularity = 5;
        return;
      default:
        granularity = 10;
    }
  }}
/>
<!-- Tickmarks -->
<datalist id="granularity-scale">
  {#each granularityScale as currentGranularity}
    <option value={currentGranularity}></option>
  {/each}
</datalist>
<output class="basis-6 shrink-0 text-right" for="granularity">{granularity}</output>
