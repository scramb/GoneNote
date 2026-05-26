<script lang="ts">
  import { cn } from '$lib/utils';

  let {
    maxWidth = 'md',
    centered = true,
    class: className = '',
    children,
  } = $props<{
    maxWidth?: 'sm' | 'md' | 'lg';
    centered?: boolean;
    class?: string;
    children: import('svelte').Snippet;
  }>();

  const maxWidths: Record<string, string> = {
    sm: 'max-w-[480px]',
    md: 'max-w-[640px]',
    lg: 'max-w-[720px]',
  };
</script>

<div
  class={cn(
    'mx-auto px-4 sm:px-6',
    maxWidths[maxWidth],
    centered && 'text-center',
    className,
  )}
>
  {@render children()}
</div>
