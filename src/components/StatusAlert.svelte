<script lang="ts">
  import { cn } from '$lib/utils';
  import AlertIcon from '$components/icons/AlertIcon.svelte';
  import LockIcon from '$components/icons/LockIcon.svelte';
  import Button from '$components/Button.svelte';

  let {
    type,
    title,
    message,
    actionLabel = '',
    actionHref = '',
    primaryColor = null,
    secondaryColor = null,
    class: className = '',
  } = $props<{
    type: 'success' | 'info' | 'error';
    title: string;
    message: string;
    actionLabel?: string;
    actionHref?: string;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    class?: string;
  }>();

  const iconColors: Record<string, string> = {
    success: 'text-success',
    info: 'text-secondary',
    error: 'text-error',
  };

  const bgColors: Record<string, string> = {
    success: 'bg-success/5 border-success/10',
    info: 'bg-surface border-border',
    error: 'bg-error-bg border-error/10',
  };
</script>

<div
  data-testid={type === 'success' ? 'note-destroyed' : 'error-state'}
  class={cn(
    'flex flex-col items-center gap-3 p-8 rounded-[--radius-lg] border text-center',
    bgColors[type],
    className,
  )}
>
  <div class="w-12 h-12 rounded-full bg-elevated flex items-center justify-center">
    {#if type === 'success'}
      <LockIcon data-testid="lock-icon" class={cn('w-5 h-5', iconColors[type])} />
    {:else}
      <AlertIcon class={cn('w-5 h-5', iconColors[type])} />
    {/if}
  </div>
  <h2
    class={cn('text-xl font-semibold m-0', type === 'error' && !primaryColor ? 'text-error' : 'text-primary')}
    style={primaryColor ? `color: ${primaryColor}` : undefined}
  >
    {title}
  </h2>
  <p class="text-sm m-0 max-w-sm" style={secondaryColor ? `color: ${secondaryColor}` : 'color: var(--color-secondary)'}>{message}</p>
  {#if actionLabel && actionHref}
    <a href={actionHref} class="mt-2">
      <Button variant="ghost" size="sm">{actionLabel}</Button>
    </a>
  {/if}
</div>
