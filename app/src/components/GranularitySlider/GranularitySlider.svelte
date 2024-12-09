<script lang="ts">
  type GranularitySliderProps = {
    granularity: number;
  };

  const granularityScale = [3, 5, 10];

  let { granularity = $bindable() }: GranularitySliderProps = $props();
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
  bind:value={granularity}
  oninput={(event) => {
    const newValue = parseInt(event.currentTarget.value, 10);

    switch (true) {
      case Number.isNaN(newValue) || newValue < 5:
        granularity = 3;
        return;
      case newValue < 10:
        granularity = 5;
        return;
      default:
        granularity = 10;
    }
  }}
/>
<datalist id="granularity-scale">
  {#each granularityScale as currentGranularity}
    <option value={currentGranularity}></option>
  {/each}
</datalist>
<output class="basis-6 shrink-0 text-right">{granularity}</output>
