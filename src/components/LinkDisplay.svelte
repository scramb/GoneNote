<script lang="ts">
  import { browser } from '$app/environment';
  import { cn } from '$lib/utils';
  import Card from '$components/Card.svelte';
  import CopyButton from '$components/CopyButton.svelte';

  let {
    url,
    class: className = '',
  } = $props<{
    url: string;
    class?: string;
  }>();

  function absoluteUrl(): string {
    if (browser) {
      return new URL(url, window.location.origin).href;
    }
    return url;
  }
</script>

<Card glass={true} padding="lg" class={cn('animate-[slideUp_400ms_ease-[--ease-entrance]_both]', className)}>
  <div class="flex flex-col items-center gap-4">
    <div class="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
      <svg class="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h2 class="text-xl font-semibold text-primary m-0">Note created</h2>
    <p class="text-sm text-secondary m-0">
      Share this link — it will work exactly once.
    </p>
    <div class="w-full flex gap-2">
      <input
        type="text"
        value={absoluteUrl()}
        readonly
        class="flex-1 h-10 px-3 rounded-[--radius-md] bg-surface border border-border text-sm text-primary font-[family-name:var(--font-mono)]"
      />
      <CopyButton text={absoluteUrl()} />
    </div>
  </div>
</Card>
