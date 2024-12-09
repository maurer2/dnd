<script lang="ts">
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import { Users } from 'lucide-svelte';

  import '../app.css';

  let { children } = $props();

  const queryClient = new QueryClient();
</script>

<QueryClientProvider client={queryClient}>
  <header class="bg-blue-700 text-white p-4">
    <div class="container mx-auto">
      <h1 class="flex gap-4 items-center">
        <Users aria-hidden="true" size="32" />
        <span class="text-xl">We the People</span>
      </h1>
    </div>
  </header>
  <main>
    {@render children()}
  </main>
</QueryClientProvider>
