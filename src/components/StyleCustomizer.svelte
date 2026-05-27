<script lang="ts">
  import { cn } from '$lib/utils';
  import ColorPreview from './ColorPreview.svelte';

  let {
    backgroundColor = null,
    primaryColor = null,
    secondaryColor = null,
    onchange,
    class: className = '',
  } = $props<{
    backgroundColor: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
    onchange?: (colors: {
      backgroundColor: string | null;
      primaryColor: string | null;
      secondaryColor: string | null;
    }) => void;
    class?: string;
  }>();

  let expanded = $state(false);

  function toggle(): void {
    expanded = !expanded;
  }

  function handleChange(field: 'backgroundColor' | 'primaryColor' | 'secondaryColor', value: string): void {
    const colors = {
      backgroundColor,
      primaryColor,
      secondaryColor,
      [field]: value || null,
    };
    onchange?.(colors);
  }
</script>

<div data-testid="style-customizer" class={cn('w-full', className)}>
  <button
    type="button"
    data-testid="style-toggle"
    onclick={toggle}
    class="text-xs text-muted uppercase tracking-wider mb-2 hover:text-secondary transition-colors"
  >
    {expanded ? '▾ Customize Style' : '▸ Customize Style'}
  </button>

  {#if expanded}
    <div data-testid="style-fields" class="space-y-4 p-4 rounded-[--radius-md] bg-surface border border-border">
      <div class="grid grid-cols-3 gap-3">
        <label class="flex flex-col gap-1">
          <span class="text-xs text-muted">Background</span>
          <input
            type="color"
            data-testid="color-bg"
            value={backgroundColor ?? '#0a0a0f'}
            oninput={(e) => handleChange('backgroundColor', e.currentTarget.value)}
            class="w-full h-8 rounded-[--radius-sm] border border-border cursor-pointer"
          />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-xs text-muted">Primary Text</span>
          <input
            type="color"
            data-testid="color-primary"
            value={primaryColor ?? '#e4e4ec'}
            oninput={(e) => handleChange('primaryColor', e.currentTarget.value)}
            class="w-full h-8 rounded-[--radius-sm] border border-border cursor-pointer"
          />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-xs text-muted">Secondary Text</span>
          <input
            type="color"
            data-testid="color-secondary"
            value={secondaryColor ?? '#9494a4'}
            oninput={(e) => handleChange('secondaryColor', e.currentTarget.value)}
            class="w-full h-8 rounded-[--radius-sm] border border-border cursor-pointer"
          />
        </label>
      </div>

      <ColorPreview
        {backgroundColor}
        {primaryColor}
        {secondaryColor}
      />
    </div>
  {/if}
</div>
