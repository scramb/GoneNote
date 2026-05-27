<script lang="ts">
  import { cn } from '$lib/utils';

  let {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    type = 'button',
    class: className = '',
    onclick,
    children,
    ...rest
  } = $props<{
    variant?: 'primary' | 'ghost';
    size?: 'sm' | 'md';
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit';
    class?: string;
    onclick?: (e: MouseEvent) => void;
    children: import('svelte').Snippet;
    [key: string]: unknown;
  }>();

  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-[--radius-md] transition-all duration-[--duration-micro] ease-[--ease-standard] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const variants: Record<string, string> = {
    primary:
      'bg-accent text-black hover:bg-accent-hover shadow-[--shadow-sm]',
    ghost:
      'bg-transparent text-secondary hover:text-primary hover:bg-elevated',
  };

  const sizes: Record<string, string> = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-5 text-sm',
  };
</script>

<button
  data-testid="submit-note"
  {type}
  {disabled}
  class={cn(base, variants[variant], sizes[size], loading && 'cursor-wait', className)}
  {onclick}
  {...rest}
>
  {#if loading}
    <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  {/if}
  {@render children()}
</button>
