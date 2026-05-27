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
  </Container>
</main>
