<script lang="ts">
  import { cn } from '$lib/utils';

  let {
    appName,
    logoUrl,
    class: className = '',
  } = $props<{
    appName: string;
    logoUrl: string | null;
    class?: string;
  }>();

  let imgFailed = $state(false);
  const showFallback = $derived(!logoUrl || imgFailed);
</script>

{#if showFallback}
  <span data-testid="brand-name" class={cn('text-accent font-semibold tracking-tight text-lg', className)}>
    {appName}
  </span>
{:else}
  <img
    data-testid="brand-logo"
    src={logoUrl!}
    alt={appName}
    onerror={() => (imgFailed = true)}
    class={cn('h-8 w-auto', className)}
  />
{/if}
