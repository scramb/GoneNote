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
</script>

<span class={cn('inline-flex items-center gap-3', className)}>
  {#if logoUrl && !imgFailed}
    <img
      data-testid="brand-logo"
      src={logoUrl}
      alt=""
      onerror={() => (imgFailed = true)}
      class="h-8 w-auto"
    />
  {/if}
  <span data-testid="brand-name" class="text-accent font-semibold tracking-tight text-lg">
    {appName}
  </span>
</span>
