<script lang="ts">
  import { cn } from '$lib/utils';

  let {
    name,
    value = $bindable(''),
    options,
    class: className = '',
    onchange,
  } = $props<{
    name: string;
    value?: string;
    options: Array<{ value: string; label: string }>;
    class?: string;
    onchange?: (value: string) => void;
  }>();
</script>

<fieldset data-testid="ttl-selector" class={cn('flex flex-wrap gap-2 justify-center', className)}>
  {#each options as opt}
    <label
      class={cn(
        'relative px-4 py-2 rounded-[--radius-md] text-sm cursor-pointer transition-all duration-[--duration-standard] ease-[--ease-standard] select-none',
        value === opt.value
          ? 'bg-accent/15 text-accent ring-1 ring-accent/30'
          : 'bg-surface text-secondary hover:text-primary hover:bg-elevated',
      )}
    >
      <input
        type="radio"
        {name}
        value={opt.value}
        checked={value === opt.value}
        onchange={() => { value = opt.value; onchange?.(opt.value); }}
        class="sr-only"
      />
      {opt.label}
    </label>
  {/each}
</fieldset>
