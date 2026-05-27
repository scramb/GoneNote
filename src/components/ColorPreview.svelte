<script lang="ts">
  import { cn } from '$lib/utils';

  let {
    backgroundColor = null,
    primaryColor = null,
    secondaryColor = null,
    class: className = '',
  } = $props<{
    backgroundColor: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
    class?: string;
  }>();

  // Default theme fallbacks
  const defaultBg = '#0a0a0f';
  const defaultPrimary = '#e4e4ec';
  const defaultSecondary = '#9494a4';

  const bg = backgroundColor ?? defaultBg;
  const fg = primaryColor ?? defaultPrimary;
  const muted = secondaryColor ?? defaultSecondary;

  // WCAG relative luminance
  function luminance(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  }

  function contrastRatio(hex1: string, hex2: string): number {
    const l1 = luminance(hex1);
    const l2 = luminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  const ratio = contrastRatio(bg, fg);
  const showWarning = $derived(ratio < 3.0);
</script>

<div
  data-testid="color-preview"
  style="background: {bg}; color: {fg}"
  class={cn('rounded-[--radius-md] border border-border p-4 space-y-2', className)}
>
  <p
    data-testid="preview-primary"
    class="text-sm font-semibold m-0"
    style="color: {fg}"
  >
    Primary text preview
  </p>
  <p
    data-testid="preview-secondary"
    class="text-xs m-0"
    style="color: {muted}"
  >
    Secondary text preview
  </p>
  {#if showWarning}
    <p data-testid="contrast-warning" class="text-xs text-[--color-error] m-0">
      Low contrast ({(ratio * 100) / 100}:1) — text may be hard to read
    </p>
  {/if}
</div>
