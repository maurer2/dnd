<script lang="ts">
  type GraphProps = {
    values: number[];
  };

  const data = [
    { x: 0, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 3 },
  ];

  let { values }: GraphProps = $props();

  let formatterWithShortUnits = Intl.NumberFormat('en', { notation: 'compact' });

  let max = 311536594;
  let min = 331097593;
</script>

<!-- https://svelte.dev/playground/e4c7b25da03b40b7a1cbe2b75840a185?version=5.8.1 -->
<div class="w-full max-w-lg">
  <svg viewBox="0 0 300 300" class="overflow-visible m-16">
    <line x1="0" x2="100%" y1="100%" y2="100%" fill="none" stroke="black" />
    <g transform="translate(0,320)">
      <text x="0" font-size="0.75em" text-anchor="middle">2022</text>
      <text x="50%" font-size="0.75em" text-anchor="middle">2018</text>
      <text x="100%" font-size="0.75em" text-anchor="middle">2013</text>
    </g>

    <line x1="0" x2="0" y1="0" y2="100%" fill="none" stroke="black" dominant-baseline="middle" />
    <g transform="translate(-10,0)">
      <text y="100%" font-size="0.75em" text-anchor="end" dominant-baseline="middle"
        >{formatterWithShortUnits.format(311536594)}</text
      >
      <text y="50%" font-size="0.75em" text-anchor="end" dominant-baseline="middle"
        >{formatterWithShortUnits.format(321317094)}</text
      >
      <text y="0" font-size="0.75em" text-anchor="end" dominant-baseline="middle"
        >{formatterWithShortUnits.format(331097593)}</text
      >
    </g>

    <g transform="translate(0,300)">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        class="overflow-visible"
        vector-effect="non-scaling-stroke"
      >
        <polyline points="0,0 40,-100 100,-100" fill="none" stroke="red" />
        <circle cx="0" cy="0" r="1" fill="black" />
        <circle cx="40" cy="-100" r="1" fill="black" />
        <circle cx="100" cy="-100" r="1" fill="black" />
      </svg>
    </g>
  </svg>
</div>
