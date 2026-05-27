<script lang="ts">
  import type { PageData } from './$types';
  import Container from '$components/Container.svelte';
  import Card from '$components/Card.svelte';
  import StatusAlert from '$components/StatusAlert.svelte';
  import Button from '$components/Button.svelte';

  let { data } = $props<{ data: PageData }>();
</script>

<svelte:head>
  <title>GoneNote — View note</title>
</svelte:head>

<main class="min-h-screen flex items-center justify-center px-4 py-16">
  <Container maxWidth="md">
    {#if data.revealed}
      <!-- Revealed state -->
      <Card padding="lg">
        <pre data-testid="note-content" class="text-[--text-base] font-[family-name:var(--font-mono)] whitespace-pre-wrap break-words m-0 leading-relaxed">{data.content}</pre>
      </Card>

      <div class="mt-8 animate-[fadeIn_400ms_ease-[--ease-entrance]_both]">
        <StatusAlert
          type="success"
          title="Note destroyed"
          message="This note has been permanently deleted and cannot be viewed again."
          actionLabel="Create your own note"
          actionHref="/"
        />
      </div>
    {:else}
      <!-- Unrevealed state -->
      <Card padding="lg">
        <div data-testid="note-waiting" class="text-center space-y-4">
          <p class="text-primary text-lg font-semibold m-0">A note is waiting for you</p>
          <p class="text-secondary text-sm m-0">Click below to reveal it. The note will be destroyed immediately after reading.</p>
        </div>
      </Card>

      <div class="mt-8 flex justify-center">
        <form method="GET">
          <input type="hidden" name="reveal" value="1" />
          <Button type="submit" variant="primary" size="md">
            Reveal Note
          </Button>
        </form>
      </div>
    {/if}
  </Container>
</main>
