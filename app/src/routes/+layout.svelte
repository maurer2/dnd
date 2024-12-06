<script lang="ts">
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

  import '../app.css';

  let { children } = $props();
  const queryClient = new QueryClient();
</script>

<QueryClientProvider client={queryClient}>
  <header role="banner" class="container m-auto">
    <h1>Title</h1>
    <p>Text</p>
  </header>
  <main class="container m-auto">
    {@render children()}
  </main>
</QueryClientProvider>
