<script lang="ts">
  import { cn } from '$lib/utils';

  let {
    name,
    value = '',
    maxlength,
    rows = 8,
    placeholder = '',
    required = false,
    error = '',
    class: className = '',
    oninput,
  } = $props<{
    name: string;
    value: string | undefined;
    maxlength: number;
    rows?: number;
    placeholder?: string;
    required?: boolean;
    error?: string;
    class?: string;
    oninput?: (e: InputEvent) => void;
  }>();
</script>

<div class={cn('w-full', className)}>
  <textarea
    data-testid="note-content"
    {name}
    value={value || ''}
    {maxlength}
    {rows}
    {placeholder}
    {required}
    {oninput}
    class={cn(
      'w-full p-3 sm:p-4 rounded-[--radius-md] bg-surface border text-sm font-[family-name:var(--font-ui)] resize-y transition-all duration-[--duration-standard] ease-[--ease-standard]',
      'text-primary placeholder:text-muted',
      error
        ? 'border-error'
        : 'border-border focus:border-accent focus:shadow-[--shadow-glow]',
    )}
  ></textarea>
  <div class="flex justify-between items-center mt-1">
    {#if error}
      <p data-testid="validation-error" class="text-xs text-error m-0">{error}</p>
    {:else}
      <span></span>
    {/if}
    <span class="text-xs text-muted">{typeof value === 'string' ? value.length : 0} / {maxlength}</span>
  </div>
</div>
