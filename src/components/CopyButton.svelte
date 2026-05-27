<script lang="ts">
  import { cn } from '$lib/utils';
  import CopyIcon from '$components/icons/CopyIcon.svelte';
  import CheckIcon from '$components/icons/CheckIcon.svelte';

  let {
    text,
    class: className = '',
  } = $props<{
    text: string;
    class?: string;
  }>();

  let copied = $state(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      // Clipboard unavailable — silently fail
    }
  }
</script>

<button
  data-testid="copy-button"
  type="button"
  onclick={copy}
  class={cn(
    'inline-flex items-center gap-1.5 h-10 px-4 rounded-[--radius-md] text-sm font-medium transition-all duration-[--duration-micro] ease-[--ease-standard]',
    copied
      ? 'bg-success/10 text-success'
      : 'bg-accent text-black hover:bg-accent-hover',
    className,
  )}
>
  {#if copied}
    <CheckIcon class="w-4 h-4" />
    Copied!
  {:else}
    <CopyIcon class="w-4 h-4" />
    Copy
  {/if}
</button>
