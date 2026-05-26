<script lang="ts">
  import { cn } from '$lib/utils';

  let {
    glass = false,
    hover = false,
    padding = 'md',
    class: className = '',
    children,
  } = $props<{
    glass?: boolean;
    hover?: boolean;
    padding?: 'md' | 'lg';
    class?: string;
    children: import('svelte').Snippet;
  }>();

  const base = 'rounded-[--radius-lg] border border-border';

  function surfaceStyles(): string {
    return glass
      ? 'glass-surface'
      : 'bg-surface shadow-[--shadow-md]';
  }

  const paddingSizes: Record<string, string> = {
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };
</script>

<div
  class={cn(
    base,
    surfaceStyles(),
    paddingSizes[padding],
    hover &&
      'transition-all duration-[--duration-standard] ease-[--ease-standard] hover:-translate-y-0.5 hover:shadow-[--shadow-lg]',
    className,
  )}
>
  {@render children()}
</div>
